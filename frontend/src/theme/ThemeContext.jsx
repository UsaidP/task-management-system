import { createContext, useCallback, useContext, useEffect, useState } from "react"

// 1. Create the context
const ThemeContext = createContext()

// Helper to get the effective theme
const getEffectiveTheme = (saved, prefersDark) => {
  if (saved && saved !== "system") return saved
  return prefersDark ? "dark" : "light"
}

// 2. Create the provider component
export const AppThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme")
    return saved || "light"
  })

  const [prefersDark, setPrefersDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  )

  // 3. Listen for OS theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e) => setPrefersDark(e.matches)

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // 4. Apply theme class to root element
  useEffect(() => {
    const root = window.document.documentElement
    const effectiveTheme = getEffectiveTheme(theme, prefersDark)

    root.classList.remove("light", "dark")
    root.classList.add(effectiveTheme)

    if (theme !== "system") {
      localStorage.setItem("theme", theme)
    }
  }, [theme, prefersDark])

  // 5. Function to set the theme
  const setThemeValue = useCallback((newTheme) => {
    setTheme(newTheme)
  }, [])

  // 6. Function to toggle the theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : prev === "dark" ? "light" : "light"))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeValue, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 6. Custom hook to easily use the context
export const useTheme = () => {
  return useContext(ThemeContext)
}
