// --- Custom Error Classes ---
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

class ServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(message, 500);
    this.name = "ServerError";
  }
}

class NetworkError extends Error {
  constructor(message = "Network error, please check your connection") {
    super(message);
    this.name = "NetworkError";
  }
}

// --- API Service Implementation ---
class ApiService {
  constructor() {
    const envUrl = import.meta.env.VITE_API_URL;
    if (!envUrl) {
      console.warn(
        "⚠️ VITE_API_URL is not set. API calls will fail. Set it in .env or vite config."
      );
    }
    this.baseURL = envUrl || "http://localhost:4000/api/v1";
    this.defaultHeader = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // State for handling token refresh
    this.isRefreshing = false;
    this.failedQueue = [];
    this.refreshAttempts = 0;
    this.MAX_REFRESH_ATTEMPTS = 3;

    // Retry configuration for transient errors
    this.MAX_RETRIES = 2;
    this.RETRY_DELAY_MS = 1000;
  }

  /**
   * Sleep helper for exponential backoff
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Processes all queued requests after a successful token refresh.
   */
  processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  /**
   * The main fetch wrapper with interceptor logic, retry with exponential backoff,
   * and token refresh handling.
   */
  async customFetch(endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = { ...this.defaultHeader, ...options.headers };

    if (options.body instanceof FormData) {
      delete headers["Content-Type"];
    }

    const config = {
      ...options,
      headers,
      credentials: "include",
      signal: options.signal, // Support AbortController signals
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: response.statusText };
        }

        // --- Token Refresh Interceptor ---
        if (response.status === 401 && !endpoint.includes("/auth/refresh")) {
          if (this.refreshAttempts >= this.MAX_REFRESH_ATTEMPTS) {
            this.refreshAttempts = 0;
            throw new ApiError("Session expired. Please log in again.", 401);
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve: () => {
                  fetch(url, config)
                    .then((res) => res.json())
                    .then((data) => resolve(data))
                    .catch((err) => reject(err));
                },
                reject: (err) => reject(err),
              });
            });
          }

          this.isRefreshing = true;
          this.refreshAttempts += 1;

          try {
            await this.refreshSession();
            this.processQueue(null);
            this.refreshAttempts = 0;

            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) {
              throw new ApiError(errorData.message || "Retry failed", retryResponse.status);
            }
            return await retryResponse.json();
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.refreshAttempts = 0;
            console.error("Session refresh failed. User must log in again.");

            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
              window.location.href = "/login?session=expired";
            }
            throw new ApiError("Session expired. Please log in again.", 401);
          } finally {
            this.isRefreshing = false;
          }
        }

        // --- Retry 5xx errors with exponential backoff ---
        if (response.status >= 500 && retryCount < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY_MS * Math.pow(2, retryCount);
          console.warn(`⚠️ Server error ${response.status}, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
          await this._sleep(delay);
          return this.customFetch(endpoint, options, retryCount + 1);
        }

        // Standard error handling for non-retriable errors
        if (response.status === 404) {
          throw new NotFoundError(errorData.message);
        }
        throw new ApiError(
          errorData.message || "An API error occurred",
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      // Handle network errors with retry
      if (error instanceof TypeError && error.name === "TypeError" && retryCount < this.MAX_RETRIES) {
        const delay = this.RETRY_DELAY_MS * Math.pow(2, retryCount);
        console.warn(`⚠️ Network error, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
        await this._sleep(delay);
        return this.customFetch(endpoint, options, retryCount + 1);
      }

      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === "AbortError") {
        throw error; // Propagate abort errors for cleanup
      }
      console.error("Network Error:", error);
      throw new NetworkError(error.message || "Network error, please check your connection");
    }
  }

  // --- Auth Methods ---
  async signup(username, fullname, password, email, role, avatar) {
    return await this.customFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        password,
        fullname,
        role,
        avatar,
      }),
    });
  }

  async login(identifier, password) {
    return await this.customFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
  }

  async getUserProfile() {
    return await this.customFetch("/auth/me", {
      method: "GET",
    });
  }

  async updateProfile(profileData) {
    return await this.customFetch("/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async deleteAccount() {
    return await this.customFetch("/auth/delete-account", {
      method: "DELETE",
    });
  }

  async logout() {
    return await this.customFetch("/auth/logout", {
      method: "POST",
    });
  }

  async forgetPassword(email) {
    return await this.customFetch("/auth/forget-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(password, token) {
    return await this.customFetch(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  }

  async verifyEmail(token) {
    return await this.customFetch(`/auth/verify/${token}`, {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }
  async resendVerifyEmail(email) {
    return await this.customFetch("/auth/resend-verify-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async refreshSession() {
    return await this.customFetch("/auth/refresh-token", {
      method: "POST",
    });
  }

  async updateAvatar(formData) {
    return await this.customFetch("/auth/update-avatar", {
      method: "PUT",
      body: formData, // FormData is handled by customFetch
    });
  }

  // --- Project Methods ---
  async getAllProjects() {
    return await this.customFetch("/projects/all-projects", {
      method: "GET",
    });
  }

  async createProject(name, description) {
    return await this.customFetch("/projects/create", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  }

  async getProjectById(projectId) {
    return await this.customFetch(`/projects/get-project-by-id/${projectId}`, {
      method: "GET",
    });
  }

  async updateProject(projectId, projectData) {
    return await this.customFetch(`/projects/update/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    });
  }

  // --- Task Methods ---
  async getTasksByProjectId(projectId) {
    return await this.customFetch(`/tasks/${projectId}`, {
      method: "GET",
    });
  }

  async createTask(projectId, taskData) {
    return await this.customFetch(`/tasks/${projectId}`, {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(projectId, taskId, taskData) {
    return await this.customFetch(`/tasks/${projectId}/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  }

  async getTaskById(projectId, taskId) {
    return await this.customFetch(`/tasks/${projectId}/${taskId}`, {
      method: "GET",
    });
  }

  async getAllTaskOfUser() {
    return await this.customFetch(`/tasks/tasks`, {
      method: "GET",
    });
  }

  async deleteTask(projectId, taskId) {
    return await this.customFetch(`/tasks/${projectId}/${taskId}`, {
      method: "DELETE",
    });
  }

  async deleteComment(projectId, taskId, commentId) {
    return await this.customFetch(`/tasks/${projectId}/${taskId}/comments/${commentId}`, {
      method: "DELETE",
    });
  }

  async uploadAttachment(projectId, taskId, formData) {
    return await this.customFetch(`/tasks/${projectId}/${taskId}/attachments`, {
      method: "POST",
      body: formData,
    });
  }

  async deleteAttachment(projectId, taskId, attachmentIndex) {
    return await this.customFetch(`/tasks/${projectId}/${taskId}/attachments/${attachmentIndex}`, {
      method: "DELETE",
    });
  }

  // --- Member Methods ---
  async getAllMembers(projectId) {
    return await this.customFetch(`/members/all-members/${projectId}`, {
      method: "GET",
    });
  }

  async addMember(projectId, email, role) {
    return await this.customFetch(`/members/add/${projectId}`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  }

  async removeMember(projectId, userId) {
    return await this.customFetch(`/members/remove/${projectId}`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  // --- Sub-task Methods ---
  async getSubTasksForTask(taskId) {
    return await this.customFetch(`/subtasks/${taskId}`, {
      method: "GET",
    });
  }

  async createSubTask(taskId, title) {
    return await this.customFetch(`/subtasks/${taskId}`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  }

  async updateSubTask(subtaskId, subtaskData) {
    return await this.customFetch(`/subtasks/subtask/${subtaskId}`, {
      method: "PUT",
      body: JSON.stringify(subtaskData),
    });
  }

  async deleteSubTask(subtaskId) {
    return await this.customFetch(`/subtasks/subtask/${subtaskId}`, {
      method: "DELETE",
    });
  }

  // --- Sprint Methods ---
  async createSprint(sprintData) {
    return await this.customFetch("/sprints", {
      method: "POST",
      body: JSON.stringify(sprintData),
    });
  }

  async getSprintsByProject(projectId) {
    return await this.customFetch(`/sprints/project/${projectId}`, {
      method: "GET",
    });
  }

  async getBacklog(projectId) {
    return await this.customFetch(`/sprints/project/${projectId}/backlog`, {
      method: "GET",
    });
  }

  async updateSprint(sprintId, sprintData) {
    return await this.customFetch(`/sprints/${sprintId}`, {
      method: "PUT",
      body: JSON.stringify(sprintData),
    });
  }

  async startSprint(sprintId, projectId) {
    return await this.customFetch(`/sprints/${sprintId}/start`, {
      method: "PUT",
      body: JSON.stringify({ projectId }),
    });
  }

  async completeSprint(sprintId, moveTasksTo) {
    return await this.customFetch(`/sprints/${sprintId}/complete`, {
      method: "PUT",
      body: JSON.stringify({ moveTasksTo }),
    });
  }

  async assignTaskToSprint(sprintId, taskId) {
    return await this.customFetch(`/sprints/${sprintId}/assign-task`, {
      method: "PUT",
      body: JSON.stringify({ taskId }),
    });
  }

  async removeTaskFromSprint(taskId) {
    return await this.customFetch(`/sprints/task/${taskId}/remove-from-sprint`, {
      method: "PUT",
    });
  }

  async getSprintVelocity(projectId) {
    return await this.customFetch(`/sprints/project/${projectId}/velocity`, {
      method: "GET",
    });
  }

  // --- Admin Dashboard Methods ---
  async getAdminStats() {
    return await this.customFetch("/dashboard/admin/stats", { method: "GET" });
  }

  async getAdminWeeklyStats() {
    return await this.customFetch("/dashboard/admin/weekly-stats", {
      method: "GET",
    });
  }

  async getAdminProjectProgress() {
    return await this.customFetch("/dashboard/admin/projects", {
      method: "GET",
    });
  }

  async getAdminRecentTasks() {
    return await this.customFetch("/dashboard/admin/recent-tasks", {
      method: "GET",
    });
  }

  async getAdminAllUsers() {
    return await this.customFetch("/dashboard/admin/users", {
      method: "GET",
    });
  }

  async getAdminTaskDistribution() {
    return await this.customFetch("/dashboard/admin/task-distribution", {
      method: "GET",
    });
  }
}

// Export a single instance
const apiService = new ApiService();
export default apiService;

