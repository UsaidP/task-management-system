import { motion } from "framer-motion"
import { useState } from "react"
import toast from "react-hot-toast"
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi"
import { Link } from "react-router-dom"
import { useAuth } from "../context/customHook.js"

export const Login = () => {
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      await login(formData.identifier, formData.password)
      // On success, AuthProvider will handle redirect
    } catch (err) {
      const errorMessage = err.data?.message || "Invalid credentials. Please try again."
      toast.error(errorMessage)
      // You could set specific field errors here if the API provided them
      // For now, we'll just show a general error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-light-bg-primary dark:bg-dark-bg-primary">
      <div className="w-full max-w-lg h-full card p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              TaskFlow
            </h1>
          </Link>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Welcome back! Please sign in to continue.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6 gap-3">
            <div>
              <label htmlFor="identifier" className="input-label">
                Email or Username
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
                <input
                  type="text"
                  name="identifier"
                  id="identifier"
                  placeholder="Enter your email or username"
                  onChange={handleChange}
                  value={formData.identifier}
                  required
                  className={`input-field pl-12 ${errors.identifier ? "border-accent-danger" : ""}`}
                />
              </div>
              {errors.identifier && <p className="input-error">{errors.identifier}</p>}
            </div>

            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  value={formData.password}
                  required
                  className={`input-field pl-12 pr-12 ${errors.password ? "border-accent-danger" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="input-error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center rounded-md btn-primary px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
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
                className="text-accent-primary hover:text-accent-primary-dark dark:text-accent-primary-light dark:hover:text-accent-primary transition-colors text-sm"
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
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-accent-primary hover:text-accent-primary-dark dark:text-accent-primary-light dark:hover:text-accent-primary transition-colors font-medium"
            >
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
