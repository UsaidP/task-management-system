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
        console.info("API response" + data);
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
      console.log("API Error", error);
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
}

const apiService = new ApiService();
export default apiService;
