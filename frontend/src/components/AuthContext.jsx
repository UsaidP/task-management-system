import { createContext, useState, useContext, useEffect } from "react";
import apiService from "../../service/apiService.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Initial auth check loading state
  useEffect(() => {
    // Check if the user is already logged in when the app loads
    // Inside your useEffect
    const checkLoggedIn = async () => {
      try {
        const response = await apiService.getUserProfile();
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        // Check if the error is because the token expired (e.g., a 401 status)
        if (error.response && error.response.status === 401) {
          try {
            // If it's a 401, try to refresh the session
            const refreshResponse = await apiService.refreshSession();
            if (refreshResponse.success) {
              // If refresh succeeds, the new token is now in a cookie,
              // so we can fetch the user profile again.
              const newResponse = await apiService.getUserProfile();
              setUser(newResponse.data);
            } else {
              // If refresh fails, the user is logged out
              setUser(null);
            }
          } catch (refreshError) {
            console.error("Session refresh failed:", refreshError);
            setUser(null);
          }
        } else {
          // For any other error, just log it
          console.error("Not authenticated on load:", error);
          setUser(null);
        }
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

  const signup = async (username, fullname, password, email, role, avatar) => {
    return await apiService.signup(
      username,
      fullname,
      password,
      email,
      role,
      avatar
    );
  };

  const forget_password = async (email) => {
    return await apiService.forget_password(email);
  };

  const reset_password = async (password, token) => {
    return await apiService.reset_password(password, token);
  };
  const refreshSession = async () => {
    try {
      const response = await apiService.refreshToken();
      if (response.success) {
        setUser(response.data);
      }
      return response;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    forget_password,
    reset_password,
    refreshSession,
  };

  // We don't render the app until we've checked for an active session
  return (
    // we have the access of Provider which come from "createContext" hook.
    // which data should be available for other components to use "we have to wrap inside this Provider"
    // which values we have to send from here "we have set the values which value can be accessible to other components"
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
