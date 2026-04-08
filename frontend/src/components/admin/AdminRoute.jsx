import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/customHook.js"

const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg">Access Denied</div>
    )
  }

  return children
}

export default AdminRoute
