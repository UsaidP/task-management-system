import { LayersIcon, LayoutListIcon, SettingsIcon, UsersIcon } from "@animateicons/react/lucide"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowLeftIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import apiService from "../../service/apiService.js"
import ProjectAdminMembers from "../components/project/admin/ProjectAdminMembers.jsx"
import ProjectAdminOverview from "../components/project/admin/ProjectAdminOverview.jsx"
import ProjectAdminSettings from "../components/project/admin/ProjectAdminSettings.jsx"
import ProjectAdminTasks from "../components/project/admin/ProjectAdminTasks.jsx"

const TABS = [
  { id: "overview", label: "Overview", icon: LayersIcon },
  { id: "members", label: "Members", icon: UsersIcon },
  { id: "tasks", label: "Tasks", icon: LayoutListIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
]

const ProjectAdminPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [project, setProject] = useState(null)
  const [stats, setStats] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const reduceMotion = useReducedMotion()

  const fetchData = useCallback(async () => {
    if (!projectId || projectId === "undefined") return
    setLoading(true)
    try {
      const [projectRes, statsRes, membersRes] = await Promise.all([
        apiService.getProjectById(projectId),
        apiService.getProjectAdminStats(projectId),
        apiService.getProjectAdminMembers(projectId),
      ])
      if (projectRes.success) setProject(projectRes.data)
      if (statsRes.success) setStats(statsRes.data)
      if (membersRes.success) setMembers(membersRes.data)
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load admin data"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleBack = () => {
    navigate(`/project/${projectId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-canvas">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-2 rounded-full border-accent-primary/20" />
            <div className="absolute inset-0 border-2 border-transparent rounded-full animate-spin border-t-accent-primary" />
          </div>
          <p className="mt-4 text-sm font-medium text-text-secondary">Loading admin page...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-bg-canvas"
    >
      {/* Header — glassmorphism */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-4 border-b border-light-border/60 dark:border-dark-border/60 bg-light-bg-primary/80 backdrop-blur-xl dark:bg-dark-bg-primary/80 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 transition-all duration-150 rounded-xl text-text-secondary hover:bg-bg-hover hover:text-accent-primary active:scale-90"
            aria-label="Back to project"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight text-text-primary sm:text-xl">
              {project?.name || "Project"} Admin
            </h1>
            <p className="text-sm text-text-secondary">Manage your project settings and team</p>
          </div>
        </div>
      </header>

      {/* Tabs — enhanced with indicator */}
      <nav className="border-b border-light-border/60 dark:border-dark-border/60 bg-light-bg-secondary/50 dark:bg-dark-bg-tertiary/50 backdrop-blur-sm">
        <div className="flex gap-1 px-4 py-2 overflow-x-auto sm:px-6">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? "bg-accent-primary/12 text-primary shadow-sm ring-1 ring-accent-primary/20" : "text-light-text-tertiary hover:bg-bg-hover hover:text-light-text-secondary dark:hover:text-dark-text-secondary"}`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                />
                <span className="hidden sm:inline">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="p-4 sm:p-6"
      >
        <div className="border shadow-sm rounded-2xl border-light-border/60 dark:border-dark-border/60 bg-bg-canvas">
          <div className="p-4 sm:p-6">
            {activeTab === "overview" && (
              <ProjectAdminOverview
                stats={stats}
                projectId={projectId}
                project={project}
                members={members}
                onRefresh={fetchData}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === "members" && (
              <ProjectAdminMembers
                members={members}
                setMembers={setMembers}
                projectId={projectId}
                onRefresh={fetchData}
              />
            )}
            {activeTab === "tasks" && <ProjectAdminTasks stats={stats} projectId={projectId} />}
            {activeTab === "settings" && (
              <ProjectAdminSettings
                project={project}
                setProject={setProject}
                projectId={projectId}
              />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ProjectAdminPage
