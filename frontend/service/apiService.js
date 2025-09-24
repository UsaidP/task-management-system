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
        console.log("API response" + data);
        return data;
      }
    } catch (error) {
      console.log("API Error", error);
      throw new Error(error);
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
}

const apiService = new ApiService();
export default apiService;
