import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// --- DEPENDENCIES START ---

// 1. Import real React Icons
import { FiSun, FiMoon } from 'react-icons/fi';

// 2. Mock useTheme hook
// This mock will make the toggle functional in the preview
const useTheme = () => {
  const [theme, setTheme] = useState('light'); // Default to light

  // Apply the theme to the <html> tag for Tailwind's `dark:` classes to work
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    console.log('Toggling theme');
  };

  return { theme, toggleTheme };
};

// --- DEPENDENCIES END ---


const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
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
  );
};

export default ThemeToggle;