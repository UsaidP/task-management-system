import React, { useState } from "react";
import { useAuth } from "./context/customHook.js";

const Header = () => {
	const { user, logout } = useAuth();
	const [loading, setLoading] = useState(false);

	// Safely get the name.
	// 1. Use optional chaining `user?.fullname` to prevent errors if `user` is null/undefined.
	// 2. Provide a fallback empty string `|| ""` in case `fullname` doesn't exist.
	const displayName = user?.fullname || "";

	return loading ? (
		div
	) : (
		<header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
			<div>
				<h1 className="text-2xl font-bold text-gray-800 dark:text-white">
					Dashboard
				</h1>
			</div>
			<div className="flex items-center">
				<span className="mr-4 text-gray-800 dark:text-white">
					{/* If displayName has a value, show it. Otherwise, show "User". */}
					Welcome, {displayName ? displayName.toLocaleUpperCase() : "User"}
				</span>
				<button
					type="button"
					onClick={logout}
					className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
				>
					Logout
				</button>
			</div>
		</header>
	);
};

export default Header;
