import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../context/customHook.js"

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
      <div className="flex items-center justify-center min-h-screen bento-theme">
        <div className="w-full max-w-md p-8 space-y-6 text-center bento-card">
          <h1 className="text-2xl font-bold text-green-600">Success!</h1>
          <p className="text-bento-text-secondary">
            Your password has been reset successfully.
          </p>
          <Link
            to="/login"
            className="inline-block px-4 py-2 font-medium text-white btn-new-primary"
          >
            Proceed to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bento-theme">
      <div className="w-full max-w-md p-8 space-y-6 bento-card">
        <h1 className="text-2xl font-bold text-center text-bento-text-primary">
          Reset Your Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-bento-text-primary"
            >
              New Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-medium text-white btn-new-primary disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
