import { createContext, useState, useContext, useEffect } from "react";
import apiService from "../../service/apiService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Initial auth check loading state

  useEffect(() => {
    // Check if the user is already logged in when the app loads
    const checkLoggedIn = async () => {
      try {
        const response = await apiService.getUserProfile();
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Not authenticated on load:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (identifier, password) => {
    const response = await apiService.login(identifier, password);
    if (response.success) {
      setUser(response.data);
    }
    return response; // Return the full response for component-level error handling
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
  };

  const signup = async (username, fullname, password, email, role) => {
    return await apiService.signup(username, fullname, password, email, role);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
  };

  // We don't render the app until we've checked for an active session
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
