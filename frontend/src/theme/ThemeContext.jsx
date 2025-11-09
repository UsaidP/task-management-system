import React, { createContext, useContext, useState, useEffect } from "react"

// 1. Create the context
const ThemeContext = createContext()

// 2. Create the provider component (RENAMED)
export const AppThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light") // Default theme

  // 3. Effect to set initial theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme) {
      setTheme(savedTheme)
    } else if (prefersDark) {
      setTheme("dark")
    }
  }, [])

  // 4. Effect to apply theme class and save to localStorage
  useEffect(() => {
    const root = window.document.documentElement

    // Remove old theme class
    root.classList.remove("light", "dark")

    // Add new theme class
    root.classList.add(theme)

    // Save to localStorage
    localStorage.setItem("theme", theme)
  }, [theme])

  // 5. Function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

// 6. Custom hook to easily use the context (no change)
export const useTheme = () => {
  return useContext(ThemeContext)
}
