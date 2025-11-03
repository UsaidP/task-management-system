class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(message, 500);
    this.name = 'ServerError';
  }
}

class NetworkError extends Error {
  constructor(message = 'Network error, please check your connection') {
    super(message);
    this.name = 'NetworkError';
  }
}

class ApiService {
  constructor() {
    this.baseURL = "http://localhost:3001/api/v1";
    this.defaultHeader = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async customFetch(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = { ...this.defaultHeader, ...options.headers };

    if (options.body instanceof FormData) {
      delete headers["Content-Type"];
    }
    console.log(`BaseURL ${this.baseURL} Endpoint: ${endpoint}`);

    const config = {
      ...options,
      headers,
      credentials: "include",
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

        if (response.status === 404) {
          throw new NotFoundError(errorData.message);
        }
        if (response.status >= 500) {
          throw new ServerError(errorData.message);
        }
        throw new ApiError(errorData.message || 'An API error occurred', response.status);
      }

      return await response.json();

    } catch (error) {
      if (error instanceof ApiError) {
        // Re-throw custom API errors
        throw error;
      }
      // Wrap other errors (e.g., network errors) in a NetworkError
      console.error("API Error", error);
      throw new NetworkError(error.message);
    }
  }
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
    // Changed 'username' to 'identifier' for clarity
    return await this.customFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }), // ✅ Corrected key
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
  async forget_password(email) {
    return await this.customFetch("/users/forget-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }
  async reset_password(password, token) {
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

  async getTasksByProjectId(projectId) {
    return await this.customFetch(`/tasks/${projectId}`, {
      method: "GET",
    });
  }

  async createTask(projectId, taskData) {
    console.log(`Task Data ${JSON.stringify(taskData)}`);
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

  async getAllMembers(projectId) {
    return await this.customFetch(`/members/all-members/${projectId}`, {
      method: "GET",
    });
  }

  async addMember(projectId, email, role) {
    console.log(projectId, email, role);
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

  // Sub-task methods
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

  async updateAvatar(formData) {
    return await this.customFetch("/users/update-avatar", {
      method: "PUT",
      body: formData,
    });
  }
}

const apiService = new ApiService();
export default apiService;
