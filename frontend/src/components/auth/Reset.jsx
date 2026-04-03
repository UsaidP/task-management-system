import { motion } from "framer-motion"
import { useState } from "react"
import { FiCheckCircle, FiLock } from "react-icons/fi"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../../contexts/customHook.js"

export const Reset = () => {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { reset_password } = useAuth()
  const { token } = useParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await reset_password(password, token)
      if (response.success) {
        setSuccess(true)
      } else {
        setError(response.message || "Failed to reset password.")
      }
    } catch (error) {
      const errorMessage = error.data?.message || "Password reset failed"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-bg bg-light-bg-primary dark:bg-dark-bg-primary">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md auth-card space-y-6 text-center"
        >
          <div className="w-16 h-16 bg-accent-success/10 dark:bg-accent-success/20 text-accent-success rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            Password Reset!
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
            Your password has been reset successfully.
          </p>
          <Link
            to="/login"
            className="inline-block w-full px-4 py-3 font-semibold text-white btn-primary rounded-xl transition-all duration-200"
          >
            Proceed to Login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="auth-bg bg-light-bg-primary dark:bg-dark-bg-primary">
      <div className="w-full max-w-md auth-card space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link to="/" className="inline-block flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-primary flex items-center justify-center text-white mb-2 shadow-sm">
              <span className="font-serif font-bold text-3xl leading-none pt-1">T</span>
            </div>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-center text-light-text-primary dark:text-dark-text-primary mb-2">
            Reset Password
          </h1>
          <p className="text-center text-light-text-secondary dark:text-dark-text-secondary">
            Enter your new secure password below to regain access.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="input-label mb-2 block">
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pl-12 w-full"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-accent-danger/10 border border-accent-danger/20 rounded-lg text-accent-danger text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 font-semibold text-white btn-primary rounded-xl disabled:opacity-50 transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
