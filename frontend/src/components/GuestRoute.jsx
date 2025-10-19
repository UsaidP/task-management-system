import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./context/customHook"

/**
 * A component to protect routes that should only be accessible to guests (unauthenticated users).
 * If the user is authenticated, it redirects them to the dashboard.
 */
const GuestRoute = () => {
  const { isAuthenticated } = useAuth()

  // If the user is logged in, redirect them away from the guest page.
  // Otherwise, render the guest page (e.g., Login, Signup).
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

export default GuestRoute
