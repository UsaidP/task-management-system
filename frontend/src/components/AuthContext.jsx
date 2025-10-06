import { createContext, useState, useEffect } from "react";
import apiService from "../../service/apiService.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userID, setUserID] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const checkLoggedIn = async () => {
      try {
        console.log("🔍 Checking authentication status...");

        const response = await apiService.getUserProfile();

        if (isMounted && response?.success && response?.data) {
          console.log("✅ User authenticated:", response.data);
          setUserID(response.data._id);
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          console.log("❌ No valid user data in response");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("❌ Authentication check error:", error);

        // Handle 401 - Try to refresh token
        if (error?.response?.status === 401) {
          console.log("🔄 Token expired, attempting to refresh...");

          try {
            const refreshResponse = await apiService.refreshSession();

            if (isMounted && refreshResponse?.success) {
              console.log("✅ Token refreshed successfully");

              // Fetch user profile again with new token
              const newResponse = await apiService.getUserProfile();

              if (isMounted && newResponse?.success && newResponse?.data) {
                console.log(
                  "✅ User profile fetched after refresh:",
                  newResponse.data
                );
                setUser(newResponse.data);
                setIsAuthenticated(true);
              } else {
                console.log("❌ Failed to fetch user profile after refresh");
                setUser(null);
                setIsAuthenticated(false);
              }
            } else {
              console.log("❌ Token refresh failed");
              if (isMounted) {
                setUser(null);
                setIsAuthenticated(false);
              }
            }
          } catch (refreshError) {
            console.error("❌ Session refresh error:", refreshError);
            if (isMounted) {
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } else {
          // Other errors (network, server, etc.)
          console.log("❌ Authentication failed (non-401 error)");
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } finally {
        // CRITICAL: Always set loading to false, regardless of outcome
        if (isMounted) {
          console.log("✅ Auth check complete, setting loading to false");
          setLoading(false);
        }
      }
    };

    checkLoggedIn();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Run once on mount

  const login = async (identifier, password) => {
    try {
      const response = await apiService.login(identifier, password);
      console.log("AuthContext Login response " + response);
      if (response?.success && response?.data) {
        console.log("✅ Login successful:", response.data);
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        console.log("❌ Login failed: Invalid response");
        setUser(null);
        setIsAuthenticated(false);
      }

      return response;
    } catch (error) {
      console.error("❌ Login error:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      // Always clear user state on logout
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const signup = async (username, fullname, password, email, role, avatar) => {
    try {
      const response = await apiService.signup(
        username,
        fullname,
        password,
        email,
        role,
        avatar
      );

      console.log("✅ Signup response:", response);
      return response;
    } catch (error) {
      console.error("❌ Signup error:", error);
      throw error;
    }
  };

  const forget_password = async (email) => {
    try {
      const response = await apiService.forget_password(email);
      console.log("✅ Forget password response:", response);
      return response;
    } catch (error) {
      console.error("❌ Forget password error:", error);
      throw error;
    }
  };

  const reset_password = async (password, token) => {
    try {
      const response = await apiService.reset_password(password, token);
      console.log("✅ Reset password response:", response);
      return response;
    } catch (error) {
      console.error("❌ Reset password error:", error);
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const response = await apiService.refreshToken();

      if (response?.success && response?.data) {
        console.log("✅ Session refreshed:", response.data);
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        console.log("❌ Session refresh failed: Invalid response");
        setUser(null);
        setIsAuthenticated(false);
      }

      return response;
    } catch (error) {
      console.error("❌ Session refresh error:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const value = {
    user,
    userID,
    loading,
    isAuthenticated,
    login,
    logout,
    signup,
    forget_password,
    reset_password,
    refreshSession,
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log("📊 Auth State Changed:", {
      user: user ? user.username || user.name || "User loaded" : null,
      loading,
      isAuthenticated,
    });
  }, [user, loading, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {/* OPTION 1: Only show children after loading completes */}
      {/* {!loading && children} */}

      {/* { OPTION 2: Show loading indicator (uncomment if you prefer this) */}
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
