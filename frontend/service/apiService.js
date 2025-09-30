class ApiService {
  constructor() {
    this.baseURL = "http://localhost:3000/api/v1";
    this.defaultHeader = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }
  async customFetch(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = { ...this.defaultHeader, ...options.headers };

      const config = {
        ...options,
        headers,
        credentials: "include",
      };
      const response = await fetch(url, config);

      if (response.ok) {
        const data = await response.json();
        
        return data;
      } else {
        // If the response is not OK, try to parse the error body
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If the error body is not JSON, use the status text
          errorData = { message: response.statusText };
        }
        const error = new Error(errorData.message || "An API error occurred");
        error.response = response;
        error.data = errorData;
        throw error;
      }
    } catch (error) {
      console.error("API Error", error);
      // Re-throw the original or newly created error
      throw error;
    }
  }
  async signup(username, fullname, password, email, role) {
    return await this.customFetch("/users/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, fullname, role }),
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
        method: "POST",
    });
  }

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
    return await this.customFetch(`/tasks/${projectId}/n/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  }

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
}

const apiService = new ApiService();
export default apiService;
