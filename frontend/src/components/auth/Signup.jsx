import { motion } from "framer-motion"
import { useState } from "react"
import { FiArrowRight, FiCheck, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/customHook.js"

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const strength = getStrength(password)
  const getColor = () => {
    if (strength <= 2) return "bg-accent-danger"
    if (strength <= 3) return "bg-accent-warning"
    return "bg-accent-success"
  }

  const getLabel = () => {
    if (strength <= 2) return "Weak"
    if (strength <= 3) return "Medium"
    return "Strong"
  }

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2 mb-1">
        <div className="flex-1 bg-light-border dark:bg-dark-border rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span
          className={`text-xs font-medium ${
            strength <= 2
              ? "text-accent-danger"
              : strength <= 3
                ? "text-accent-warning"
                : "text-accent-success"
          }`}
        >
          {getLabel()}
        </span>
      </div>
    </div>
  )
}

export const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    role: "",
    avatar: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { signup } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { username, fullname, email, password } = formData
      const response = await signup(username, fullname, password, email, "member")
      if (response.success) {
        navigate("/confirm", { state: { email: formData.email } })
      }
    } catch (err) {
      const errorMessage = err.data?.message || "Signup failed. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg bg-light-bg-primary dark:bg-dark-bg-primary">
      <div className="w-full max-w-xl auth-card space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-primary flex items-center justify-center text-white mb-2 shadow-sm">
              <span className="font-serif font-bold text-3xl leading-none pt-1">T</span>
            </div>
          </Link>
          <h1 className="text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            Create an Account
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
            Join TaskFlow to organize your work.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullname" className="input-label mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
                  <input
                    type="text"
                    name="fullname"
                    id="fullname"
                    placeholder="Full Name"
                    onChange={handleChange}
                    value={formData.fullname}
                    required
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="input-label mb-2 block">
                  Username
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
                  <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="username"
                    onChange={handleChange}
                    value={formData.username}
                    required
                    className="input-field pl-12"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="input-label mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="name@example.com"
                  onChange={handleChange}
                  value={formData.email}
                  required
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="input-label mb-2 block">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Create a strong password"
                  onChange={handleChange}
                  value={formData.password}
                  required
                  className="input-field pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-accent-danger/10 border border-accent-danger/20 rounded-lg text-accent-danger text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary space-y-2">
              <div className="flex items-center space-x-2">
                <FiCheck className="w-4 h-4 text-accent-success" />
                <span>Free forever, no credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiCheck className="w-4 h-4 text-accent-success" />
                <span>Unlimited projects and tasks</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary group">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Create Account
                  <FiArrowRight className="flex ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-accent-primary hover:text-accent-primary-dark dark:text-accent-primary-light dark:hover:text-accent-primary transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
