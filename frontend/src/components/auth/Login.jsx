import { motion } from "framer-motion"
import { useState } from "react"
import toast from "react-hot-toast"
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi"
import { Link } from "react-router-dom"
import { useAuth } from "../context/customHook.js"

export const Login = () => {
  // We get the login function from our custom hook.
  const { login } = useAuth()

  // State for managing form inputs.
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })

  // State for loading and password visibility.
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Handles changes to the input fields.
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handles the form submission.
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call the login function from the context.
      // If this is successful, the user state will update, and the
      // <GuestRoute> component will automatically redirect to the dashboard.
      const data = await login(formData.identifier, formData.password)
      // console.log("User response" + JSON.stringify(data));
      // No more `Maps()` call needed here! The routing handles it.
    } catch (err) {
      // Display a user-friendly error message using a toast notification.
      const errorMessage = err.data?.message || "Invalid credentials. Please try again."
      toast.error(errorMessage)
    } finally {
      // Ensure the loading state is turned off, whether login succeeded or failed.
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-primary-background">
      <div className="w-full max-w-lg h-full card p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-highlight-text mb-2">TaskFlow</h1>
          </Link>
          <p className="text-secondary-text">Welcome back! Please sign in to continue.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6 gap-3">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-highlight-text mb-2"
              >
                Email or Username
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle-text w-5 h-5" />
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
                className="block text-sm font-medium text-highlight-text mb-2"
              >
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle-text w-5 h-5" />
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-subtle-text hover:text-highlight-text transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center rounded-md btn-primary px-4 py-2 text-white transition-colors hover:btn-primary-hover disabled:cursor-not-allowed disabled:btn-disabled"
            >
              {loading ? (
                <div className="loading-dots" role="status" aria-live="polite">
                  <div />
                  <div />
                  <div />
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
                className="text-accent-blue hover:text-accent-blue transition-colors text-sm"
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
          <p className="text-secondary-text">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-accent-blue hover:text-accent-blue transition-colors font-medium"
            >
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
