import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export const Forget = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { forget_password } = useAuth();
  const [responseMsg, setResponseMsg] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log(forget_password);
      const response = await forget_password(email);

      if (response.success) {
        console.info("response: ", response);
        setResponseMsg(response.message);
        navigate("/reset-password/:token");
        return response.json();
      }
    } catch (error) {
      const errorMessage =
        error.message || "Email not found. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {loading ? "loading..." : ""}
      <h1>Forget Password</h1>
      <p
        style={{
          background: "black",
          color: "white",
        }}
      >
        {responseMsg}
        {error}
      </p>
      <form onSubmit={handleSubmit} method="post">
        <input
          type="email"
          name="email"
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "" : "Forget"}
        </button>
      </form>
    </div>
  );
};
