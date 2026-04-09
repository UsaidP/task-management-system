import {
  Archive,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Users,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import apiService from "../../../service/apiService"

const ITEMS_PER_PAGE = 10

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

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
        <div className="animate-pulse h-10 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 h-48"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
            Projects
          </h1>
          <p className="text-sm text-light-text-tertiary mt-1">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-light-border dark:border-dark-border px-4 py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover cursor-pointer"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary py-2 pl-10 pr-4 text-sm text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/20"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary">
              <BarChart3 size={20} />
            </div>
            <div>
              <p className="text-sm text-light-text-tertiary">Total Projects</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
                {projects.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-success/10 text-accent-success">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm text-light-text-tertiary">Total Tasks</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
                {projects.reduce((sum, p) => sum + (p.totalTasks || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-warning/10 text-accent-warning">
              <Archive size={20} />
            </div>
            <div>
              <p className="text-sm text-light-text-tertiary">Avg Progress</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
                {projects.length > 0
                  ? Math.round(
                      projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paginated.length === 0 && (
          <div className="col-span-full rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-12 text-center">
            <p className="text-lg text-light-text-tertiary">No projects found</p>
          </div>
        )}
        {paginated.map((project, index) => (
          <div
            key={project._id}
            className="group rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${projectColors[index % projectColors.length]}`}
                />
                <Link
                  to={`/project/${project._id}`}
                  className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-accent-primary font-serif"
                >
                  {project.name}
                </Link>
              </div>
            </div>

            <p className="mb-4 line-clamp-2 text-sm text-light-text-tertiary">
              {project.description || "No description"}
            </p>

            <div className="mb-4 flex items-center gap-4 text-xs text-light-text-tertiary">
              <span>{project.totalTasks || 0} tasks</span>
              <span>{project.completedTasks || 0} completed</span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-light-text-tertiary">Progress</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {project.progress || 0}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
                <div
                  className={`h-full rounded-full ${projectColors[index % projectColors.length]} transition-all duration-700`}
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2 border-t border-light-border dark:border-dark-border pt-4">
              <Link
                to={`/project/${project._id}`}
                className="flex-1 rounded-lg bg-accent-primary/10 px-3 py-1.5 text-center text-xs font-medium text-accent-primary hover:bg-accent-primary/20 cursor-pointer"
              >
                View
              </Link>
              <Link
                to={`/project/${project._id}/admin`}
                className="flex-1 rounded-lg border border-light-border dark:border-dark-border px-3 py-1.5 text-center text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover cursor-pointer"
              >
                Admin
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary px-6 py-3">
          <p className="text-sm text-light-text-tertiary">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-light-border dark:border-dark-border text-light-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium cursor-pointer ${
                  p === page
                    ? "bg-accent-primary text-light-text-inverse"
                    : "text-light-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-light-border dark:border-dark-border text-light-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
