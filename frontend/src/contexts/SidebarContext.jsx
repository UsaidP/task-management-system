import { createContext, useCallback, useContext, useState } from "react"

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

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, isCollapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
