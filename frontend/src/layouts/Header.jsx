import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { FiChevronDown, FiLogOut, FiMenu, FiSettings, FiUser } from "react-icons/fi"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/customHook.js"
import { useSidebar } from "../contexts/SidebarContext.jsx"
import { getOptimizedAvatarUrl } from "../utils/imageHelpers.js"

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { toggleSidebar } = useSidebar()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isUserMenuOpen])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false)
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isUserMenuOpen])

  const userInitial = user?.fullname?.charAt(0)?.toUpperCase() || "U"
  const userName = user?.fullname || "User"
  const userRole = user?.role?.toUpperCase() || "USER"

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 transition-colors duration-200 border-b sm:px-6 sm:py-4 bg-light-bg-primary dark:bg-dark-bg-primary border-light-border dark:border-dark-border">
      {/* Left side: Mobile menu toggle + breadcrumbs placeholder */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 mr-3 transition-colors rounded-lg lg:hidden sm:mr-4 text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
          aria-label="Toggle sidebar"
          aria-expanded={false}
        >
          <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
        </button>
        <img
          src="/logo-light.png"
          alt="TaskFlow logo"
          width="120"
          height="36"
          className="h-9 w-auto object-contain flex-shrink-0 lg:hidden dark:invert dark:brightness-110 dark:contrast-110"
        />
      </div>

      {/* Right side: User Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
            ref={menuRef}
          >
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors duration-200 focus-visible-ring"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              aria-controls="user-menu"
            >
              <div className="hidden text-right sm:block">
                <div className="text-xs font-medium sm:text-sm text-light-text-primary dark:text-dark-text-primary">
                  {userName}
                </div>
                <div className="text-[10px] sm:text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {userRole}
                </div>
              </div>

              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-semibold text-white transition-transform duration-200 origin-center border rounded-full shadow-sm sm:w-9 sm:h-9 bg-accent-primary hover:scale-105 border-light-border/20">
                {user?.avatar?.url ? (
                  <img
                    alt={`${userName}'s avatar`}
                    className="object-cover w-full h-full rounded-full"
                    src={getOptimizedAvatarUrl(user.avatar.url, 100)}
                    width="40"
                    height="40"
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <span className="text-sm sm:text-base">{userInitial}</span>
                )}
              </div>

              <FiChevronDown
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block text-light-text-tertiary transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  role="menu"
                  id="user-menu"
                  className="absolute right-0 z-50 w-56 mt-2 overflow-hidden origin-top-right border shadow-lg top-full bg-light-bg-primary dark:bg-dark-bg-tertiary rounded-xl border-light-border dark:border-dark-border"
                >
                  <div className="px-4 py-3 border-b sm:hidden border-light-border dark:border-dark-border">
                    <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      {userName}
                    </div>
                    <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      {userRole}
                    </div>
                  </div>

                  <div className="py-2">
                    <NavLink
                      to="/profile"
                      role="menuitem"
                      className="flex items-center px-4 py-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary/20"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4 mr-3" aria-hidden="true" />
                      Profile
                    </NavLink>

                    <NavLink
                      to="/settings"
                      role="menuitem"
                      className="flex items-center px-4 py-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary/20"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiSettings className="w-4 h-4 mr-3" aria-hidden="true" />
                      Settings
                    </NavLink>

                    <div className="my-1 border-t border-light-border dark:border-dark-border" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleLogout()
                      }}
                      role="menuitem"
                      className="w-full flex items-center px-4 py-2.5 text-sm text-accent-danger hover:bg-accent-danger/10 dark:hover:bg-accent-danger/20 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-danger/20"
                    >
                      <FiLogOut className="w-4 h-4 mr-3" aria-hidden="true" />
                      Logout
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
