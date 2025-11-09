import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import {
  FiChevronDown,
  FiFolder,
  FiHome,
  FiPlusSquare,
  FiSettings,
  FiCalendar,
  FiX,
} from "react-icons/fi"
import { NavLink } from "react-router-dom"
import apiService from "../../../service/apiService"
import { useAuth } from "../context/customHook"
import CreateProjectModal from "../project/CreateProjectModal"
import { NetworkError, EmptyState } from "../ErrorStates"
import { useSidebar } from "../context/SidebarContext"
import { useMediaQuery } from "../../../hooks/useMediaQuery"

const getNavLinkClasses = ({ isActive }) =>
  `flex items-center px-4 py-3 rounded-lg text-light-text-secondary dark:text-dark-text-secondary 
   hover:text-light-text-primary dark:hover:text-dark-text-primary 
   hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all duration-200 group 
   ${
     isActive
       ? "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary"
       : ""
   }`

const Sidebar = () => {
  const [projects, setProjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const { isSidebarOpen, toggleSidebar } = useSidebar()

  // ✅ 2. Use the hook to detect screen size
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const fetchProjects = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiService.getAllProjects()
      if (response?.success) {
        setProjects(response.data?.projects || [])
      } else {
        setError(new Error("Failed to load projects"))
      }
    } catch (err) {
      console.error("Sidebar: Failed to fetch projects", err)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev])
    setIsProjectMenuOpen(true)
  }

  // Helper to close sidebar on mobile nav
  const handleMobileNavClick = () => {
    if (!isDesktop) {
      // Only run on mobile
      toggleSidebar()
    }
  }

  const renderProjectList = () => {
    if (isLoading)
      return (
        <div className="px-4 py-2 text-light-text-tertiary dark:text-dark-text-tertiary">
          Loading projects...
        </div>
      )
    if (error) return <NetworkError onRetry={fetchProjects} />
    if (projects.length === 0) return <EmptyState message="No projects yet." />

    return projects.map((project, index) => (
      <motion.div
        key={project._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: index * 0.03 }}
      >
        <NavLink
          to={`/project/${project._id}`}
          className={getNavLinkClasses}
          onClick={handleMobileNavClick} // Use helper
        >
          <FiFolder className="mr-3 w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="truncate">{project.name}</span>
        </NavLink>
      </motion.div>
    ))
  }

  // ✅ 3. Define animation variants
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  }

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen &&
          !isDesktop && ( // Only show overlay on mobile
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
          )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        variants={sidebarVariants} // ✅ 4. Use variants
        // ✅ 5. THE MAIN FIX:
        // On desktop, always be "open".
        // On mobile, toggle based on "isSidebarOpen".
        animate={isDesktop ? "open" : isSidebarOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-72 h-screen bg-light-bg-secondary dark:bg-dark-bg-secondary 
                   flex flex-col border-r border-light-border dark:border-dark-border 
                   z-50 lg:sticky lg:z-auto"
        // Your classes here (fixed, lg:sticky) are PERFECT.
        // I removed lg:translate-x-0 as it's no longer needed.
      >
        {/* Header */}
        <div className="p-6 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary"
            >
              TaskFlow
            </motion.h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mt-1">
              Manage with style
            </p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover 
                       text-light-text-secondary dark:text-dark-text-secondary"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <NavLink
              to="/dashboard"
              className={getNavLinkClasses}
              onClick={handleMobileNavClick} // Use helper
            >
              <FiHome className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              Dashboard
            </NavLink>
          </motion.div>

          {/* Projects Section (No changes here, it's perfect) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <button
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
              className="flex w-full items-center justify-between px-4 py-3 rounded-lg 
                         text-light-text-secondary dark:text-dark-text-secondary 
                         hover:text-light-text-primary dark:hover:text-dark-text-primary 
                         hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover 
                         transition-all duration-200 group"
            >
              <div className="flex items-center">
                <FiFolder className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                Projects
              </div>
              <div className="flex items-center">
                {!isLoading && !error && (
                  <span
                    className="text-xs bg-light-bg-tertiary dark:bg-dark-bg-tertiary 
                                 text-light-text-primary dark:text-dark-text-primary 
                                 px-2 py-0.5 rounded-full mr-2"
                  >
                    {projects.length}
                  </span>
                )}
                <FiChevronDown
                  className={`w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary 
                             transition-transform duration-200 ${
                               isProjectMenuOpen ? "rotate-180" : ""
                             }`}
                />
              </div>
            </button>
          </motion.div>

          {/* Project List */}
          <AnimatePresence>
            {isProjectMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pl-4 pt-2 space-y-1 max-h-96 overflow-y-auto">
                  <AnimatePresence mode="popLayout">{renderProjectList()}</AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Other Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <NavLink
              to="/calendar"
              className={getNavLinkClasses}
              onClick={handleMobileNavClick} // Use helper
            >
              <FiCalendar className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              Calendar
            </NavLink>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <NavLink
              to="/settings"
              className={getNavLinkClasses}
              onClick={handleMobileNavClick} // Use helper
            >
              <FiSettings className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              Settings
            </NavLink>
          </motion.div>
        </nav>

        {/* Create Project Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 border-t border-light-border dark:border-dark-border"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex w-full items-center justify-center rounded-md 
                       bg-accent-primary hover:bg-accent-primary-dark px-4 py-2 text-white 
                       transition-all duration-200"
          >
            <FiPlusSquare className="mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Create Project
          </button>
        </motion.div>
      </motion.aside>

      {/* Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  )
}

export default Sidebar
