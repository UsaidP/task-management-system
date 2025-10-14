import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/customHook.js"

export const Forget = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { forget_password } = useAuth()
  const [responseMsg, setResponseMsg] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResponseMsg("")

    try {
      const response = await forget_password(email)
      if (response.success) {
        setResponseMsg(response.message)
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
    <div className="flex items-center justify-center min-h-screen bento-theme">
      <div className="w-full max-w-md p-8 space-y-6 bento-card">
        <h1 className="text-2xl font-bold text-center text-bento-text-primary">
          Forgot Your Password?
        </h1>
        <p className="text-center text-bento-text-secondary">
          Enter your email address and we will send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-bento-text-primary"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {responseMsg && <p className="text-sm text-green-600">{responseMsg}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-medium text-white btn-new-primary disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
          <div className="text-sm text-center">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
