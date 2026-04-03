import { useSidebar } from "../contexts/SidebarContext.jsx"
import Header from "./Header.jsx"
import Sidebar from "./Sidebar.jsx"

const Layout = ({ children }) => {
  const { isCollapsed } = useSidebar()

  return (
    <div className="flex h-screen bg-light-bg-primary dark:bg-dark-bg-primary overflow-hidden">
      {/* Sidebar is fixed on desktop and acts as a drawer on mobile */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-bg-primary dark:bg-dark-bg-primary p-4 sm:p-6">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout
