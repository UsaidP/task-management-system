import { motion } from "framer-motion"
import { useId, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/customHook.js"

export const Login = () => {
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const successMessage = location.state?.message
  const id = useId()

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [shownSuccess, setShownSuccess] = useState(false)

  useEffect(() => {
    if (successMessage && !shownSuccess) {
      toast.success(successMessage)
      setShownSuccess(true)
    }
  }, [successMessage, shownSuccess])

  // Reset shownSuccess when navigating away from login
  useEffect(() => {
    return () => {
      setShownSuccess(false)
    }
  }, [])

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

    const toastId = toast.loading("Signing in...")
    try {
      const response = await login(formData.identifier, formData.password)
      toast.success(response?.message || "Signed in successfully!", { id: toastId })
      // Navigate to dashboard on successful login
      navigate("/overview", { replace: true, state: { message: response?.message } })
    } catch (err) {
      const errorMessage = err.message || "Invalid credentials. Please try again."

      // Show toast for email verification required (status 403)
      if (err.status === 403 && err.message?.includes("verify your email")) {
        toast.error(
          "Please verify your email before logging in. Check your inbox for the verification link.",
          { id: toastId }
        )
        return
      }

      // Show toast error for wrong password, user not found, and other errors
      toast.error(errorMessage, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg bg-light-bg-primary dark:bg-dark-bg-primary min-h-screen">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <Link to="/" aria-label="TaskFlow Home" className="inline-block flex justify-center mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent-primary flex items-center justify-center text-light-text-inverse mb-2 shadow-sm">
              <span className="font-serif font-bold text-2xl sm:text-3xl leading-none pt-1">T</span>
            </div>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            Welcome Back
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-base sm:text-lg">
            Sign in to continue to TaskFlow.
          </p>
        </motion.div>

        <div className="auth-card">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 gap-3">
              <div>
                <label htmlFor={`${id}-identifier`} className="input-label">
                  Email or Username
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
                  <input
                    type="text"
                    name="identifier"
                    id={`${id}-identifier`}
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
                <label htmlFor={`${id}-password`} className="input-label">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id={`${id}-password`}
                    placeholder="Enter your password"
                    onChange={handleChange}
                    value={formData.password}
                    required
                    className={`input-field pl-12 pr-12 ${errors.password ? "border-accent-danger" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/50 rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="input-error">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="btn-primary group flex w-full items-center justify-center rounded-lg px-4 py-2.5 sm:py-3 text-sm sm:text-base disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-light-text-inverse" />
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
                  className="text-accent-primary hover:text-accent-primary-dark dark:text-accent-primary-light dark:hover:text-accent-primary transition-colors text-xs sm:text-sm"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
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
