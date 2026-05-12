import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "@animateicons/react/lucide"
import { motion, useReducedMotion } from "framer-motion"
import { CalendarIcon, FilterIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import apiService from "../../../service/apiService"
import Avatar from "../../components/auth/Avatar"

const statusStyles = {
  "in-progress": "bg-accent-primary/10 text-accent-primary",
  completed: "bg-accent-success/10 text-accent-success",
  done: "bg-accent-success/10 text-accent-success",
  "under-review": "bg-accent-warning/10 text-accent-warning",
  todo: "bg-light-bg-tertiary text-light-text-tertiary dark:bg-dark-bg-tertiary dark:text-dark-text-tertiary",
}

const priorityStyles = {
  urgent: "bg-accent-danger/10 text-accent-danger",
  high: "bg-accent-warning/10 text-accent-warning",
  medium: "bg-accent-info/10 text-accent-info",
  low: "bg-light-bg-tertiary text-light-text-tertiary dark:bg-dark-bg-tertiary dark:text-dark-text-tertiary",
}

const ITEMS_PER_PAGE = 15

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiService.getAdminRecentTasks(1000)
        setTasks(res.data || [])
      } catch (err) {
        console.error("Failed to fetch tasks:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    let result = [...tasks]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter)
    }

    return result
  }, [tasks, search, statusFilter, priorityFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setPage(1)
  }

  const hasActiveFilters = search || statusFilter !== "all" || priorityFilter !== "all"

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-48 h-10 rounded-xl animate-pulse bg-bg-elevated" />
        <div className="h-14 rounded-2xl animate-pulse bg-bg-elevated" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse bg-bg-elevated" />
        ))}
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
            All Tasks
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${showFilters ? "border-accent-primary/30 bg-accent-primary/10 text-accent-primary" : "border-light-border text-text-secondary hover:bg-bg-hover dark:hover:bg-dark-bg-hover"}`}
        >
          <FilterIcon size={16} />
          Filters
        </button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="p-4 border shadow-sm rounded-2xl border-border bg-bg-surface"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute text-sm -translate-y-1/2 left-3 top-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-border bg-bg-canvas py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-light-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
            />
          </div>

          {showFilters && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-xl border border-border bg-bg-canvas px-3 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="under-review">Under Review</option>
                <option value="completed">Completed</option>
                <option value="done">Done</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-xl border border-border bg-bg-canvas px-3 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-danger hover:bg-accent-danger/10 transition-colors duration-150 cursor-pointer"
            >
              <XIcon size={14} />
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Tasks Table */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden border shadow-sm rounded-2xl border-border bg-bg-surface"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-border/60 dark:border-dark-border/60 bg-light-bg-tertiary/30 dark:bg-dark-bg-tertiary/30">
                {["Task", "Project", "Assignee", "Status", "Priority", "Due Date"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border/40 dark:divide-dark-border/40">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-sm text-center text-text-muted">
                    No tasks found
                  </td>
                </tr>
              )}
              {paginated.map((task) => {
                const assignee = task.assignedTo?.[0] || task.createdBy || {}

                return (
                  <tr
                    key={task._id}
                    className="transition-colors duration-150 group hover:bg-light-bg-hover/30 dark:hover:bg-dark-bg-hover/30"
                  >
                    <td className="px-6 py-3.5">
                      <Link
                        to={`/project/${task.project?._id}`}
                        className="text-sm font-medium transition-colors duration-150 text-primary hover:text-accent-primary-dark"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-text-secondary">
                        {task.project?.name || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={assignee.avatar?.url || assignee.avatar}
                          alt={assignee.fullname || "User"}
                          size="sm"
                        />
                        <span className="text-sm text-text-secondary">
                          {assignee.fullname || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[task.status] || "bg-light-bg-tertiary text-text-muted dark:text-dark-text-tertiary"}`}
                      >
                        {task.status?.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${priorityStyles[task.priority] || "bg-light-bg-tertiary text-text-muted dark:text-dark-text-tertiary"}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <CalendarIcon size={14} />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-light-border/60 dark:border-dark-border/60">
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
          </div>
        )}
      </motion.div>
    </div>
  )
}
