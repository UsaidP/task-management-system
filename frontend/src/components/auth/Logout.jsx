import { useState } from "react"
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
		try {
			await logout()
			navigate("/") // Navigate to home page after successful logout
		} catch (err) {
			setError(err.message || "Logout failed. Please try again.")
		} finally {
			setLoading(false)
		}
	}
	return (
		<>
			<button onClick={logoutHandler} disabled={loading}>
				{loading ? "Logging out..." : "Logout"}
			</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</>
	)
}

export default Logout
