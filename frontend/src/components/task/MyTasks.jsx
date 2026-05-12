import {
  ChevronDownIcon as ChevronDown,
  LayoutListIcon as List,
  SearchIcon as Search,
} from "@animateicons/react/lucide"
import { Listbox } from "@headlessui/react"
import dayjs from "dayjs"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  ArrowDownIcon as ArrowDown,
  ArrowUpIcon as ArrowUp,
  Calendar as CalendarIcon,
  Filter as FilterIcon,
  Folder as FolderIcon,
} from "lucide-react"
import { Fragment, useCallback, useEffect, useId, useMemo, useState } from "react"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../../contexts/customHook.js"
import { EmptyState } from "../ErrorStates.jsx"
import { Skeleton, SkeletonCircle, SkeletonText } from "../Skeleton.jsx"
import CreateTaskModal from "./CreateTaskModal"
import TaskDetailPanel from "./TaskDetailPanel.jsx"

const MyTasksSkeleton = () => (
  <div className="flex flex-col h-full">
    <div className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-6 bg-bg-canvas shrink-0">
      <div>
        <SkeletonText width="w-32 sm:w-40" height="h-7 sm:h-8" className="mb-1 sm:mb-2" />
        <SkeletonText width="w-48 sm:w-64" height="h-4" />
      </div>
      <Skeleton className="w-full h-10 rounded-lg sm:w-28" />
    </div>
    <div className="flex flex-col items-stretch gap-3 px-4 pt-0 sm:px-6 sm:flex-row sm:gap-5 sm:items-center">
      <Skeleton className="w-full h-10 rounded-lg sm:flex-1" />
      <Skeleton className="w-full h-10 rounded-lg sm:w-24" />
    </div>
    <div className="flex flex-col flex-1 mx-4 mb-4 overflow-hidden border shadow-sm bg-bg-surface rounded-xl border-border sm:mx-6 sm:mb-6">
      <div className="flex border-b border-border bg-light-bg-hover/50 dark:bg-dark-bg-hover/30 p-3 sm:p-4 gap-2 sm:gap-4 min-w-[640px]">
        <SkeletonText width="flex-1 min-w-[200px]" />
        <Skeleton className="h-4 rounded w-28 sm:w-32" />
        <Skeleton className="w-24 h-4 rounded sm:w-32" />
        <Skeleton className="hidden h-4 rounded w-36 sm:w-48 md:block" />
        <Skeleton className="w-24 h-4 rounded sm:w-32" />
      </div>
      <div className="p-3 space-y-3 sm:p-4 sm:space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 min-w-[640px]">
            <SkeletonCircle size="w-4 h-4" className="!rounded-full shrink-0" />
            <SkeletonText width={`w-${32 + (i % 4) * 16}`} className="flex-1 min-w-[200px]" />
            <Skeleton className="w-20 h-6 rounded-full shrink-0" />
            <Skeleton className="w-16 h-4 rounded shrink-0" />
            <Skeleton className="hidden h-4 rounded w-28 md:block shrink-0" />
            <Skeleton className="w-20 h-4 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Mock Sprint data for filtering
const SPRINTS = [
  { id: "none", name: "Backlog (No Sprint)" },
  { id: "sprint-4", name: "Sprint 4 (Active)" },
]

const SortIcon = ({ field, activeField, direction }) => {
  if (activeField !== field) return <div className="w-4 h-4" />
  return direction === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
}

export const MyTasks = () => {
  const { user } = useAuth()
  const filterPanelId = useId()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [_error, setError] = useState(null)
  const reduceMotion = useReducedMotion()

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [sprintFilter, setSprintFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Sorting
  const [sortField, setSortField] = useState("dueDate")
  const [sortDirection, setSortDirection] = useState("asc") // asc or desc
  const [selectedTask, setSelectedTask] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        apiService.getAllTaskOfUser(),
        apiService.getAllProjects(),
      ])

      if (tasksRes.success) {
        setTasks(tasksRes.data?.tasks || (Array.isArray(tasksRes.data) ? tasksRes.data : []))
      }
      if (projectsRes.success) {
        setProjects(projectsRes.data.projects)
      }
    } catch (err) {
      console.error("Failed to load My Tasks data:", err)
      setError("Failed to load tasks. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchData])

  // Apply filtering and sorting
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]

    // Search
    if (search) {
      const query = search.toLowerCase()
      result = result.filter(
        (t) => t.title.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query)
      )
    }

    // Filters
    if (statusFilter !== "all") result = result.filter((t) => t.status === statusFilter)
    if (priorityFilter !== "all") result = result.filter((t) => t.priority === priorityFilter)
    if (projectFilter !== "all") result = result.filter((t) => t.project?._id === projectFilter)
    // Note: real sprint filtering not yet backend supported

    // Sorting
    result.sort((a, b) => {
      let valA
      let valB

      if (sortField === "dueDate") {
        valA = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999 // Put no due date at the end
        valB = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999
      } else if (sortField === "priority") {
        const pMap = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 }
        valA = pMap[a.priority] || 0
        valB = pMap[b.priority] || 0
      } else if (sortField === "createdAt") {
        valA = new Date(a.createdAt).getTime()
        valB = new Date(b.createdAt).getTime()
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1
      if (valA > valB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return result
  }, [tasks, search, statusFilter, priorityFilter, projectFilter, sortField, sortDirection])

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "urgent":
        return "badge-priority-urgent"
      case "high":
        return "badge-priority-high"
      case "medium":
        return "badge-priority-medium"
      case "low":
        return "badge-priority-low"
      default:
        return "bg-light-bg-hover dark:bg-dark-bg-hover text-light-text-tertiary dark:text-dark-text-tertiary px-3 py-1 rounded-full text-xs font-medium"
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "badge-status-done"
      case "in-progress":
        return "badge-status-progress"
      case "under-review":
        return "badge-status-review"
      case "todo":
        return "badge-status-todo"
      default:
        return "bg-light-bg-hover dark:bg-dark-bg-hover text-light-text-tertiary dark:text-dark-text-tertiary px-3 py-1 rounded-full text-xs font-medium"
    }
  }

  if (loading) {
    return <MyTasksSkeleton />
  }

  return (
    <div className="flex flex-col h-full shadow-sm">
      {/* Compact Header Bar */}
      <div className="flex items-center gap-3 px-4 py-4 border-b shadow-sm sm:px-6 border-border bg-bg-surface shrink-0">
        {/* Left: Title + count */}
        <div className="flex items-center gap-2.5 min-w-0 mr-auto">
          <h1 className="font-serif text-xl font-bold text-text-primary whitespace-nowrap">
            My Tasks
          </h1>
          {filteredAndSortedTasks.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-primary/10 text-primary dark:bg-accent-primary/20 tabular-nums">
              {filteredAndSortedTasks.length}
            </span>
          )}
        </div>

        {/* Right: Search + Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 transition-colors text-text-muted group-focus-within:text-accent-primary" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              aria-label="Search tasks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 py-2 pr-3 text-sm transition-all duration-200 border rounded-lg sm:w-64 bg-bg-canvas border-border pl-9 focus:outline-none focus:border-accent-primary focus:w-72 text-text-primary placeholder:text-light-text-tertiary"
            />
          </div>
          <button
            type="button"
            aria-expanded={showFilters}
            aria-controls={filterPanelId}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? "bg-accent-primary/10 border-accent-primary/30 text-primary dark:bg-accent-primary/15" : "border-light-border text-text-secondary hover:bg-bg-hover dark:hover:bg-dark-bg-hover"}`}
          >
            <FilterIcon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            id={filterPanelId}
            initial={reduceMotion ? {} : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? {} : { height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-light-bg-secondary/60 dark:bg-dark-bg-tertiary/40"
          >
            <div className="px-4 sm:px-6 py-3 flex flex-wrap gap-2 sm:gap-2.5">
              <Listbox value={statusFilter} onChange={setStatusFilter}>
                <div className="relative">
                  <Listbox.Button
                    aria-label="Filter by status"
                    className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-left min-w-[120px] cursor-pointer hover:bg-bg-hover transition-colors min-h-[44px]"
                  >
                    <span className="text-text-primary">
                      {statusFilter === "all" ? "All Status" : statusFilter.replace("-", " ")}
                    </span>
                    <ChevronDown className="absolute w-4 h-4 -translate-y-1/2 right-2 top-1/2 text-text-muted" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-50 w-full mt-1 overflow-hidden border rounded-lg shadow-lg bg-bg-surface border-border">
                    {["all", "todo", "in-progress", "under-review", "completed"].map((status) => (
                      <Listbox.Option key={status} value={status} as={Fragment}>
                        {({ active }) => (
                          <li
                            className={`px-3 py-2 cursor-pointer text-sm ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                          >
                            {status === "all" ? "All Status" : status.replace("-", " ")}
                          </li>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>

              <Listbox value={priorityFilter} onChange={setPriorityFilter}>
                <div className="relative">
                  <Listbox.Button
                    aria-label="Filter by priority"
                    className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-left min-w-[120px] cursor-pointer hover:bg-bg-hover transition-colors min-h-[44px]"
                  >
                    <span className="text-text-primary">
                      {priorityFilter === "all" ? "All Priority" : priorityFilter}
                    </span>
                    <ChevronDown className="absolute w-4 h-4 -translate-y-1/2 right-2 top-1/2 text-text-muted" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-50 w-full mt-1 overflow-hidden border rounded-lg shadow-lg bg-bg-surface border-border">
                    {["all", "urgent", "high", "medium", "low", "none"].map((priority) => (
                      <Listbox.Option key={priority} value={priority} as={Fragment}>
                        {({ active }) => (
                          <li
                            className={`px-3 py-2 cursor-pointer text-sm ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                          >
                            {priority === "all" ? "All Priority" : priority}
                          </li>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>

              <Listbox value={projectFilter} onChange={setProjectFilter}>
                <div className="relative">
                  <Listbox.Button
                    aria-label="Filter by project"
                    className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-left min-w-[150px] max-w-[180px] cursor-pointer hover:bg-bg-hover transition-colors min-h-[44px]"
                  >
                    <span className="block truncate text-text-primary">
                      {projectFilter === "all"
                        ? "All Projects"
                        : projects.find((p) => p._id === projectFilter)?.name || "All Projects"}
                    </span>
                    <ChevronDown className="absolute w-4 h-4 -translate-y-1/2 right-2 top-1/2 text-text-muted" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-50 w-full mt-1 overflow-auto overflow-hidden border rounded-lg shadow-lg bg-bg-surface border-border max-h-60">
                    <Listbox.Option value="all" as={Fragment}>
                      {({ active }) => (
                        <li
                          className={`px-3 py-2 cursor-pointer text-sm ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                        >
                          All Projects
                        </li>
                      )}
                    </Listbox.Option>
                    {projects.map((p) => (
                      <Listbox.Option key={p._id} value={p._id} as={Fragment}>
                        {({ active }) => (
                          <li
                            className={`px-3 py-2 cursor-pointer text-sm truncate ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                          >
                            {p.name}
                          </li>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>

              <Listbox value={sprintFilter} onChange={setSprintFilter}>
                <div className="relative">
                  <Listbox.Button
                    aria-label="Filter by sprint"
                    className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-left min-w-[120px] cursor-pointer hover:bg-bg-hover transition-colors min-h-[44px]"
                  >
                    <span className="text-text-primary">
                      {sprintFilter === "all"
                        ? "All Sprints"
                        : SPRINTS.find((s) => s.id === sprintFilter)?.name || "All Sprints"}
                    </span>
                    <ChevronDown className="absolute w-4 h-4 -translate-y-1/2 right-2 top-1/2 text-text-muted" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-50 w-full mt-1 overflow-hidden border rounded-lg shadow-lg bg-bg-surface border-border">
                    <Listbox.Option value="all" as={Fragment}>
                      {({ active }) => (
                        <li
                          className={`px-3 py-2 cursor-pointer text-sm ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                        >
                          All Sprints
                        </li>
                      )}
                    </Listbox.Option>
                    {SPRINTS.map((s) => (
                      <Listbox.Option key={s.id} value={s.id} as={Fragment}>
                        {({ active }) => (
                          <li
                            className={`px-3 py-2 cursor-pointer text-sm ${active ? "bg-accent-primary text-white" : "text-light-text-primary dark:text-dark-text-primary"}`}
                          >
                            {s.name}
                          </li>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Task List Table */}
      <div className="flex flex-col flex-1 overflow-hidden border-t bg-bg-surface border-border">
        {/* Table Header */}
        <div className="overflow-x-auto">
          <div className="flex border-b border-border bg-light-bg-hover/50 dark:bg-dark-bg-hover/30 p-3 sm:p-4 font-semibold text-xs sm:text-sm text-text-muted min-w-[640px]">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">
              Title
            </div>
            <div className="flex items-center justify-start gap-1 transition-colors cursor-pointer w-28 sm:w-32 hover:text-light-text-primary dark:hover:text-dark-text-primary">
              Status
            </div>
            <button
              type="button"
              aria-label="Sort by priority"
              onClick={() => toggleSort("priority")}
              className="flex items-center justify-start w-24 gap-1 p-0 transition-colors bg-transparent border-none cursor-pointer select-none sm:w-32 hover:text-light-text-primary dark:hover:text-dark-text-primary font-inherit text-inherit"
            >
              Priority{" "}
              <SortIcon field="priority" activeField={sortField} direction={sortDirection} />
            </button>
            <div className="items-center justify-start hidden gap-1 transition-colors cursor-pointer select-none w-36 sm:w-48 md:flex hover:text-light-text-primary dark:hover:text-dark-text-primary">
              Project
            </div>
            <button
              type="button"
              aria-label="Sort by due date"
              onClick={() => toggleSort("dueDate")}
              className="flex items-center justify-start w-24 gap-1 p-0 transition-colors bg-transparent border-none cursor-pointer select-none sm:w-32 hover:text-light-text-primary dark:hover:text-dark-text-primary font-inherit text-inherit"
            >
              Due Date{" "}
              <SortIcon field="dueDate" activeField={sortField} direction={sortDirection} />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-3 sm:p-4 sm:space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-bg-hover animate-pulse" />
              ))}
            </div>
          ) : filteredAndSortedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 sm:p-12">
              <EmptyState message="No tasks match your current filters." />
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setStatusFilter("all")
                  setPriorityFilter("all")
                  setProjectFilter("all")
                  setSprintFilter("all")
                }}
                className="px-4 py-2 mt-4 text-sm font-medium transition-colors border rounded-lg text-primary hover:text-accent-primary-dark border-primary hover:bg-accent-primary/5"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {filteredAndSortedTasks.map((task) => (
                <motion.button
                  key={task._id}
                  initial={reduceMotion ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? {} : { opacity: 0 }}
                  type="button"
                  aria-label={`View task: ${task.title}`}
                  className="flex w-full border-b border-border last:border-0 p-3 sm:p-4 hover:bg-light-bg-hover/50 active:bg-light-bg-hover/50 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-inset transition-colors items-center cursor-pointer group text-left min-w-[640px]"
                  onClick={() => setSelectedTask(task)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedTask(task)
                    }
                  }}
                >
                  <div className="flex-1 min-w-[200px] flex items-center gap-2 sm:gap-3">
                    <List className="transition-colors text-text-muted group-hover:text-accent-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-text-primary line-clamp-1">
                        {task.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center w-28 sm:w-32 shrink-0">
                    <span className={getStatusBadgeClass(task.status)}>
                      {task.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex items-center w-24 sm:w-32 shrink-0">
                    <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
                  </div>
                  <div className="items-center hidden gap-2 w-36 sm:w-48 md:flex shrink-0">
                    <span className="max-w-full truncate tag tag-project">
                      <FolderIcon className="inline mr-1 shrink-0" />
                      {task.project?.name || "Personal"}
                    </span>
                  </div>
                  <div className="flex items-center w-24 text-sm font-medium sm:w-32 text-text-secondary shrink-0">
                    {task.dueDate ? (
                      <span
                        className={`flex items-center gap-1.5 ${dayjs(task.dueDate).isBefore(dayjs(), "day") && task.status !== "completed" ? "text-accent-danger" : ""}`}
                      >
                        <CalendarIcon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{dayjs(task.dueDate).format("MMM D")}</span>
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      {/* Side Panel for Task Details */}
      {selectedTask && (
        <TaskDetailPanel
          isOpen={!!selectedTask}
          onClose={() => {
            setSelectedTask(null)
            fetchData()
          }}
          task={selectedTask}
          members={[{ user: user }]}
          onTaskUpdated={(_updatedTask) => {
            fetchData()
          }}
        />
      )}

      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTaskCreated={(_newTask) => {
          setCreateModalOpen(false)
          fetchData()
        }}
        projectId={null}
        members={[]}
      />
    </div>
  )
}

export default MyTasks
