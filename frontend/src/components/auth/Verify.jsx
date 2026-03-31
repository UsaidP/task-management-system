import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { FiCheckCircle, FiXCircle } from "react-icons/fi"
import { Link, useNavigate, useParams } from "react-router-dom"
import apiService from "../../../service/apiService.js"

export const Verify = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState("verifying") // verifying, success, error
  const [message, setMessage] = useState("")
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error")
        setMessage("Verification token is missing")
        return
      }

      try {
        const response = await apiService.verifyEmail(token)
        if (response.success) {
          setStatus("success")
          setMessage(response.message || "Email verified successfully!")
        }
      } catch (error) {
        setStatus("error")
        setMessage(
          error.data?.message || "Failed to verify email. The link may be expired or invalid."
        )
      }
    }

    verifyEmail()
  }, [token])

  const handleRedirect = () => {
    setIsRedirecting(true)
    navigate("/login")
  }

  return (
    <div className="auth-bg bg-light-bg-primary dark:bg-dark-bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md auth-card space-y-6 text-center"
      >
        {status === "verifying" && (
          <>
            <div className="w-20 h-20 bg-accent-primary/10 dark:bg-accent-primary/20 text-accent-primary dark:text-accent-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-current" />
            </div>

            <h1 className="text-3xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              Verifying Your Email
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-accent-success/10 dark:bg-accent-success/20 text-accent-success rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-10 h-10" />
            </div>

            <h1 className="text-3xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              Email Verified!
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              {message}
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleRedirect}
                disabled={isRedirecting}
                className="w-full px-4 py-3 font-semibold text-white btn-primary rounded-xl disabled:opacity-50 transition-all duration-200"
              >
                {isRedirecting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  </div>
                ) : (
                  "Continue to Login"
                )}
              </button>
            </div>

            <div className="pt-4">
              <Link
                to="/register"
                className="inline-block text-sm font-medium text-accent-primary hover:text-accent-primary-dark dark:text-accent-primary-light dark:hover:text-accent-primary transition-colors"
              >
                Create another account
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-accent-danger/10 dark:bg-accent-danger/20 text-accent-danger rounded-full flex items-center justify-center mx-auto mb-6">
              <FiXCircle className="w-10 h-10" />
            </div>

            <h1 className="text-3xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              Verification Failed
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              {message}
            </p>

            <div className="pt-4 space-y-3">
              <button
                type="button"
                onClick={handleRedirect}
                disabled={isRedirecting}
                className="w-full px-4 py-3 font-semibold text-white btn-primary rounded-xl disabled:opacity-50 transition-all duration-200"
              >
                {isRedirecting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  </div>
                ) : (
                  "Back to Login"
                )}
              </button>

              <Link
                to="/register"
                className="inline-block text-sm font-medium text-accent-primary hover:text-accent-primary-dark dark:text-accent-primary-light dark:hover:text-accent-primary transition-colors"
              >
                Create a new account
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
