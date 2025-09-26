import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming you use React Router for navigation
import apiService from "../../../service/apiService.js";

export const Signup = () => {
  // 1. Consolidated form state into a single object
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook for programmatic navigation

  // 2. A single handler for all input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 3. Destructure formData for cleaner API call
      const { username, fullname, email, password } = formData;
      const response = await apiService.signup(
        username,
        fullname,
        password,
        email,
        "user"
      );

      console.log("Signup successful:", response);
      // 4. Handle success: navigate to login page or a "check your email" page
      navigate("/confirm");
    } catch (err) {
      // 5. Set a user-friendly error message
      const errorMessage =
        err.response?.data?.message || "Signup failed. Please try again.";
      setError(errorMessage);
      console.error(err);
    } finally {
      // 6. ALWAYS set loading to false after the attempt is complete
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      {/* 7. Removed unnecessary action and method attributes */}
      <form onSubmit={handleSubmit}>
        {/* 8. Added labels for accessibility */}
        <div>
          <label htmlFor="fullname">Full Name</label>
          <input
            type="text"
            name="fullname"
            id="fullname"
            placeholder="Enter your full name"
            onChange={handleChange}
            value={formData.fullname}
            required
          />
        </div>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Enter your username"
            onChange={handleChange}
            value={formData.username}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            onChange={handleChange}
            value={formData.email}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter a password"
            onChange={handleChange}
            value={formData.password}
            required
          />
        </div>

        {/* 9. Display the error message if it exists */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* 10. Disable button and show loading text during submission */}
        <button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};
