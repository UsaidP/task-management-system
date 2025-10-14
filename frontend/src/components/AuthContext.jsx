import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import apiService from "../../service/apiService.js";

// Create the context that components will consume.
export const AuthContext = createContext(null);

/**
 * A helper function to safely get the initial user data from localStorage.
 * This runs synchronously on app load.
 * @returns {object|null} The parsed user object or null if not found/invalid.
 */
const getInitialUser = () => {
	try {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			return JSON.parse(storedUser);
		}
		return null;
	} catch (error) {
		console.error("Failed to parse user from localStorage", error);
		return null; // Return null in case of a parsing error.
	}
};

/**
 * The AuthProvider component manages all authentication-related state and logic,
 * making it available to the rest of the application via the AuthContext.
 */
export const AuthProvider = ({ children }) => {
	// Initialize user state directly from localStorage for an instant UI.
	const [user, setUser] = useState(getInitialUser());

	// This loading state represents the initial session verification process.
	const [loading, setLoading] = useState(true);

	// This effect runs once on initial app load.
	useEffect(() => {
		const verifyUserSession = async () => {
			try {
				// Fetch the latest user profile from the server to ensure data isn't stale.
				const response = await apiService.getUserProfile();
				const freshUserData = response.data;
				setUser(freshUserData);
				localStorage.setItem("user", JSON.stringify(freshUserData));
			} catch (error) {
				// If the session token is invalid, clear the user state.
				setUser(null);
				localStorage.removeItem("user");
			} finally {
				setLoading(false);
			}
		};

		// --- THE FIX ---
		// Only verify the session if a user was found in localStorage on startup.
		// If there's no user, we don't need to make an API call; just finish loading.
		if (user) {
			verifyUserSession();
		} else {
			setLoading(false);
		}
	}, []); // The `user` in the condition refers to the initial state, so an empty dependency array is correct.

	// Memoized login function.
	const login = useCallback(async (identifier, password) => {
		try {
			const response = await apiService.login(identifier, password);
			if (response?.success && response?.data) {
				const userData = response.data.user;
				setUser(userData);
				localStorage.setItem("user", JSON.stringify(userData));
			} else {
				setUser(null);
			}
			return response;
		} catch (error) {
			setUser(null);
			throw error;
		}
	}, []);

	// Memoized logout function.
	const logout = useCallback(async () => {
		try {
			await apiService.logout();
		} catch (error) {
			console.error("❌ Logout API error:", error);
		} finally {
			setUser(null);
			localStorage.removeItem("user");
		}
	}, []);

	// Memoized signup function.
	const signup = useCallback(
		async (username, fullname, password, email, role, avatar) => {
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
		},
		[],
	);

	// Memoized email resend function.
	const resendVerifyEmail = useCallback(async (email) => {
		try {
			return await apiService.resendVerifyEmail(email);
		} catch (error) {
			console.error("❌ Resend verify email error:", error);
			throw error;
		}
	}, []);

	// Derived state, computed directly from the `user` object.
	const isAuthenticated = !!user;
	const userID = user?._id || null;

	// Memoize the context value to prevent unnecessary re-renders.
	const value = useMemo(() => {
		return {
			user,
			userID,
			loading,
			isAuthenticated,
			login,
			logout,
			signup,
			resendVerifyEmail,
		};
	}, [
		user,
		loading,
		isAuthenticated,
		userID,
		login,
		logout,
		signup,
		resendVerifyEmail,
	]);

	// Provide the context value to the rest of the app.
	return (
		<AuthContext.Provider value={value}>
			{loading ? (
				<div className="flex min-h-screen items-center justify-center">
					<div className="text-center">
						<div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-primary" />
						<p className="mt-4 text-text-secondary">Initializing...</p>
					</div>
				</div>
			) : (
				children
			)}
		</AuthContext.Provider>
	);
};
