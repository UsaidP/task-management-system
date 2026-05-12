import { MailIcon as Mail } from "@animateicons/react/lucide"
import { motion } from "framer-motion"
import { useState } from "react"
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
    <div className="auth-bg bg-bg-canvas min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 bg-bg-canvas border border-border rounded-2xl shadow-lg space-y-6 text-center"
      >
        <div className="w-20 h-20 bg-accent-primary/10 dark:bg-accent-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-serif font-bold text-text-primary mb-2">Check your mail</h1>
        <p className="text-text-secondary">We've sent a confirmation link to:</p>
        <p className="font-semibold text-lg text-text-primary bg-bg-surface py-2 px-4 rounded-lg inline-block my-2">
          {email}
        </p>
        <p className="text-text-secondary">Click the link in the email to verify your account.</p>

        {feedbackMessage && (
          <div className="p-3 mt-4 bg-accent-success/10 border border-accent-success/20 rounded-lg text-success text-sm">
            {feedbackMessage}
          </div>
        )}

        {error && (
          <div className="p-3 mt-4 bg-accent-danger/10 border border-accent-danger/20 rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        <div className="pt-8 border-t border-border mt-8">
          <p className="text-text-secondary mb-4">Didn't receive the email?</p>
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isSending}
            aria-busy={isSending}
            className="w-full px-4 py-3 font-semibold text-white bg-primary hover:bg-primary/90 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer rounded-xl disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
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
            className="inline-block text-sm font-medium text-primary hover:text-accent-primary-dark dark:hover:text-accent-primary transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
