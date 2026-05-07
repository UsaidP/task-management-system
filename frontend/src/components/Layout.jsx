import { useSidebar } from "../contexts/SidebarContext.jsx"
import Header from "../layouts/Header.jsx"
import Sidebar from "../layouts/Sidebar.jsx"

const Layout = ({ children }) => {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden bg-light-bg-primary dark:bg-dark-bg-primary selection:bg-accent-primary/20 selection:text-accent-primary">
      {/* Sidebar is fixed on desktop and acts as a drawer on mobile */}
      <Sidebar />

      {/* Main Content Wrapper — smooth resize with ease-out-expo */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-bg-primary dark:bg-dark-bg-primary scrollbar-thin scrollbar-thumb-light-border dark:scrollbar-thumb-dark-border scrollbar-track-transparent">
          <div className="mx-auto w-full h-full max-w-[1400px] px-4 sm:px-6 py-4 sm:py-6">
            <div className="smooth-resize">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
