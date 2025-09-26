import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const Login = () => {
  // 1. Call hooks at the top level of the component
  const navigate = useNavigate();
  const { login } = useAuth();
  console.log("login" + login);

  // 2. Simplified form state for a better user experience
  const [formData, setFormData] = useState({
    identifier: "", // One field for "Username or Email"
    password: "",
  });

  // 3. Added a loading state for better user feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Using the cleaner implicit return syntax
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors on a new submission

    try {
      // Your backend should be able to accept either username or email in the 'identifier' field
      const response = await login(formData.identifier, formData.password);
      if (response.success) {
        // 4. Handle the success case properly
        console.log("Login successful:", response);
        navigate("/");
      }
      // Example: Store the auth token from the response
      // localStorage.setItem('authToken', response.token);

      // Navigate to the dashboard or home page after successful login
    } catch (err) {
      // 5. Set a user-friendly error message from the API response or a fallback
      const errorMessage =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(errorMessage);
      console.error("Login failed:", err);
    } finally {
      // 6. Ensure loading is always set back to false
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {/* 7. Removed unnecessary method attribute */}
      <form onSubmit={handleSubmit}>
        <div>
          {/* 8. Added labels for accessibility */}
          <label htmlFor="identifier">Username or Email</label>
          <input
            type="text"
            name="identifier"
            id="identifier"
            placeholder="Enter your username or email"
            onChange={handleChange}
            value={formData.identifier}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter password"
            onChange={handleChange}
            value={formData.password}
            required
          />
        </div>

        {/* 9. Display the error message to the user */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* 10. Disable the button during the API call */}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};
