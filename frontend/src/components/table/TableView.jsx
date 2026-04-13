import { Listbox } from "@headlessui/react"
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
import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { FiArrowDown, FiArrowUp, FiChevronDown, FiGrid } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { useFilter } from "../../contexts/FilterContext.jsx"
import { getOptimizedAvatarUrl } from "../../utils/imageHelpers.js"
import { Skeleton, SkeletonCircle, SkeletonText } from "../Skeleton.jsx"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

const columnHelper = createColumnHelper()

const TableSkeleton = () => (
  <div className="h-full flex flex-col">
    <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-secondary">
      <div>
        <SkeletonText width="w-32" height="h-8" className="mb-2" />
        <SkeletonText width="w-48" height="h-4" />
      </div>
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="w-32 h-10 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="flex-1 overflow-auto">
      <div className="w-full">
        <div className="flex border-b border-light-border dark:border-dark-border bg-light-bg-hover/50 dark:bg-dark-bg-hover/30">
          {["Title", "Status", "Priority", "Assignees", "Project", "Sprint", "Due Date"].map(
            (h, i) => (
              <div
                key={h}
                className={`px-4 py-3 ${i === 0 ? "flex-1" : "w-32"} ${i === 3 ? "w-24" : ""} ${i === 4 ? "w-36" : ""}`}
              >
                <SkeletonText width={i === 0 ? "w-20" : "w-16"} height="h-4" />
              </div>
            )
          )}
        </div>
        {Array.from({ length: 10 }).map((_, row) => (
          <div
            key={row}
            className="flex items-center gap-4 px-4 py-3 border-b border-light-border dark:border-dark-border"
          >
            <SkeletonText width="w-48" height="h-4" className="flex-1" />
            <Skeleton className="w-16 h-6 rounded-full" />
            <SkeletonText width="w-12" height="h-4" />
            <SkeletonCircle size="w-6 h-6" />
            <SkeletonText width="w-24" height="h-4" />
            <SkeletonText width="w-16" height="h-4" />
            <SkeletonText width="w-20" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

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

const AssigneeAvatar = ({ assignee }) => {
  const [hasError, setHasError] = useState(false)
  const u = typeof assignee === "object" ? assignee : null
  const avatarUrl = getOptimizedAvatarUrl(u?.avatar?.url, 50)
  const fallback = `https://i.pravatar.cc/150?u=${u?._id || assignee}`
  const name = u?.fullname || u?.username || "assignee"
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  if (!avatarUrl || hasError) {
    return (
      <div
        className="w-6 h-6 rounded-full border-2 border-white dark:border-dark-bg-secondary bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-[8px] font-bold text-white -ml-1 first:ml-0"
        title={name}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      key={u?._id || assignee}
      src={avatarUrl || fallback}
      alt={name}
      className="w-6 h-6 rounded-full border-2 border-white dark:border-dark-bg-secondary object-cover -ml-1 first:ml-0"
      title={name}
      loading="lazy"
      decoding="async"
      width="24"
      height="24"
      onError={() => setHasError(true)}
    />
  )
}

const AssigneeAvatars = ({ assignees }) => {
  if (!assignees || assignees.length === 0) {
    return <span className="text-sm text-light-text-tertiary">Unassigned</span>
  }
  return (
    <div className="flex items-center">
      {assignees.slice(0, 3).map((assignee) => (
        <AssigneeAvatar
          key={typeof assignee === "object" ? assignee._id : assignee}
          assignee={assignee}
        />
      ))}
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
    filterFn: (row, _columnId, filterValue) => row.original.status === filterValue,
  }),
  columnHelper.accessor("priority", {
    header: "Priority",
    cell: (info) => <PriorityBadge priority={info.getValue()} />,
    sortingFn: (rowA, rowB) =>
      PRIORITY_ORDER[rowA.original.priority] - PRIORITY_ORDER[rowB.original.priority],
    filterFn: (row, _columnId, filterValue) => row.original.priority === filterValue,
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
      filterFn: (row, _columnId, filterValue) => {
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
    filterFn: (row, _columnId, filterValue) => {
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
  const { projectFilter, sprintFilter } = useFilter()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiService.getAllTaskOfUser()
      if (response.success) {
        setTasks(response.data?.tasks || [])
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    return <TableSkeleton />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 sm:px-6 py-4 border-b border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary gap-3 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary">
            Table
          </h1>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {table.getFilteredRowModel().rows.length} of {tableData.length} tasks
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <Listbox
            value={columnFilters.find((f) => f.id === "status")?.value || ""}
            onChange={(val) => {
              setColumnFilters((prev) =>
                val
                  ? [...prev.filter((f) => f.id !== "status"), { id: "status", value: val }]
                  : prev.filter((f) => f.id !== "status")
              )
            }}
          >
            <div className="relative">
              <Listbox.Button
                aria-label="Filter by status"
                className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[44px] flex items-center gap-2 pr-8"
              >
                <span className="text-light-text-primary dark:text-dark-text-primary truncate">
                  {columnFilters.find((f) => f.id === "status")?.value
                    ? statusLabels[columnFilters.find((f) => f.id === "status")?.value] ||
                      columnFilters.find((f) => f.id === "status")?.value
                    : "All Status"}
                </span>
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary" />
              </Listbox.Button>
              <Listbox.Options className="absolute z-50 mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <Listbox.Option key={key} value={key} as={Fragment}>
                    {({ active }) => (
                      <li
                        className={`px-3 py-2 cursor-pointer text-sm ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                      >
                        {label}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>

          <Listbox
            value={columnFilters.find((f) => f.id === "priority")?.value || ""}
            onChange={(val) => {
              setColumnFilters((prev) =>
                val
                  ? [...prev.filter((f) => f.id !== "priority"), { id: "priority", value: val }]
                  : prev.filter((f) => f.id !== "priority")
              )
            }}
          >
            <div className="relative">
              <Listbox.Button
                aria-label="Filter by priority"
                className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[44px] flex items-center gap-2 pr-8"
              >
                <span className="text-light-text-primary dark:text-dark-text-primary truncate">
                  {columnFilters.find((f) => f.id === "priority")?.value || "All Priority"}
                </span>
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary" />
              </Listbox.Button>
              <Listbox.Options className="absolute z-50 mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden">
                {["", "low", "medium", "high", "urgent"].map((priority) => (
                  <Listbox.Option key={priority} value={priority} as={Fragment}>
                    {({ active }) => (
                      <li
                        className={`px-3 py-2 cursor-pointer text-sm ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                      >
                        {priority === "" ? "All Priority" : priority}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>

          <Listbox
            value={columnFilters.find((f) => f.id === "project")?.value || ""}
            onChange={(val) => {
              setColumnFilters((prev) =>
                val
                  ? [...prev.filter((f) => f.id !== "project"), { id: "project", value: val }]
                  : prev.filter((f) => f.id !== "project")
              )
            }}
          >
            <div className="relative">
              <Listbox.Button
                aria-label="Filter by project"
                className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[44px] flex items-center gap-2 pr-8 max-w-[180px]"
              >
                <span className="text-light-text-primary dark:text-dark-text-primary truncate block">
                  {columnFilters.find((f) => f.id === "project")?.value || "All Projects"}
                </span>
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary" />
              </Listbox.Button>
              <Listbox.Options className="absolute z-50 mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-auto">
                <Listbox.Option value="" as={Fragment}>
                  {({ active }) => (
                    <li
                      className={`px-3 py-2 cursor-pointer text-sm ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                    >
                      All Projects
                    </li>
                  )}
                </Listbox.Option>
                {projectNames.map((p) => (
                  <Listbox.Option key={p} value={p} as={Fragment}>
                    {({ active }) => (
                      <li
                        className={`px-3 py-2 cursor-pointer text-sm truncate ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                      >
                        {p}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>

          <Listbox
            value={columnFilters.find((f) => f.id === "sprint")?.value || ""}
            onChange={(val) => {
              setColumnFilters((prev) =>
                val
                  ? [...prev.filter((f) => f.id !== "sprint"), { id: "sprint", value: val }]
                  : prev.filter((f) => f.id !== "sprint")
              )
            }}
          >
            <div className="relative">
              <Listbox.Button
                aria-label="Filter by sprint"
                className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[44px] flex items-center gap-2 pr-8"
              >
                <span className="text-light-text-primary dark:text-dark-text-primary truncate">
                  {columnFilters.find((f) => f.id === "sprint")?.value || "All Sprints"}
                </span>
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary" />
              </Listbox.Button>
              <Listbox.Options className="absolute z-50 mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden">
                <Listbox.Option value="" as={Fragment}>
                  {({ active }) => (
                    <li
                      className={`px-3 py-2 cursor-pointer text-sm ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                    >
                      All Sprints
                    </li>
                  )}
                </Listbox.Option>
                {sprintNames.map((s) => (
                  <Listbox.Option key={s} value={s} as={Fragment}>
                    {({ active }) => (
                      <li
                        className={`px-3 py-2 cursor-pointer text-sm ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                      >
                        {s}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-accent-primary hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/30 rounded min-h-[44px] px-3"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="min-w-full inline-block">
          <table className="w-full">
            <thead className="sticky top-0 bg-light-bg-primary dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          header.column.getToggleSortingHandler()?.(e)
                        }
                      }}
                      tabIndex={header.column.getCanSort() ? 0 : undefined}
                      role={header.column.getCanSort() ? "button" : undefined}
                      aria-sort={
                        header.column.getIsSorted()
                          ? header.column.getIsSorted() === "asc"
                            ? "ascending"
                            : "descending"
                          : undefined
                      }
                      className={`px-4 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap ${
                        header.column.getCanSort()
                          ? "cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/30 rounded"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-1">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedTask(row.original)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View task: ${row.original.title}`}
                  className="hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:ring-inset"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-light-bg-hover dark:bg-dark-bg-hover flex items-center justify-center mb-4">
              <FiGrid className="w-8 h-8 text-light-text-tertiary opacity-40" aria-hidden="true" />
            </div>
            <p className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
              No tasks found
            </p>
            <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              {hasActiveFilters ? "Try adjusting your filters" : "Create tasks to see them here"}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 text-sm font-medium text-accent-primary hover:text-accent-primary-dark border border-accent-primary rounded-lg hover:bg-accent-primary/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/30 min-h-[44px]"
              >
                Clear all filters
              </button>
            )}
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
