import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import {
  FiChevronDown,
  FiFolder,
  FiHome,
  FiPlusSquare,
  FiLogOut,
  FiSettings,
  FiUser,
  FiCalendar,
} from "react-icons/fi"
import { NavLink, useNavigate } from "react-router-dom"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import CreateProjectModal from "../project/CreateProjectModal"

// A reusable NavLink class function
const getNavLinkClasses = ({ isActive }) =>
  `flex items-center px-4 py-3 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all duration-200 group ${isActive ? "bg-light-blue text-ocean-blue" : ""
  }`

/**
 * Main Sidebar Component
 */
const Sidebar = () => {
  const [projects, setProjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(true) // Default to open
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth() // Get the authenticated user

  useEffect(() => {
    // Only fetch projects if the user is authenticated
    if (user) {
      const fetchProjects = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const response = await apiService.getAllProjects()
          if (response.success) {
            // FIX: Added a fallback to an empty array to prevent crashes
            setProjects(response.data?.projects || [])
          } else {
            throw new Error(response.message || "Failed to fetch projects")
          }
        } catch (err) {
          console.error("Failed to fetch projects for sidebar", err)
          setError(err.message)
        } finally {
          setIsLoading(false)
        }
      }
      fetchProjects()
    } else {
      // If no user, clear projects
      setProjects([])
    }
  }, [user]) // Re-run effect when user changes

  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [newProject, ...prevProjects])
    // Optionally, open the project menu if it's closed
    if (!isProjectMenuOpen) {
      setIsProjectMenuOpen(true)
    }
  }

  // Helper component for rendering the project list
  const renderProjectList = () => {
    if (isLoading) {
      return <div className="px-4 py-2 text-slate-500">Loading projects...</div>
    }
    if (error) {
      return <div className="px-4 py-2 text-red-500">Error: {error}</div>
    }
    if (projects.length === 0) {
      return <div className="px-4 py-2 text-slate-500">No projects yet.</div>
    }
    return (
      <AnimatePresence>
        {projects.map((project, index) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={`/project/${project._id}`}
              className={getNavLinkClasses}
            >
              <FiFolder className="mr-3 w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">{project.name}</span>
            </NavLink>
          </motion.div>
        ))}
      </AnimatePresence>
    )
  }

  return (
    <>
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-80 h-screen bg-slate-100 flex flex-col border-r border-slate-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-slate-900"
          >
            TaskFlow
          </motion.h1>
          <p className="text-slate-700 text-sm mt-1">Manage with style</p>
        </div>

        {/* Navigation (Main + Projects) */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {/* Dashboard Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <NavLink to="/dashboard" className={getNavLinkClasses}>
              <FiHome className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              Dashboard
            </NavLink>
          </motion.div>


          {/* Projects Section Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <button
              className="flex w-full items-center justify-between px-4 py-3 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all duration-200 group"
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
            >
              <div className="flex items-center">
                <FiFolder className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                Projects
              </div>
              <div className="flex items-center">
                {!isLoading && !error && (
                  <span className="text-xs bg-light-blue text-ocean-blue px-2 py-0.5 rounded-full mr-2">
                    {projects.length}
                  </span>
                )}
                <FiChevronDown
                  className={`w-4 h-4 text-slate-700 transition-transform duration-200 ${isProjectMenuOpen ? "rotate-180" : ""
                    }`}
                />
              </div>
            </button>
          </motion.div>

          {/* Collapsable Project List */}
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
                  {renderProjectList()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            <NavLink to="/calendar" className={getNavLinkClasses}>
              <FiCalendar className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              Calendar
            </NavLink>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            <NavLink to="/settings" className={getNavLinkClasses}>
              <FiSettings className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              Settings
            </NavLink>
          </motion.div>
        </nav>

        {/* Create Project Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 pt-2 border-t border-slate-200"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex w-full items-center justify-center rounded-md btn-primary px-4 py-2 text-white transition-colors"
          >
            <FiPlusSquare className="mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Create Project
          </button>
        </motion.div>

        {/* --- FIX: ADDED MISSING USER MENU --- */}
        <SidebarUserMenu />

      </motion.div>

      {/* Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  )
}

/**
 * User Menu Component for the Sidebar
 */
const SidebarUserMenu = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (!user) {
    // Render a placeholder to prevent layout shift
    return <div className="p-6 border-t border-slate-200 h-[88px]"></div>
  }


}

export default Sidebar