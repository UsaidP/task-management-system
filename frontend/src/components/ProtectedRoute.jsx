import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./context/customHook.js" // Adjust the import path as needed

/**
 * A component to protect routes that require authentication.
 * It checks the authentication status from the AuthContext.
 */
const ProtectedRoute = () => {
  // We get `isAuthenticated` directly from our hook.
  // This value is always up-to-date with the user's state.
  const { isAuthenticated } = useAuth()

  // If the user is authenticated, we render the child route using the <Outlet /> component.
  // Otherwise, we redirect them to the login page using the <Navigate /> component.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
