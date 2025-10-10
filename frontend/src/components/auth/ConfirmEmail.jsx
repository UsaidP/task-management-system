import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/customHook.js"

const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-700 dark:text-gray-300 mx-auto"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
        <EmailIcon />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Your Email</h1>
        <p className="text-gray-600 dark:text-gray-400">We've sent a confirmation link to:</p>
        <p className="font-medium text-blue-600 dark:text-blue-500">{email}</p>
        <p className="text-gray-600 dark:text-gray-400">
          Please check your inbox (and spam folder!) and click the link to complete your
          registration.
        </p>
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">Didn't receive the email?</p>
          <button
            onClick={handleResendEmail}
            disabled={isSending}
            className="w-full px-4 py-2 mt-4 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Resend Confirmation Link"}
          </button>
        </div>
        {feedbackMessage && <p className="mt-4 text-sm text-green-600">{feedbackMessage}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <Link
          to="/login"
          className="inline-block mt-6 text-sm text-gray-600 hover:underline dark:text-gray-400"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
