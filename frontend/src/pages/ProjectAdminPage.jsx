import { motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { FiArrowLeft, FiLayers, FiList, FiSettings, FiUsers } from "react-icons/fi"
import { useNavigate, useParams } from "react-router-dom"
import apiService from "../../service/apiService.js"
import ProjectAdminMembers from "../components/project/admin/ProjectAdminMembers.jsx"
import ProjectAdminOverview from "../components/project/admin/ProjectAdminOverview.jsx"
import ProjectAdminSettings from "../components/project/admin/ProjectAdminSettings.jsx"
import ProjectAdminTasks from "../components/project/admin/ProjectAdminTasks.jsx"

const TABS = [
  { id: "overview", label: "Overview", icon: FiLayers },
  { id: "members", label: "Members", icon: FiUsers },
  { id: "tasks", label: "Tasks", icon: FiList },
  { id: "settings", label: "Settings", icon: FiSettings },
]

const ProjectAdminPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [project, setProject] = useState(null)
  const [stats, setStats] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

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
      <div className="flex min-h-screen items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-accent-primary" />
          <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
            Loading admin page...
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-light-border dark:border-dark-border bg-light-bg-primary/80 px-4 py-4 backdrop-blur-sm dark:bg-dark-bg-primary/80 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg p-2 text-light-text-secondary transition-colors hover:bg-light-bg-hover hover:text-light-text-primary dark:text-dark-text-secondary dark:hover:bg-dark-bg-hover dark:hover:text-dark-text-primary"
            aria-label="Back to project"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary sm:text-xl">
              {project?.name || "Project"} Admin
            </h1>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Manage your project settings and team
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary">
        <div className="flex gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-accent-primary/10 text-accent-primary"
                  : "text-light-text-tertiary hover:bg-light-bg-hover hover:text-light-text-secondary dark:text-dark-text-tertiary dark:hover:bg-dark-bg-hover dark:hover:text-dark-text-secondary"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
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
          <ProjectAdminSettings project={project} setProject={setProject} projectId={projectId} />
        )}
      </div>
    </motion.div>
  )
}

export default ProjectAdminPage
