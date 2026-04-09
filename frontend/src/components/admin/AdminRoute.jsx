import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/customHook.js"

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user || user.role !== "admin") {
    return <Navigate to="/overview" replace />
  }

  return children
}

export default AdminRoute
