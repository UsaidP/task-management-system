import { useAuth } from "./context/customHook.js"

const Header = () => {
  // We get the user and logout function directly from our auth context.
  const { user, logout } = useAuth()

  // Safely get the user's name.
  // 1. `user?.fullname` prevents errors if `user` is null.
  // 2. `|| "User"` provides a fallback if the name isn't available.
  const displayName = user?.fullname || "User"

  // We don't need a separate loading state here.
  // We can just render the header content. If the user object isn't loaded yet,
  // the AuthProvider's main loader will be showing, so this component won't even be visible.
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
      </div>
      <div className="flex items-center">
        <span className="mr-4 text-gray-800 dark:text-white">
          {/* Display the name in uppercase */}
          Welcome, {displayName.toLocaleUpperCase()}
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
  )
}

export default Header
