import { createContext, useCallback, useContext, useMemo, useState } from "react"

const SidebarContext = createContext()

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Persist sidebar collapse state across page refreshes
    try {
      const saved = localStorage.getItem("sidebarCollapsed")
      return saved === "true"
    } catch {
      return false
    }
  })

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem("sidebarCollapsed", String(next))
      } catch {
        // Ignore storage errors
      }
      return next
    })
  }, [])

  // ✅ Memoize value object so identity is stable
  const value = useMemo(
    () => ({
      isSidebarOpen,
      toggleSidebar,
      isCollapsed,
      toggleCollapse,
    }),
    [isSidebarOpen, toggleSidebar, isCollapsed, toggleCollapse]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => useContext(SidebarContext)
