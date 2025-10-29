import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "./context/customHook.js"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FiChevronDown, FiLogOut, FiSettings, FiUser, FiMenu } from "react-icons/fi"
import { useTheme } from "../theme/ThemeContext.jsx"
import ThemeToggle from "../theme/ThemeToggle.jsx"

/**
 * Header Component
 * Displays application header with user menu and navigation
 */
const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)



  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
      // Optionally show a toast notification here
    }
  }

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isUserMenuOpen])

  /**
   * Close menu on Escape key
   */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => {
        document.removeEventListener("keydown", handleEscape)
      }
    }
  }, [isUserMenuOpen])

  // Get user data with fallbacks
  const userInitial = user?.fullname?.charAt(0)?.toUpperCase() || "U"
  const userName = user?.fullname || "User"
  const userRole = user?.role?.toUpperCase() || "USER"

  return (
    <header className="flex items-center justify-between px-4 py-4 bg-white shadow-md sticky top-0 z-40">
      {/* Left Section - Logo/Title */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-slate-900">
          {/* Add your app title or logo here */}
        </h1>
      </div>


      {/* Right Section - User Menu */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="relative"
            ref={menuRef}
          >
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:ring-offset-2"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-ocean-blue flex items-center justify-center text-white font-bold flex-shrink-0">
                  {userInitial}
                </div>

                {/* User Info - Hidden on mobile */}
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-slate-900 truncate max-w-32">
                    {userName}
                  </div>
                  <div className="text-xs text-slate-600 truncate max-w-32">
                    {userRole}
                  </div>
                </div>
              </div>

              {/* Chevron Icon */}
              <FiChevronDown
                className={`w-4 h-4 text-slate-700 transition-transform duration-200 ml-2 ${isUserMenuOpen ? "rotate-180" : ""
                  }`}
              />
            </button>


            {/* Dropdown Menu */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50"
                >
                  {/* User Info - Mobile Only */}
                  <div className="md:hidden px-4 py-3 border-b border-slate-200">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {userName}
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {userRole}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <NavLink
                      to="/profile"
                      className="flex items-center px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiUser className="mr-3 w-4 h-4 flex-shrink-0" />
                      <span>Profile</span>
                    </NavLink>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        // Add settings navigation or modal
                        navigate("/settings")
                      }}
                      className="w-full flex items-center px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200"
                    >
                      <FiSettings className="mr-3 w-4 h-4 flex-shrink-0" />
                      <span>Settings</span>
                    </button>

                    <div className="border-t border-slate-200 my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <FiLogOut className="mr-3 w-4 h-4 flex-shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </header>
  )
}

export default Header