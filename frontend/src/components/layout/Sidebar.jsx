import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import {
  FiCalendar,
  FiCheckSquare,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiFolder,
  FiFolderPlus,
  FiHome,
  FiList,
  FiPlusSquare,
  FiSettings,
  FiX,
} from "react-icons/fi"
import { NavLink } from "react-router-dom"
import { useMediaQuery } from "../../../hooks/useMediaQuery"
import apiService from "../../../service/apiService"
import { useAuth } from "../context/customHook"
import { useFilter } from "../context/FilterContext"
import { useSidebar } from "../context/SidebarContext"
import { EmptyState, NetworkError } from "../ErrorStates"
import CreateProjectModal from "../project/CreateProjectModal"

const Sidebar = () => {
  const [projects, setProjects] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recentProjects, setRecentProjects] = useState([])

  const { user } = useAuth()
  const { isSidebarOpen, toggleSidebar, isCollapsed, toggleCollapse } = useSidebar()
  const { projectFilter, setProjectFilter, sprintFilter, setSprintFilter } = useFilter()
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const [sprints, setSprints] = useState([])
  const [sprintsLoading, setSprintsLoading] = useState(false)
  const [isSprintMenuOpen, setIsSprintMenuOpen] = useState(false)

  const fetchSprintsForProject = async (projectId) => {
    if (!projectId) {
      setSprints([])
      return
    }
    try {
      setSprintsLoading(true)
      const response = await apiService.getSprintsByProject(projectId)
      if (response?.success) {
        setSprints(response.data || [])
      }
    } catch (err) {
      console.error("Sidebar: Failed to fetch sprints", err)
    } finally {
      setSprintsLoading(false)
    }
  }

  const handleProjectFilterClick = (projectId) => {
    setProjectFilter(projectId)
    setSprintFilter(null)
    setSprints([])
    trackProjectClick(projectId)
    handleMobileNavClick()
    if (projectId) {
      fetchSprintsForProject(projectId)
    }
  }

  const fetchProjects = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiService.getAllProjects()
      if (response?.success) {
        const allProjects = response.data?.projects || []
        setProjects(allProjects)

        // Filter to projects where user is a member or owner
        const userId = user._id
        const userProjects = allProjects.filter(
          (p) =>
            p.createdBy === userId ||
            (p.members && p.members.some((m) => m.user === userId || m._id === userId))
        )
        setMyProjects(userProjects)
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

  // Load recent projects from localStorage
  const loadRecentProjects = () => {
    try {
      const stored = localStorage.getItem("recentProjects")
      if (stored) {
        const recentIds = JSON.parse(stored)
        const recent = projects.filter((p) => recentIds.includes(p._id))
        setRecentProjects(recent)
      }
    } catch (e) {
      console.error("Failed to load recent projects", e)
    }
  }

  // Track when user clicks a project
  const trackProjectClick = (projectId) => {
    try {
      const stored = localStorage.getItem("recentProjects")
      let recentIds = stored ? JSON.parse(stored) : []
      recentIds = recentIds.filter((id) => id !== projectId)
      recentIds.unshift(projectId)
      recentIds = recentIds.slice(0, 5) // Keep only 5 recent
      localStorage.setItem("recentProjects", JSON.stringify(recentIds))
      loadRecentProjects()
    } catch (e) {
      console.error("Failed to track project click", e)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [user])

  useEffect(() => {
    if (projects.length > 0) {
      loadRecentProjects()
    }
  }, [projects])

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev])
    setMyProjects((prev) => [newProject, ...prev])
    setIsProjectMenuOpen(true)
  }

  const handleMobileNavClick = () => {
    if (!isDesktop) toggleSidebar()
  }

  const NavItem = ({ to, icon: Icon, label }) => {
    return (
      <NavLink
        to={to}
        onClick={handleMobileNavClick}
        title={isCollapsed ? label : ""}
        className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative
           ${
             isActive
               ? "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-accent-primary dark:text-accent-primary-light border-l-4 border-accent-primary"
               : "text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover border-l-4 border-transparent"
           }
           ${isCollapsed ? "justify-center px-0 w-12 mx-auto" : ""}
        `
        }
      >
        <div className={`flex items-center justify-center ${isCollapsed ? "w-full" : ""}`}>
          <Icon
            className={`w-5 h-5 flex-shrink-0 transition-transform ${isCollapsed ? "" : "mr-3"} group-hover:scale-110`}
          />
        </div>
        {!isCollapsed && <span className="truncate">{label}</span>}
      </NavLink>
    )
  }

  const renderProjectList = () => {
    if (isLoading)
      return <div className="px-4 py-2 text-xs text-light-text-tertiary">Loading...</div>
    if (error)
      return <div className="px-4 py-2 text-xs text-accent-danger">Failed to load projects</div>

    // Show user's projects only
    const displayProjects = myProjects

    if (displayProjects.length === 0) {
      return (
        !isCollapsed && (
          <div className="px-4 py-3">
            <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary text-center py-4">
              <FiFolder className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No projects yet</p>
              <p className="text-xs mt-1">Create your first project to get started</p>
            </div>
          </div>
        )
      )
    }

    // Separate recent projects from others
    const recentIds = recentProjects.map((p) => p._id)
    const recent = displayProjects.filter((p) => recentIds.includes(p._id))
    const others = displayProjects.filter((p) => !recentIds.includes(p._id))

    const renderProjectItem = (project, index, isRecent = false) => (
      <motion.div
        key={project._id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
      >
        <button
          onClick={() => handleProjectFilterClick(project._id)}
          title={isCollapsed ? project.name : ""}
          className={`flex items-center w-full px-4 py-2 mt-1 rounded-lg text-sm transition-colors group
            ${
              projectFilter === project._id
                ? "bg-accent-primary/10 text-accent-primary dark:bg-accent-primary/20"
                : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover text-light-text-primary dark:hover:text-dark-text-primary"
            }
            ${isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : ""}
          `}
        >
          <div className={`flex items-center justify-center ${isCollapsed ? "w-full" : ""}`}>
            <span
              className={`w-2 h-2 rounded-full bg-accent-primary group-hover:scale-125 transition-transform ${isCollapsed ? "" : "mr-3"}`}
            />
          </div>
          {!isCollapsed && <span className="truncate">{project.name}</span>}
        </button>
      </motion.div>
    )

    return (
      <>
        {/* All Projects */}
        {!isCollapsed && projectFilter && (
          <button
            onClick={() => handleProjectFilterClick(null)}
            className="flex items-center w-full px-4 py-2 mt-1 rounded-lg text-sm text-accent-primary hover:bg-accent-primary/10 transition-colors"
          >
            <span className="mr-3 w-2 h-2 rounded-full bg-transparent border border-accent-primary" />
            <span className="truncate font-medium">All Projects</span>
          </button>
        )}

        {/* Recent Projects */}
        {!isCollapsed && recent.length > 0 && (
          <div className="mb-2">
            <p className="px-4 py-1 text-[10px] font-semibold text-light-text-tertiary uppercase tracking-wider">
              Recent
            </p>
            {recent.map((project, index) => renderProjectItem(project, index, true))}
          </div>
        )}

        {/* All Projects */}
        <div>
          {!isCollapsed && recent.length > 0 && (
            <p className="px-4 py-1 text-[10px] font-semibold text-light-text-tertiary uppercase tracking-wider">
              All Projects
            </p>
          )}
          {others.map((project, index) => renderProjectItem(project, index))}
        </div>
      </>
    )
  }

  // Mobile sidebar states
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  }

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-utility-overlay z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        variants={sidebarVariants}
        // Force fully open on mobile if triggered; on desktop use width transitions
        animate={isDesktop ? "open" : isSidebarOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 h-screen bg-light-bg-primary dark:bg-dark-bg-secondary 
                   border-r border-light-border dark:border-dark-border z-50 flex flex-col pt-4
                   transition-all duration-300 ease-in-out
                   ${isDesktop ? (isCollapsed ? "w-20" : "w-72") : "w-72"}`}
      >
        <div className="flex-none px-4 pb-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden ml-2">
            <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white flex-shrink-0">
              <span className="font-serif font-bold text-xl leading-none">T</span>
            </div>
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary truncate"
              >
                TaskFlow
              </motion.h1>
            )}
          </div>

          {/* Mobile close button */}
          {!isDesktop && (
            <button
              onClick={toggleSidebar}
              className="p-2 text-light-text-tertiary hover:text-accent-danger rounded-md"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}

          {/* Desktop collapse toggle */}
          {isDesktop && (
            <button
              onClick={toggleCollapse}
              className="p-1.5 text-light-text-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover rounded-md absolute -right-3 top-5 bg-light-bg-primary border border-light-border dark:bg-dark-bg-secondary dark:border-dark-border z-10"
            >
              {isCollapsed ? (
                <FiChevronRight className="w-3 h-3" />
              ) : (
                <FiChevronLeft className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Sprint Selector */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
            <p className="text-[10px] font-semibold text-light-text-tertiary uppercase tracking-wider mb-1 px-1">
              Active Sprint
            </p>
            <div className="relative">
              <button
                onClick={() => setIsSprintMenuOpen(!isSprintMenuOpen)}
                disabled={!projectFilter}
                className="flex items-center justify-between w-full px-3 py-2 text-sm bg-light-bg-secondary dark:bg-dark-bg-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover border border-light-border dark:border-dark-border rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-light-text-primary dark:text-dark-text-primary font-medium truncate">
                  {!projectFilter
                    ? "Select a project first"
                    : sprintFilter
                      ? sprints.find((s) => s._id === sprintFilter)?.name || "Sprint"
                      : "All Sprints"}
                </span>
                <FiChevronDown className="w-4 h-4 text-light-text-tertiary group-hover:text-light-text-primary" />
              </button>

              {isSprintMenuOpen && projectFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setSprintFilter(null)
                      setIsSprintMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors ${
                      !sprintFilter
                        ? "text-accent-primary font-medium bg-accent-primary/5"
                        : "text-light-text-primary dark:text-dark-text-primary"
                    }`}
                  >
                    All Sprints
                  </button>
                  {sprintsLoading ? (
                    <div className="px-3 py-2 text-xs text-light-text-tertiary">Loading...</div>
                  ) : sprints.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-light-text-tertiary">No sprints</div>
                  ) : (
                    sprints.map((sprint) => (
                      <button
                        key={sprint._id}
                        onClick={() => {
                          setSprintFilter(sprint._id)
                          setIsSprintMenuOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors ${
                          sprintFilter === sprint._id
                            ? "text-accent-primary font-medium bg-accent-primary/5"
                            : "text-light-text-primary dark:text-dark-text-primary"
                        }`}
                      >
                        {sprint.name}
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* VIEWS SECTION */}
          <div>
            {!isCollapsed && (
              <p className="px-5 mb-2 text-xs font-semibold text-light-text-tertiary uppercase tracking-wider">
                Views
              </p>
            )}
            <nav className="space-y-1">
              <NavItem to="/overview" icon={FiHome} label="Overview" />
              <NavItem to="/my-tasks" icon={FiCheckSquare} label="My Tasks" />
              <NavItem to="/timeline" icon={FiClock} label="Timeline" />
              <NavItem to="/table" icon={FiList} label="Table" />
              <NavItem to="/calendar" icon={FiCalendar} label="Calendar" />
            </nav>
          </div>

          {/* PROJECTS SECTION */}
          <div>
            {!isCollapsed ? (
              <div className="flex items-center justify-between px-5 mb-2">
                <p className="text-xs font-semibold text-light-text-tertiary uppercase tracking-wider flex items-center">
                  My Projects
                  {!isLoading && !error && (
                    <span className="ml-2 bg-light-bg-hover dark:bg-dark-bg-hover px-1.5 rounded-full text-[10px]">
                      {myProjects.length}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                    className="p-1 text-light-text-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover rounded transition-transform"
                    style={{ transform: isProjectMenuOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                  >
                    <FiChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1 text-light-text-tertiary hover:text-accent-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover rounded"
                    title="Create Project"
                  >
                    <FiPlusSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-2 text-light-text-tertiary hover:text-accent-primary hover:bg-light-bg-hover rounded-lg"
                  title="Create Project"
                >
                  <FiPlusSquare className="w-5 h-5" />
                </button>
              </div>
            )}

            {(isProjectMenuOpen || isCollapsed) && (
              <div className="space-y-1 pb-4">{renderProjectList()}</div>
            )}
          </div>
        </div>

        {/* BOTTOM QUICK ACTIONS (Settings, etc) */}
        <div className="flex-none p-3 border-t border-light-border dark:border-dark-border">
          <NavItem to="/setting" icon={FiSettings} label="Settings" />
        </div>
      </motion.aside>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  )
}

export default Sidebar
