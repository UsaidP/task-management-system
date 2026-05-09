import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import {
  ChevronDownIcon as ChevronDown,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  LayoutListIcon as List,
  SettingsIcon as Settings,
  XIcon as X,
} from "@animateicons/react/lucide"
import {
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Folder as FolderIcon,
  Home as HomeIcon,
  SquareCheck as CheckSquare,
  SquarePlus as PlusSquare,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { useMediaQuery } from "../../hooks/useMediaQuery.js"
import apiService from "../../service/apiService.js"
import Logo from "../components/common/Logo.jsx"
import CreateProjectModal from "../components/project/CreateProjectModal.jsx"
import { useAuth } from "../contexts/customHook.js"
import { useFilter } from "../contexts/FilterContext.jsx"
import { useSidebar } from "../contexts/SidebarContext.jsx"

const NavItem = ({ to, icon: Icon, label, isCollapsed, onClick }) => {
  const getClassName = ({ isActive }) => {
    const base =
      "flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative"
    const active =
      "bg-accent-primary/12 text-accent-primary dark:bg-accent-primary/20 shadow-sm ring-1 ring-accent-primary/20"
    const inactive =
      "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:text-accent-primary dark:hover:text-accent-primary"
    const collapsed = "justify-center px-0 w-12 mx-auto"

    return `${base} ${isActive ? active : inactive} ${isCollapsed ? collapsed : ""}`
  }

  return (
    <NavLink to={to} onClick={onClick} title={isCollapsed ? label : ""} className={getClassName}>
      {({ isActive }) => (
        <>
          {/* Left accent bar — spring animation on active */}
          {!isCollapsed && (
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200 ${
                isActive ? "h-5 bg-accent-primary" : "h-0 bg-transparent"
              }`}
              style={
                isActive
                  ? { transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
                  : undefined
              }
            />
          )}
          <div className={`flex items-center justify-center ${isCollapsed ? "w-full" : ""}`}>
            <Icon
              className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-200 ${isCollapsed ? "" : "mr-3"} ${
                isActive ? "scale-110" : "group-hover:scale-105"
              }`}
              aria-hidden="true"
            />
          </div>
          {!isCollapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  )
}

const Sidebar = () => {
  const [projects, setProjects] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recentProjects, setRecentProjects] = useState([])

  const { user } = useAuth()
  const navigate = useNavigate()
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
      // Navigate to the project page
      navigate(`/project/${projectId}`)
    }
  }

  const fetchProjects = useCallback(async () => {
    if (!user?._id) return
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiService.getAllProjects()
      if (response?.success) {
        const allProjects = response.data?.projects || []
        setProjects(allProjects)
        // Backend already filters to only return projects where user is a member
        // No need to filter again on frontend
        setMyProjects(allProjects)
      } else {
        setError(new Error("Failed to load projects"))
      }
    } catch (err) {
      console.error("Sidebar: Failed to fetch projects", err)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [user?._id])

  // Load recent projects from localStorage
  const loadRecentProjects = useCallback(() => {
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
  }, [projects])

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
    // ✅ Use user._id instead of full user object to prevent stale fetches
    if (!user?._id) return
    fetchProjects()
  }, [user?._id, fetchProjects])

  // Refetch projects when created from any CreateProjectModal (e.g. Overview page)
  useEffect(() => {
    const onProjectCreated = () => fetchProjects()
    window.addEventListener("project:created", onProjectCreated)
    return () => window.removeEventListener("project:created", onProjectCreated)
  }, [fetchProjects])

  useEffect(() => {
    if (projects.length > 0) {
      loadRecentProjects()
    }
  }, [projects, loadRecentProjects])

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev])
    setMyProjects((prev) => [newProject, ...prev])
    setIsProjectMenuOpen(true)
  }

  const handleMobileNavClick = () => {
    if (!isDesktop) toggleSidebar()
  }

  const renderProjectList = () => {
    if (isLoading)
      return (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 rounded-full border-accent-primary/30 border-t-accent-primary animate-spin" />
            <span className="text-xs text-light-text-tertiary">Loading...</span>
          </div>
        </div>
      )
    if (error)
      return <div className="px-4 py-2 text-xs text-accent-danger">Failed to load projects</div>

    // Show user's projects only
    const displayProjects = myProjects

    if (displayProjects.length === 0) {
      return (
        !isCollapsed && (
          <div className="px-4 py-3">
            <div className="py-4 text-sm text-center text-light-text-tertiary dark:text-dark-text-tertiary">
              <FolderIcon className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>No projects yet</p>
              <p className="mt-1 text-xs">Create your first project to get started</p>
            </div>
          </div>
        )
      )
    }

    // Separate recent projects from others
    const recentIds = recentProjects.map((p) => p._id)
    const recent = displayProjects.filter((p) => recentIds.includes(p._id))
    const others = displayProjects.filter((p) => !recentIds.includes(p._id))

    const renderProjectItem = (project, index, _isRecent = false) => {
      const isActive = projectFilter === project._id
      return (
        <motion.div
          key={project._id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: index * 0.03,
            duration: 0.25,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <button
            type="button"
            onClick={() => handleProjectFilterClick(project._id)}
            aria-pressed={isActive}
            title={isCollapsed ? project.name : ""}
            className={`flex items-center w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group border
              ${
                isActive
                  ? "bg-accent-primary/12 border-accent-primary/30 text-accent-primary dark:bg-accent-primary/20 dark:border-accent-primary/40 shadow-sm"
                  : "border-transparent text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:border-light-border dark:hover:border-dark-border"
              }
              ${isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto !rounded-lg !p-0" : ""}
            `}
          >
            <div className={`flex items-center justify-center ${isCollapsed ? "w-full" : ""}`}>
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? "bg-accent-primary shadow-sm shadow-accent-primary/40 scale-110"
                    : "bg-light-text-secondary/50 dark:bg-dark-text-secondary/50 group-hover:bg-accent-primary/70 group-hover:scale-110"
                } ${isCollapsed ? "" : "mr-3"}`}
                style={
                  isActive
                    ? { transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
                    : undefined
                }
              />
            </div>
            {!isCollapsed && (
              <span className="font-medium truncate text-light-text-primary dark:text-dark-text-primary">
                {project.name}
              </span>
            )}
          </button>
        </motion.div>
      )
    }

    return (
      <>
        {/* All Projects toggle */}
        {!isCollapsed && projectFilter && (
          <motion.button
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            type="button"
            onClick={() => handleProjectFilterClick(null)}
            className="flex items-center w-full px-3 py-2 mb-2 text-sm font-medium transition-all border rounded-xl text-accent-primary hover:bg-accent-primary/10 border-accent-primary/20 hover:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
          >
            <span className="w-2 h-2 mr-3 rounded-full bg-accent-primary" />
            <span className="truncate">All Projects</span>
          </motion.button>
        )}

        {/* Recent Projects */}
        {!isCollapsed && recent.length > 0 && (
          <div className="mb-3">
            <p className="px-3 py-1.5 text-[10px] font-bold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-widest">
              Recent
            </p>
            <div className="space-y-0.5">
              {recent.map((project, index) => renderProjectItem(project, index, true))}
            </div>
          </div>
        )}

        {/* All Projects */}
        <div>
          {!isCollapsed && recent.length > 0 && (
            <p className="px-3 py-1.5 text-[10px] font-bold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-widest">
              All Projects
            </p>
          )}
          <div className="space-y-0.5">
            {others.map((project, index) => renderProjectItem(project, index))}
          </div>
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
      {/* Mobile backdrop with backdrop-scrim */}
      <AnimatePresence>
        {isSidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 backdrop-scrim lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        variants={sidebarVariants}
        // Force fully open on mobile if triggered; on desktop use width transitions
        animate={isDesktop ? "open" : isSidebarOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 h-dvh bg-light-bg-primary dark:bg-dark-bg-secondary
                   border-r border-light-border/70 dark:border-dark-border/70 z-50 flex flex-col pt-4
                   transition-all duration-300
                   ${isDesktop ? (isCollapsed ? "w-20" : "w-72") : "w-72"}`}
        style={
          isDesktop ? { transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" } : undefined
        }
      >
        {/* Logo & Toggle Section */}
        <div className="flex items-center justify-between flex-none px-4 pb-4 border-b border-light-border/60 dark:border-dark-border/60">
          <div
            className={`flex items-center overflow-hidden transition-all duration-300 ${isCollapsed ? "w-10 justify-center" : "gap-3 ml-2"}`}
          >
            <Logo size="md" iconOnly={isCollapsed} to="/overview" />
          </div>

          {/* Mobile close button */}
          {!isDesktop && (
            <button
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="p-2 transition-all duration-150 rounded-xl text-light-text-tertiary hover:text-accent-danger hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover active:scale-90 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}

          {/* Desktop collapse toggle — positioned on border with shadow */}
          {isDesktop && (
            <button
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="absolute z-10 p-1.5 transition-all duration-200 -right-3 top-5 rounded-lg bg-light-bg-primary border border-light-border dark:bg-dark-bg-secondary dark:border-dark-border shadow-sm hover:shadow-md hover:scale-105 text-light-text-tertiary hover:text-accent-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover focus:outline-none focus:ring-2 focus:ring-accent-primary/20 active:scale-95"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
              ) : (
                <ChevronLeft className="w-3 h-3" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {/* Sprint Selector */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-light-border/60 dark:border-dark-border/60">
            <p className="text-[10px] font-semibold text-light-text-tertiary uppercase tracking-wider mb-1.5 px-1">
              Active Sprint
            </p>
            <div className="relative">
              <button
                onClick={() => setIsSprintMenuOpen(!isSprintMenuOpen)}
                disabled={!projectFilter}
                aria-expanded={isSprintMenuOpen}
                aria-haspopup="listbox"
                className="flex items-center justify-between w-full px-3 py-2 text-sm transition-all duration-200 border rounded-xl bg-light-bg-secondary dark:bg-dark-bg-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:border-light-border dark:hover:border-dark-border border-light-border/70 dark:border-dark-border/70 group disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              >
                <span className="font-medium truncate text-light-text-primary dark:text-dark-text-primary">
                  {!projectFilter
                    ? "Select a project first"
                    : sprintFilter
                      ? sprints.find((s) => s._id === sprintFilter)?.name || "Sprint"
                      : "All Sprints"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-light-text-tertiary group-hover:text-light-text-primary transition-transform duration-200 ${isSprintMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {isSprintMenuOpen && projectFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 right-0 z-50 mt-1 overflow-hidden border shadow-lg rounded-xl top-full bg-light-bg-primary dark:bg-dark-bg-secondary border-light-border dark:border-dark-border"
                  >
                    <button
                      onClick={() => {
                        setSprintFilter(null)
                        setIsSprintMenuOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary/20 ${
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
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary/20 ${
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
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {/* VIEWS SECTION — stagger-children for nav items */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[11px] font-bold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">
                Views
              </p>
            )}
            <nav className="space-y-0.5">
              <NavItem
                to="/overview"
                icon={HomeIcon}
                label="Overview"
                isCollapsed={isCollapsed}
                onClick={handleMobileNavClick}
              />
              <NavItem
                to="/my-tasks"
                icon={CheckSquare}
                label="My Tasks"
                isCollapsed={isCollapsed}
                onClick={handleMobileNavClick}
              />
              <NavItem
                to="/timeline"
                icon={ClockIcon}
                label="Timeline"
                isCollapsed={isCollapsed}
                onClick={handleMobileNavClick}
              />
              <NavItem
                to="/table"
                icon={List}
                label="Table"
                isCollapsed={isCollapsed}
                onClick={handleMobileNavClick}
              />
              <NavItem
                to="/calendar"
                icon={CalendarIcon}
                label="Calendar"
                isCollapsed={isCollapsed}
                onClick={handleMobileNavClick}
              />
            </nav>
          </div>

          {/* PROJECTS SECTION */}
          <div>
            {!isCollapsed ? (
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[11px] font-bold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  My Projects
                  {!isLoading && !error && myProjects.length > 0 && (
                    <span className="bg-accent-primary/10 text-accent-primary dark:bg-accent-primary/20 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                      {myProjects.length}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                    aria-expanded={isProjectMenuOpen}
                    aria-label="Toggle projects list"
                    className={`p-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${isProjectMenuOpen ? "" : "-rotate-90"}`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    aria-label="Create project"
                    className="p-1 transition-all duration-150 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover active:scale-90 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                    title="Create Project"
                  >
                    <PlusSquare className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  aria-label="Create project"
                  className="p-2 transition-all duration-150 rounded-lg text-light-text-tertiary hover:text-accent-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover active:scale-90 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  title="Create Project"
                >
                  <PlusSquare className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {(isProjectMenuOpen || isCollapsed) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 space-y-0.5">{renderProjectList()}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM QUICK ACTIONS (Settings, etc) */}
        <div className="flex-none p-3 border-t border-light-border/60 dark:border-dark-border/60">
          <NavItem
            to="/setting"
            icon={Settings}
            label="Settings"
            isCollapsed={isCollapsed}
            onClick={handleMobileNavClick}
          />
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
