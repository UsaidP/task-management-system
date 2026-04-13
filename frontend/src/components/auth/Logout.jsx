import { useState } from "react"
import toast from "react-hot-toast"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "./AuthContext"

const Logout = () => {
  const { user, logout } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (!user) {
    return (
      <p>
        You are not logged in. <Link to="/login">Login</Link>
      </p>
    )
  }

  const logoutHandler = async () => {
    setLoading(true)
    setError("")
    const toastId = toast.loading("Logging out...")
    try {
      await logout()
      toast.success("Logged out successfully!", { id: toastId })
      navigate("/") // Navigate to home page after successful logout
    } catch (err) {
      toast.error(err.message || "Logout failed. Please try again.", { id: toastId })
      setError(err.message || "Logout failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <button
        onClick={logoutHandler}
        disabled={loading}
        className="btn-secondary px-4 py-2 text-sm font-medium"
      >
        {loading ? "Logging out..." : "Logout"}
      </button>
      {error && <p className="text-sm text-accent-danger mt-2">{error}</p>}
    </>
  )
}

export default Logout
