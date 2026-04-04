import { AnimatePresence, motion } from "framer-motion"

// --- DEPENDENCIES START ---

import { FiMoon, FiSun } from "react-icons/fi"
import { useTheme } from "./ThemeContext" // Use the real hook

// --- DEPENDENCIES END ---

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-light-bg-hover dark:bg-dark-bg-hover p-2 text-light-text-secondary dark:text-dark-text-secondary transition-colors hover:bg-light-border dark:hover:bg-dark-border hover:text-light-text-primary dark:hover:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, y: -20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1.0 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <FiSun className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, y: -20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1.0 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <FiMoon className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

export default ThemeToggle
