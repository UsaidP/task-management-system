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
    this.baseURL = "/api/v1";
    this.defaultHeader = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // State for handling token refresh
    this.isRefreshing = false;
    this.failedQueue = [];
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
   * The main fetch wrapper with interceptor logic.
   */
  async customFetch(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = { ...this.defaultHeader, ...options.headers };

    if (options.body instanceof FormData) {
      delete headers["Content-Type"];
    }

    const config = {
      ...options,
      headers,
      credentials: "include", // ✅ Ensures cookies are sent
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

        // --- 🚀 START: Token Refresh Interceptor Logic ---
        if (response.status === 401 && endpoint !== "/users/refresh-token") {
          
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve: () => {
fetch(url, config)
                    .then(res => res.json())
                    .then(data => resolve(data))
                    .catch(err => reject(err));
                },
                reject: (err) => reject(err),
              });
            });
          }

          // This is the first 401, start refreshing
          this.isRefreshing = true;

          try {
            // 1. Attempt to get a new access token
            await this.refreshSession();
            
            // 2. Success: Process the queue and resolve them
            this.processQueue(null);

            // 3. Retry the original request
            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) {
              throw new ApiError(errorData.message || "Retry failed", retryResponse.status);
            }
            return await retryResponse.json();

          } catch (refreshError) {
            // 4. Refresh Failed: This is a hard logout.
            this.processQueue(refreshError);
            
            // TODO: You should trigger a global logout state here
            // e.g., (if using a state manager) store.dispatch(logoutUser());
            // e.g., (simple) window.location.href = '/login';
            console.error("Session refresh failed. User must log in again.");

            throw new ApiError("Session expired. Please log in again.", 401);
          } finally {
            this.isRefreshing = false;
          }
        }
        // --- 🚀 END: Token Refresh Interceptor Logic ---


        // Standard error handling for other errors
        if (response.status === 404) {
          throw new NotFoundError(errorData.message);
        }
        if (response.status >= 500) {
          throw new ServerError(errorData.message);
        }
        throw new ApiError(
          errorData.message || "An API error occurred",
          response.status
        );
      }

      // If response was 'ok' in the first place
      return await response.json();
    } catch (error) {
      // Handle network errors or errors from the interceptor logic
      if (error instanceof ApiError) {
        throw error; // Re-throw custom API errors
      }
      console.error("Network Error:", error);
      throw new NetworkError(error.message);
    }
  }

  // --- Auth Methods ---
  async signup(username, fullname, password, email, role, avatar) {
    return await this.customFetch("/users/register", {
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
    return await this.customFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
  }

  async getUserProfile() {
    return await this.customFetch("/users/me", {
      method: "GET",
    });
  }

  async logout() {
    return await this.customFetch("/users/logout", {
      method: "POST",
    });
  }

  async forgetPassword(email) {
    return await this.customFetch("/users/forget-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(password, token) {
    return await this.customFetch(`/users/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  }

  async resendVerifyEmail(email) {
    return await this.customFetch("/users/resend-verify-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async refreshSession() {
    return await this.customFetch("/users/refresh-token", {
      method: "POST",
    });
  }

  async updateAvatar(formData) {
    return await this.customFetch("/users/update-avatar", {
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
    return await this.customFetch(`/tasks`, {
      method: "GET",
    });
  }

  async deleteTask(projectId, taskId) {
    return await this.customFetch(`/tasks/${projectId}/${taskId}`, {
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
}

// Export a single instance
const apiService = new ApiService();
export default apiService;
