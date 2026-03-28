import dayjs from "dayjs"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { FiArrowDown, FiArrowUp, FiUser } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

const TableView = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [sortField, setSortField] = useState("dueDate")
  const [sortDirection, setSortDirection] = useState("asc")
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    project: "",
  })

  useEffect(() => {
    fetchTasks()
  }, [user])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await apiService.getAllTaskOfUser()
      if (response.success) {
        setTasks(response.data || [])
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    if (filters.status) {
      result = result.filter((t) => t.status === filters.status)
    }
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority)
    }
    if (filters.project) {
      result = result.filter((t) => {
        const projectName = typeof t.project === "object" ? t.project?.name : ""
        return projectName === filters.project
      })
    }

    result.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (sortField === "dueDate") {
        aVal = aVal ? new Date(aVal).getTime() : Number.POSITIVE_INFINITY
        bVal = bVal ? new Date(bVal).getTime() : Number.POSITIVE_INFINITY
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return result
  }, [tasks, sortField, sortDirection, filters])

  const projects = useMemo(() => {
    const projectSet = new Set()
    tasks.forEach((task) => {
      const projectName = typeof task.project === "object" ? task.project?.name : "Personal"
      if (projectName) projectSet.add(projectName)
    })
    return Array.from(projectSet)
  }, [tasks])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? (
      <FiArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <FiArrowDown className="w-4 h-4 ml-1" />
    )
  }

  const getStatusBadge = (status) => {
    const badges = {
      todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      "under-review": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    }
    const label = status?.replace("-", " ") || "Unknown"
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.todo}`}
      >
        {label}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      low: "text-blue-500",
      medium: "text-amber-500",
      high: "text-orange-500",
      urgent: "text-red-500",
    }
    return (
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${badges[priority] || badges.medium}`}
      >
        {priority}
      </span>
    )
  }

  const getAssigneeAvatar = (assignees) => {
    if (!assignees || assignees.length === 0) return null
    return assignees.slice(0, 3).map((assignee, i) => {
      const user = typeof assignee === "object" ? assignee : null
      const fallback = `https://i.pravatar.cc/150?u=${assignee._id || assignee}`
      return (
        <img
          key={i}
          src={user?.avatar?.url || fallback}
          alt="assignee"
          className="w-6 h-6 rounded-full border-2 border-white dark:border-dark-bg-secondary -ml-1 first:ml-0"
        />
      )
    })
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Loading table...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ boxShadow: "0px 0px 1px 0.1px #000000" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-tertiary">
        <div>
          <h1 className="text-2xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary">
            List View
          </h1>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border text-sm text-light-text-primary dark:text-dark-text-primary"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="under-review">In Review</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border text-sm text-light-text-primary dark:text-dark-text-primary"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={filters.project}
            onChange={(e) => setFilters((f) => ({ ...f, project: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border text-sm text-light-text-primary dark:text-dark-text-primary"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {(filters.status || filters.priority || filters.project) && (
            <button
              onClick={() => setFilters({ status: "", priority: "", project: "" })}
              className="text-sm text-accent-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full">
          <thead className="sticky top-0 bg-light-bg-primary dark:bg-dark-bg-tertiary border-b border-light-border dark:border-dark-border z-10">
            <tr>
              <th
                onClick={() => handleSort("title")}
                className="px-4 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:bg-light-bg-hover"
              >
                <div className="flex items-center">
                  Title
                  <SortIcon field="title" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                <div className="flex items-center">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                <div className="flex items-center">
                  Priority
                  <SortIcon field="priority" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                Project
              </th>
              <th
                onClick={() => handleSort("dueDate")}
                className="px-4 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:bg-light-bg-hover"
              >
                <div className="flex items-center">
                  Due Date
                  <SortIcon field="dueDate" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                Assignees
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border">
            <AnimatePresence>
              {filteredTasks.map((task, idx) => (
                <motion.tr
                  key={task._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => setSelectedTask(task)}
                  className="hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-light-text-primary dark:text-dark-text-primary line-clamp-1">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(task.status)}</td>
                  <td className="px-4 py-3">{getPriorityBadge(task.priority)}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {typeof task.project === "object" ? task.project?.name : "Personal"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {task.dueDate ? (
                      <span
                        className={`text-sm ${
                          dayjs(task.dueDate).isBefore(dayjs()) && task.status !== "completed"
                            ? "text-error font-medium"
                            : "text-light-text-secondary dark:text-dark-text-secondary"
                        }`}
                      >
                        {dayjs(task.dueDate).format("MMM DD, YYYY")}
                      </span>
                    ) : (
                      <span className="text-sm text-light-text-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {task.assignedTo && task.assignedTo.length > 0 ? (
                      <div className="flex items-center">
                        {getAssigneeAvatar(task.assignedTo)}
                        {task.assignedTo.length > 3 && (
                          <span className="ml-2 text-xs text-light-text-tertiary">
                            +{task.assignedTo.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-light-text-tertiary">Unassigned</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FiUser className="w-16 h-16 text-light-text-tertiary opacity-30 mb-4" />
            <p className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
              No tasks found
            </p>
            <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              {filters.status || filters.priority || filters.project
                ? "Try adjusting your filters"
                : "Create tasks to see them here"}
            </p>
          </div>
        )}
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          members={selectedTask.assignedTo?.map((u) => ({ user: u })) || []}
          onTaskUpdated={(updated) => {
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
            setSelectedTask(updated)
          }}
        />
      )}
    </div>
  )
}

export default TableView
