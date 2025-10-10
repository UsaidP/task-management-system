import { createContext, useEffect, useMemo, useState } from "react";
import apiService from "../../service/apiService.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// This helper function centralizes the logic of checking the user's session
	// and attempting to refresh the token if it has expired.
	const verifyUserSession = async () => {
		try {
			const response = await apiService.getUserProfile();
			return response.data; // Return user data on success
		} catch (error) {
			// If the error is 401, the token is likely expired. Try to refresh it.
			if (error?.response?.status === 401) {
				console.log("🔄 Token expired, attempting to refresh...");
				try {
					const refreshResponse = await apiService.refreshSession();
					if (refreshResponse?.success) {
						console.log("✅ Token refreshed successfully");
						// If refresh works, try fetching the user profile again.
						const newResponse = await apiService.getUserProfile();
						return newResponse.data;
					}
				} catch (refreshError) {
					console.error("❌ Session refresh failed:", refreshError);
					return null; // Return null if the refresh attempt fails
				}
			}
			// For any other errors, just log it and return null.
			console.error("❌ Authentication check error:", error);
			return null;
		}
	};

	// This effect runs once on initial app load to check for a logged-in user.
	useEffect(() => {
		const checkLoggedIn = async () => {
			const userData = await verifyUserSession();
			setUser(userData);
			setLoading(false); // Auth check is complete
		};

		checkLoggedIn();
	}, []); // Empty dependency array ensures this runs only once on mount.

	const login = async (identifier, password) => {
		try {
			const response = await apiService.login(identifier, password);
			if (response?.success && response?.data) {
				setUser(response.data);
			} else {
				setUser(null);
			}
			return response;
		} catch (error) {
			setUser(null);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await apiService.logout();
		} catch (error) {
			console.error("❌ Logout API error:", error);
		} finally {
			// Always clear user state on logout, regardless of API success.
			setUser(null);
		}
	};

	const signup = async (username, fullname, password, email, role, avatar) => {
		try {
			return await apiService.signup(
				username,
				fullname,
				password,
				email,
				role,
				avatar,
			);
		} catch (error) {
			console.error("❌ Signup error:", error);
			throw error;
		}
	};

	// --- Derived State & Memoized Context Value ---

	// isAuthenticated and userID are derived from the user state directly.
	// This avoids managing separate, redundant state variables.
	const isAuthenticated = !!user;
	const userID = user?._id || null;

	// The `useMemo` hook prevents the context value object from being recreated
	// on every render, which optimizes performance for consuming components.
	const value = useMemo(
		() => ({
			user,
			userID,
			loading,
			isAuthenticated,
			login,
			logout,
			signup,
		}),
		[user, loading],
	);

	return (
		<AuthContext.Provider value={value}>
			{loading ? (
				// Display a full-page loading spinner while checking auth status.
				// This prevents the main app from rendering in an uncertain state.
				<div className="flex min-h-screen items-center justify-center">
					<div className="text-center">
						<div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-primary" />
						<p className="mt-4 text-text-secondary">Authenticating...</p>
					</div>
				</div>
			) : (
				// Once loading is complete, render the rest of the application.
				children
			)}
		</AuthContext.Provider>
	);
};
