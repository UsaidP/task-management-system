import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useParams } from "react-router-dom";

export const Reset = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { reset_password } = useAuth();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await reset_password(password, token);
      console.log("Reset Response: " + response);
    } catch (error) {
      const errorMessage = error.message || "Password rest failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {loading ? (
        "Loading..."
      ) : (
        <div>
          <h1>Reset Password</h1>
          <form onSubmit={handleSubmit} method="post">
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Reset</button>
          </form>
          <h2>{error}</h2>
        </div>
      )}
    </>
  );
};
