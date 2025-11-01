import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./context/customHook.js";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiLogOut, FiSettings, FiUser } from "react-icons/fi";
import ThemeToggle from "../theme/ThemeToggle.jsx";

const Header = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isUserMenuOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isUserMenuOpen]);

  const userInitial = user?.fullname?.charAt(0)?.toUpperCase() || "U";
  const userName = user?.fullname || "User";
  const userRole = user?.role?.toUpperCase() || "USER";

  return (
    <header className="flex items-center justify-between px-4 py-4 bg-light-bg-primary dark:bg-dark-bg-primary shadow-md sticky top-0 z-40">
      <div className="flex items-center">

      </div>

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
              className="flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user?.avatar?.url ? (
                    <img
                      alt="User Avatar"
                      className="w-full h-full object-cover rounded-full"
                      src={user.avatar.url}
                    />
                  ) : (
                    <span>U</span>
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate max-w-32">
                    {userName}
                  </div>
                  <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate max-w-32">
                    {userRole}
                  </div>
                </div>
              </div>
              <FiChevronDown
                className={`w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary transition-transform duration-200 ml-2 ${isUserMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg shadow-xl border border-light-border dark:border-dark-border overflow-hidden z-50"
                >
                  <div className="md:hidden px-4 py-3 border-b border-light-border dark:border-dark-border">
                    <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                      {userName}
                    </div>
                    <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">
                      {userRole}
                    </div>
                  </div>

                  <div className="py-1">
                    <NavLink
                      to="/profile"
                      className="flex items-center px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiUser className="mr-3 w-4 h-4 flex-shrink-0" />
                      <span>Profile</span>
                    </NavLink>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full flex items-center px-4 py-3 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors duration-200"
                    >
                      <FiSettings className="mr-3 w-4 h-4 flex-shrink-0" />
                      <span>Settings</span>
                    </button>

                    <div className="border-t border-light-border dark:border-dark-border my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center px-4 py-3 text-accent-danger hover:bg-accent-danger/10 transition-colors duration-200"
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
  );
};

export default Header;