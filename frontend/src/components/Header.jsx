import React from "react";
import { useAuth } from "./context/customHook.js";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
      </div>
      <div className="flex items-center">
        <span className="mr-4 text-gray-800 dark:text-white">
          Welcome, {user.data?.fullname || "User"}
        </span>
        <button
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
