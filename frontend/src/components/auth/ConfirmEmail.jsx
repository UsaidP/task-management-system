import { motion } from "framer-motion"
import { useState } from "react"
import { MailIcon as Mail } from "@animateicons/react/lucide"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/customHook.js"

export const ConfirmEmail = () => {
  const location = useLocation()
  const email = location.state?.email || "your email address"
  const { resendVerifyEmail } = useAuth()

  const [isSending, setIsSending] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [error, setError] = useState("")

  const handleResendEmail = async () => {
    setIsSending(true)
    setFeedbackMessage("")
    setError("")
    try {
      const response = await resendVerifyEmail(email)
      if (response.success) {
        setFeedbackMessage(`A new confirmation link has been sent to ${email}.`)
      } else {
        setError(response.message || "Failed to resend email.")
      }
    } catch (err) {
      setError(err.data?.message || "Failed to resend email. Please try again later.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="auth-bg bg-light-bg-primary dark:bg-dark-bg-primary min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md auth-card space-y-6 text-center"
      >
        <div className="w-20 h-20 bg-accent-primary/10 dark:bg-accent-primary/20 text-accent-primary dark:text-accent-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
          Check your mail
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          We've sent a confirmation link to:
        </p>
        <p className="font-semibold text-lg text-light-text-primary dark:text-dark-text-primary bg-light-bg-secondary dark:bg-dark-bg-tertiary py-2 px-4 rounded-lg inline-block my-2">
          {email}
        </p>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Click the link in the email to verify your account.
        </p>

        {feedbackMessage && (
          <div className="p-3 mt-4 bg-accent-success/10 border border-accent-success/20 rounded-lg text-accent-success text-sm">
            {feedbackMessage}
          </div>
        )}

        {error && (
          <div className="p-3 mt-4 bg-accent-danger/10 border border-accent-danger/20 rounded-lg text-accent-danger text-sm">
            {error}
          </div>
        )}

        <div className="pt-8 border-t border-light-border dark:border-dark-border mt-8">
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
            Didn't receive the email?
          </p>
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isSending}
            aria-busy={isSending}
            className="w-full px-4 py-3 font-semibold text-white btn-primary rounded-xl disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
          >
            {isSending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              </div>
            ) : (
              "Resend Confirmation Link"
            )}
          </button>
        </div>

        <div className="pt-4">
          <Link
            to="/login"
            className="inline-block text-sm font-medium text-accent-primary hover:text-accent-primary-dark dark:text-accent-primary-light dark:hover:text-accent-primary transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
