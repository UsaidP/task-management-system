import { createContext, useContext, useState } from "react"

const SidebarContext = createContext()

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false) // Desktop icon-only state

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, isCollapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
