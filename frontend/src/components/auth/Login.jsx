import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/customHook.js";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(formData.identifier, formData.password);
      if (response.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage =
        err.data?.message || "Invalid credentials. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text mb-2">TaskFlow</h1>
          </Link>
          <p className="text-text-secondary">
            Welcome back! Please sign in to continue.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Email or Username
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type="text"
                  name="identifier"
                  id="identifier"
                  placeholder="Enter your email or username"
                  onChange={handleChange}
                  value={formData.identifier}
                  required
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  value={formData.password}
                  required
                  className="input-field pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center rounded-md btn-primary px-4 py-2 text-white transition-colors hover:btn-primary-hover disabled:cursor-not-allowed disabled:btn-disabled"
            >
              {loading ? (
                <div className="loading-dots">
                  {/* Ensure you have CSS for this class to create a spinner */}
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                to="/forget-password"
                className="text-primary hover:text-primary-light transition-colors text-sm"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-text-secondary">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:text-primary-light transition-colors font-medium"
            >
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
