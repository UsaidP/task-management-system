import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  FolderOpenIcon,
  UsersIcon,
} from "@animateicons/react/lucide"
import { motion, useReducedMotion } from "framer-motion"
import { ArchiveIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import apiService from "../../../service/apiService"

const ITEMS_PER_PAGE = 10

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiService.getAdminProjectProgress()
        setProjects(res.data || [])
      } catch (err) {
        console.error("Failed to fetch projects:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    if (!search) return projects
    const q = search.toLowerCase()
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    )
  }, [projects, search])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const projectColors = [
    "bg-accent-primary",
    "bg-accent-info",
    "bg-accent-success",
    "bg-accent-warning",
    "bg-accent-danger",
    "bg-accent-purple",
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-48 h-10 rounded-xl animate-pulse bg-bg-elevated" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 p-6 border animate-pulse rounded-2xl border-border bg-bg-surface"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-text-primary">
            Projects
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 border rounded-xl border-border text-text-secondary hover:bg-bg-hover active:scale-95 cursor-pointer"
          >
            <DownloadIcon size={16} />
            Export
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="p-4 border shadow-sm rounded-2xl border-border bg-bg-surface"
      >
        <div className="relative">
          <Search
            size={18}
            className="absolute text-sm -translate-y-1/2 left-3 top-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-border bg-bg-canvas py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-light-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Projects",
            value: projects.length,
            icon: <FolderOpenIcon size={20} />,
            iconBg: "bg-accent-primary/10 text-accent-primary",
            delay: 0.1,
          },
          {
            label: "Total Tasks",
            value: projects.reduce((sum, p) => sum + (p.totalTasks || 0), 0),
            icon: <UsersIcon size={20} />,
            iconBg: "bg-accent-success/10 text-accent-success",
            delay: 0.15,
          },
          {
            label: "Avg Progress",
            value: `${projects.length > 0 ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length) : 0}%`,
            icon: <ArchiveIcon size={20} />,
            iconBg: "bg-accent-warning/10 text-accent-warning",
            delay: 0.2,
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: stat.delay, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-5 overflow-hidden border shadow-sm rounded-2xl border-border bg-bg-surface interactive-card group"
          >
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent group-hover:opacity-100" />
            <div className="relative flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.iconBg} transition-transform duration-200 group-hover:scale-110`}
                style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="font-serif text-2xl font-bold tracking-tight text-text-primary">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Cards */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {paginated.length === 0 && (
          <div className="p-12 text-center border col-span-full rounded-2xl border-border bg-bg-surface">
            <p className="text-lg text-text-muted">No projects found</p>
          </div>
        )}
        {paginated.map((project, index) => (
          <div
            key={project._id}
            className="relative p-6 overflow-hidden transition-all duration-300 border shadow-sm rounded-2xl border-border bg-bg-surface interactive-card group hover:shadow-md"
          >
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-accent-primary/3 via-transparent to-transparent group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${projectColors[index % projectColors.length]} shadow-sm`}
                  />
                  <Link
                    to={`/project/${project._id}`}
                    className="font-serif text-base font-semibold transition-colors duration-150 text-text-primary hover:text-accent-primary"
                  >
                    {project.name}
                  </Link>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-text-muted line-clamp-2">
                {project.description || "No description"}
              </p>

              <div className="flex items-center gap-4 mb-4 text-xs text-text-muted">
                <span>{project.totalTasks || 0} tasks</span>
                <span>{project.completedTasks || 0} completed</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Progress</span>
                  <span className="font-semibold text-text-primary">{project.progress || 0}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-bg-elevated">
                  <div
                    className={`h-full rounded-full ${projectColors[index % projectColors.length]} transition-all duration-700`}
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-light-border/60 dark:border-dark-border/60">
                <Link
                  to={`/project/${project._id}`}
                  className="flex-1 px-3 py-2 text-xs font-medium text-center transition-all duration-150 rounded-lg cursor-pointer bg-accent-primary/10 text-primary hover:bg-accent-primary/20 active:scale-95"
                >
                  View
                </Link>
                <Link
                  to={`/project/${project._id}/admin`}
                  className="flex-1 px-3 py-2 text-xs font-medium text-center transition-all duration-150 border rounded-lg cursor-pointer border-light-border/60 dark:border-dark-border/60 text-text-secondary hover:bg-bg-hover active:scale-95"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex items-center justify-between px-6 py-3 border shadow-sm rounded-2xl border-border bg-bg-surface"
        >
          <p className="text-sm text-text-muted">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center justify-center w-8 h-8 text-sm transition-all duration-150 border rounded-lg cursor-pointer border-border text-text-secondary hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            >
              <ChevronLeftIcon size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                return (
                  <span key={p} className="flex items-center">
                    {showEllipsis && <span className="px-1 text-text-muted">…</span>}
                    <button
                      type="button"
                      onClick={() => setPage(p)}
                      className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg cursor-pointer transition-all duration-150 ${p === page ? "bg-accent-primary text-white shadow-sm shadow-accent-primary/20" : "text-light-text-secondary hover:bg-bg-hover dark:hover:bg-dark-bg-hover"}`}
                    >
                      {p}
                    </button>
                  </span>
                )
              })}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center justify-center w-8 h-8 text-sm transition-all duration-150 border rounded-lg cursor-pointer border-border text-text-secondary hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
