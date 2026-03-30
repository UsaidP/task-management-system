import { AnimatePresence, motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"
import { FiChevronDown, FiLogOut, FiMenu, FiSettings, FiUser } from "react-icons/fi"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/customHook.js"
import { useSidebar } from "../context/SidebarContext.jsx"

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
    <header className="flex items-center justify-between px-6 py-4 bg-light-bg-primary dark:bg-dark-bg-primary border-b border-light-border dark:border-dark-border sticky top-0 z-40 transition-colors duration-200">
      {/* Left side: Mobile menu toggle + breadcrumbs placeholder */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden mr-4 p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
          aria-label="Toggle sidebar"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        <span className="text-light-text-primary dark:text-dark-text-primary font-serif font-semibold text-lg lg:hidden">
          TaskFlow
        </span>
      </div>

      {/* Right side: User Menu */}
      <div className="flex items-center gap-4">
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
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors duration-200 focus-visible-ring"
              aria-expanded={isUserMenuOpen}
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  {userName}
                </div>
                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {userRole}
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-accent-primary flex items-center justify-center text-white font-semibold flex-shrink-0 origin-center hover:scale-105 transition-transform duration-200 shadow-sm border border-light-border/20">
                {user?.avatar?.url ? (
                  <img
                    alt="User Avatar"
                    className="w-full h-full object-cover rounded-full"
                    src={user.avatar.url}
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>

              <FiChevronDown
                className={`w-4 h-4 hidden sm:block text-light-text-tertiary transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-56 bg-light-bg-primary dark:bg-dark-bg-tertiary rounded-xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden z-50 origin-top-right"
                >
                  <div className="sm:hidden px-4 py-3 border-b border-light-border dark:border-dark-border">
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
                      className="flex items-center px-4 py-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiUser className="mr-3 w-4 h-4" />
                      Profile
                    </NavLink>

                    <NavLink
                      to="/settings"
                      className="flex items-center px-4 py-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiSettings className="mr-3 w-4 h-4" />
                      Settings
                    </NavLink>

                    <div className="border-t border-light-border dark:border-dark-border my-1" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-accent-danger hover:bg-accent-danger/10 dark:hover:bg-accent-danger/20 transition-colors"
                    >
                      <FiLogOut className="mr-3 w-4 h-4" />
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
