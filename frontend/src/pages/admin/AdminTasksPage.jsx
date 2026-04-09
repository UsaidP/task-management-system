import { Calendar, ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import apiService from "../../../service/apiService"

const statusColors = {
  "in-progress": "status-in-progress",
  completed: "status-completed",
  done: "status-completed",
  "under-review": "status-under-review",
  todo: "status-todo",
}

const priorityColors = {
  urgent: "priority-urgent",
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
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
        <div className="animate-pulse h-10 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg w-48" />
        <div className="animate-pulse h-14 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="animate-pulse h-16 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
            All Tasks
          </h1>
          <p className="text-sm text-light-text-tertiary mt-1">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border border-light-border dark:border-dark-border px-4 py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover cursor-pointer"
        >
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-tertiary"
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary py-2 pl-10 pr-4 text-sm text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/20"
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
                className="rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/20"
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
                className="rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/20"
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
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-accent-danger hover:bg-accent-danger/10 cursor-pointer"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-border dark:border-dark-border bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-light-text-tertiary"
                  >
                    No tasks found
                  </td>
                </tr>
              )}
              {paginated.map((task) => {
                const assignee = task.assignedTo?.[0] || task.createdBy || {}
                const initials = (assignee.fullname || "A")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <tr
                    key={task._id}
                    className="group hover:bg-light-bg-hover/50 dark:hover:bg-dark-bg-hover/50"
                  >
                    <td className="px-6 py-3.5">
                      <Link
                        to={`/project/${task.project?._id}`}
                        className="text-sm font-medium text-accent-primary hover:underline"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {task.project?.name || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent-primary text-[10px] font-bold text-light-text-inverse">
                          {initials}
                        </div>
                        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {assignee.fullname || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status] || "bg-light-bg-tertiary text-light-text-tertiary"}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[task.priority] || "bg-light-bg-tertiary text-light-text-tertiary"}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-light-text-tertiary">
                        <Calendar size={14} />
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
          <div className="flex items-center justify-between border-t border-light-border dark:border-dark-border px-6 py-3">
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
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                  return (
                    <span key={p} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-light-text-tertiary">…</span>}
                      <button
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
                    </span>
                  )
                })}
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
    </div>
  )
}
