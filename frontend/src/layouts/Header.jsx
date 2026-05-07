import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import {
  ChevronDownIcon as ChevronDown,
  LogoutIcon as LogOut,
  MenuIcon as Menu,
  UserIcon as User,
} from "@animateicons/react/lucide"
import { NavLink, useNavigate } from "react-router-dom"
import Logo from "../components/common/Logo.jsx"
import { useAuth } from "../contexts/customHook.js"
import { useSidebar } from "../contexts/SidebarContext.jsx"
import { getOptimizedAvatarUrl } from "../utils/imageHelpers.js"

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
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
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b sm:px-6 sm:py-4 bg-light-bg-primary/80 dark:bg-dark-bg-primary/80 backdrop-blur-xl border-light-border/60 dark:border-dark-border/60">
      {/* Left side: Mobile menu toggle + logo */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 mr-2 transition-all duration-150 rounded-xl lg:hidden sm:mr-3 text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover active:scale-90 focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
          aria-label="Toggle sidebar"
          aria-expanded={false}
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
        </button>
        <Logo size="sm" to="/overview" className="lg:hidden" />
      </div>

      {/* Right side: User Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
            ref={menuRef}
          >
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl interactive-card hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all duration-200 focus-visible-ring group"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              aria-controls="user-menu"
            >
              <div className="hidden text-right sm:block">
                <div className="text-xs font-medium sm:text-sm text-light-text-primary dark:text-dark-text-primary">
                  {userName}
                </div>
                <div className="text-[10px] sm:text-xs text-light-text-secondary dark:text-dark-text-secondary font-mono tracking-wider">
                  {userRole}
                </div>
              </div>

              {/* Avatar with terracotta ring and scale on hover */}
              <div className="relative flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                <div className="flex items-center justify-center w-8 h-8 font-semibold text-white border-2 rounded-full shadow-sm sm:w-9 sm:h-9 bg-accent-primary border-accent-primary/30 shadow-accent-primary/20">
                  {user?.avatar?.url && !avatarFailed ? (
                    <img
                      alt={`${userName}'s avatar`}
                      className="object-cover w-full h-full rounded-full"
                      src={getOptimizedAvatarUrl(user.avatar.url, 100)}
                      width="40"
                      height="40"
                      loading="eager"
                      decoding="async"
                      onError={() => setAvatarFailed(true)}
                    />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </div>
                {/* Online status dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 rounded-full status-dot border-light-bg-primary dark:border-dark-bg-primary" />
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block text-light-text-tertiary transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  role="menu"
                  id="user-menu"
                  className="absolute right-0 z-50 mt-2 overflow-hidden origin-top-right border shadow-xl w-60 top-full bg-light-bg-primary dark:bg-dark-bg-tertiary rounded-2xl border-light-border dark:border-dark-border backdrop-blur-xl"
                >
                  {/* Mobile user info header */}
                  <div className="px-4 py-3 border-b sm:hidden border-light-border/60 dark:border-dark-border/60 bg-light-bg-secondary/50 dark:bg-dark-bg-secondary/50">
                    <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      {userName}
                    </div>
                    <div className="font-mono text-xs tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
                      {userRole}
                    </div>
                  </div>

                  <div className="p-1.5">
                    <NavLink
                      to="/profile"
                      role="menuitem"
                      className="flex items-center px-3 py-2.5 text-sm rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-accent-primary hover:bg-accent-primary/5 dark:hover:bg-accent-primary/10 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary/20"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" aria-hidden="true" />
                      Profile
                    </NavLink>

                    <div className="mx-2 my-1 border-t border-light-border/40 dark:border-dark-border/40" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleLogout()
                      }}
                      role="menuitem"
                      className="w-full flex items-center px-3 py-2.5 text-sm rounded-xl text-accent-danger hover:bg-accent-danger/10 dark:hover:bg-accent-danger/15 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-danger/20"
                    >
                      <LogOut className="w-4 h-4 mr-3" aria-hidden="true" />
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
