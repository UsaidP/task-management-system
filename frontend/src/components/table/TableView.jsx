import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import dayjs from "dayjs"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { FiArrowDown, FiArrowUp, FiGrid } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import { useFilter } from "../context/FilterContext.jsx"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

const columnHelper = createColumnHelper()

const STATUS_ORDER = { todo: 0, "in-progress": 1, "under-review": 2, completed: 3 }
const PRIORITY_ORDER = { low: 0, medium: 1, high: 2, urgent: 3 }

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  "under-review": "In Review",
  completed: "Completed",
}

const StatusBadge = ({ status }) => {
  const styles = {
    todo: "bg-task-status-todo/15 text-task-status-todo",
    "in-progress": "bg-task-status-progress/15 text-task-status-progress",
    "under-review": "bg-task-status-review/15 text-task-status-review",
    completed: "bg-task-status-done/15 text-task-status-done",
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.todo}`}>
      {statusLabels[status] || status}
    </span>
  )
}

const PriorityBadge = ({ priority }) => {
  const styles = {
    low: "text-task-priority-low",
    medium: "text-task-priority-medium",
    high: "text-task-priority-high",
    urgent: "text-task-priority-urgent",
  }
  return (
    <span
      className={`text-xs font-semibold uppercase tracking-wider ${styles[priority] || styles.medium}`}
    >
      {priority}
    </span>
  )
}

const AssigneeAvatars = ({ assignees }) => {
  if (!assignees || assignees.length === 0) {
    return <span className="text-sm text-light-text-tertiary">Unassigned</span>
  }
  return (
    <div className="flex items-center">
      {assignees.slice(0, 3).map((assignee, i) => {
        const u = typeof assignee === "object" ? assignee : null
        const fallback = `https://i.pravatar.cc/150?u=${assignee._id || assignee}`
        return (
          <img
            key={i}
            src={u?.avatar?.url || fallback}
            alt="assignee"
            className="w-6 h-6 rounded-full border-2 border-white dark:border-dark-bg-secondary -ml-1 first:ml-0"
          />
        )
      })}
      {assignees.length > 3 && (
        <span className="ml-2 text-xs text-light-text-tertiary">+{assignees.length - 3}</span>
      )}
    </div>
  )
}

const columns = [
  columnHelper.accessor("title", {
    header: "Title",
    cell: (info) => (
      <div>
        <p className="font-medium text-light-text-primary dark:text-dark-text-primary line-clamp-1">
          {info.getValue()}
        </p>
        {info.row.original.description && (
          <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary line-clamp-1 mt-0.5">
            {info.row.original.description}
          </p>
        )}
      </div>
    ),
    sortingFn: (rowA, rowB) => rowA.original.title.localeCompare(rowB.original.title),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
    sortingFn: (rowA, rowB) =>
      STATUS_ORDER[rowA.original.status] - STATUS_ORDER[rowB.original.status],
    filterFn: (row, columnId, filterValue) => row.original.status === filterValue,
  }),
  columnHelper.accessor("priority", {
    header: "Priority",
    cell: (info) => <PriorityBadge priority={info.getValue()} />,
    sortingFn: (rowA, rowB) =>
      PRIORITY_ORDER[rowA.original.priority] - PRIORITY_ORDER[rowB.original.priority],
    filterFn: (row, columnId, filterValue) => row.original.priority === filterValue,
  }),
  columnHelper.accessor((row) => row.assignedTo, {
    id: "assignee",
    header: "Assignees",
    cell: (info) => <AssigneeAvatars assignees={info.getValue()} />,
    enableSorting: false,
  }),
  columnHelper.accessor(
    (row) => (typeof row.project === "object" ? row.project?.name : "Personal"),
    {
      id: "project",
      header: "Project",
      cell: (info) => (
        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {info.getValue()}
        </span>
      ),
      sortingFn: "alphanumeric",
      filterFn: (row, columnId, filterValue) => {
        const name =
          typeof row.original.project === "object" ? row.original.project?.name : "Personal"
        return name === filterValue
      },
    }
  ),
  columnHelper.accessor((row) => row.sprint?.name || "Backlog", {
    id: "sprint",
    header: "Sprint",
    cell: (info) => (
      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
        {info.getValue()}
      </span>
    ),
    sortingFn: "alphanumeric",
    filterFn: (row, columnId, filterValue) => {
      const name = row.original.sprint?.name || "Backlog"
      return name === filterValue
    },
  }),
  columnHelper.accessor("dueDate", {
    header: "Due Date",
    cell: (info) => {
      const date = info.getValue()
      if (!date) return <span className="text-sm text-light-text-tertiary">—</span>
      const isOverdue = dayjs(date).isBefore(dayjs()) && info.row.original.status !== "completed"
      return (
        <span
          className={`text-sm ${isOverdue ? "text-accent-danger font-medium" : "text-light-text-secondary dark:text-dark-text-secondary"}`}
        >
          {dayjs(date).format("MMM DD, YYYY")}
        </span>
      )
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.dueDate
        ? new Date(rowA.original.dueDate).getTime()
        : Number.POSITIVE_INFINITY
      const b = rowB.original.dueDate
        ? new Date(rowB.original.dueDate).getTime()
        : Number.POSITIVE_INFINITY
      return a - b
    },
  }),
]

const SortIcon = ({ column }) => {
  const sorted = column.getIsSorted()
  if (!sorted) return null
  return sorted === "asc" ? (
    <FiArrowUp className="w-4 h-4 ml-1" />
  ) : (
    <FiArrowDown className="w-4 h-4 ml-1" />
  )
}

const TableView = () => {
  const { user } = useAuth()
  const { projectFilter, sprintFilter } = useFilter()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")

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

  const tableData = useMemo(() => {
    let result = tasks
    if (projectFilter) {
      result = result.filter((t) => {
        const pid = typeof t.project === "object" ? t.project?._id : t.project
        return pid === projectFilter
      })
    }
    if (sprintFilter) {
      result = result.filter((t) => t.sprint === sprintFilter)
    }
    return result
  }, [tasks, projectFilter, sprintFilter])

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const hasActiveFilters = columnFilters.length > 0 || projectFilter || sprintFilter

  const clearAllFilters = () => {
    setColumnFilters([])
    setGlobalFilter("")
  }

  const projectNames = useMemo(() => {
    const names = new Set()
    tasks.forEach((t) => {
      const name = typeof t.project === "object" ? t.project?.name : "Personal"
      if (name) names.add(name)
    })
    return Array.from(names).sort()
  }, [tasks])

  const sprintNames = useMemo(() => {
    const names = new Set()
    tasks.forEach((t) => {
      if (t.sprint?.name) names.add(t.sprint.name)
    })
    return Array.from(names).sort()
  }, [tasks])

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-secondary">
        <div>
          <h1 className="text-2xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary">
            Table
          </h1>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {table.getFilteredRowModel().rows.length} of {tableData.length} tasks
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={columnFilters.find((f) => f.id === "status")?.value || ""}
            onChange={(e) => {
              const val = e.target.value
              setColumnFilters((prev) =>
                val
                  ? [...prev.filter((f) => f.id !== "status"), { id: "status", value: val }]
                  : prev.filter((f) => f.id !== "status")
              )
            }}
            className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border text-sm text-light-text-primary dark:text-dark-text-primary"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="under-review">In Review</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={columnFilters.find((f) => f.id === "priority")?.value || ""}
            onChange={(e) => {
              const val = e.target.value
              setColumnFilters((prev) =>
                val
                  ? [...prev.filter((f) => f.id !== "priority"), { id: "priority", value: val }]
                  : prev.filter((f) => f.id !== "priority")
              )
            }}
            className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border text-sm text-light-text-primary dark:text-dark-text-primary"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={columnFilters.find((f) => f.id === "project")?.value || ""}
            onChange={(e) => {
              const val = e.target.value
              setColumnFilters((prev) =>
                val
                  ? [...prev.filter((f) => f.id !== "project"), { id: "project", value: val }]
                  : prev.filter((f) => f.id !== "project")
              )
            }}
            className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border text-sm text-light-text-primary dark:text-dark-text-primary"
          >
            <option value="">All Projects</option>
            {projectNames.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={columnFilters.find((f) => f.id === "sprint")?.value || ""}
            onChange={(e) => {
              const val = e.target.value
              setColumnFilters((prev) =>
                val
                  ? [...prev.filter((f) => f.id !== "sprint"), { id: "sprint", value: val }]
                  : prev.filter((f) => f.id !== "sprint")
              )
            }}
            className="px-3 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border text-sm text-light-text-primary dark:text-dark-text-primary"
          >
            <option value="">All Sprints</option>
            {sprintNames.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
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
          <thead className="sticky top-0 bg-light-bg-primary dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-4 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary ${
                      header.column.getCanSort() ? "cursor-pointer hover:bg-light-bg-hover" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <SortIcon column={header.column} />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border">
            {table.getRowModel().rows.map((row) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSelectedTask(row.original)}
                className="hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover cursor-pointer transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FiGrid className="w-16 h-16 text-light-text-tertiary opacity-30 mb-4" />
            <p className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
              No tasks found
            </p>
            <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              {hasActiveFilters ? "Try adjusting your filters" : "Create tasks to see them here"}
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
