import { motion } from "framer-motion"
import { useState } from "react"
import { FiArrowLeft, FiMail } from "react-icons/fi"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/customHook.js"

export const Forget = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { forgetPassword } = useAuth()
  const [responseMsg, setResponseMsg] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResponseMsg("")

    try {
      const response = await forgetPassword(email)
      if (response.success) {
        setResponseMsg(response.message)
        setEmail("")
        // Optionally navigate to a confirmation page
        // navigate("/confirm-password-reset");
      } else {
        setError(response.message || "Failed to send reset email.")
      }
    } catch (error) {
      const errorMessage = error.data?.message || "Email not found. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
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
            Forgot Password
          </h1>
          <p className="text-center text-light-text-secondary dark:text-dark-text-secondary">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Ex. name@example.com"
                  onChange={(e) => setEmail(e.target.value)}
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

            {responseMsg && (
              <div className="p-3 bg-accent-success/10 border border-accent-success/20 rounded-lg text-accent-success text-sm">
                {responseMsg}
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
                  "Send Reset Link"
                )}
              </button>
            </div>
            <div className="text-sm text-center">
              <Link
                to="/login"
                className="flex items-center justify-center font-medium text-accent-primary hover:text-accent-primary-dark dark:text-accent-primary-light dark:hover:text-accent-primary transition-colors"
              >
                <FiArrowLeft className="mr-2" /> Back to Login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
