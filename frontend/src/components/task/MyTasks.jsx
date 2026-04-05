import { Listbox } from "@headlessui/react"
import dayjs from "dayjs"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Fragment, useCallback, useEffect, useId, useMemo, useState } from "react"
import {
  FiArrowDown,
  FiArrowUp,
  FiCalendar,
  FiChevronDown,
  FiFilter,
  FiFolder,
  FiList,
  FiSearch,
} from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../../contexts/customHook.js"
import { EmptyState } from "../ErrorStates.jsx"
import { Skeleton, SkeletonCircle, SkeletonText } from "../Skeleton.jsx"
import CreateTaskModal from "./CreateTaskModal"
import TaskDetailPanel from "./TaskDetailPanel.jsx"

const MyTasksSkeleton = () => (
  <div className="h-full flex flex-col">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-light-bg-primary dark:bg-dark-bg-primary shrink-0">
      <div>
        <SkeletonText width="w-32 sm:w-40" height="h-7 sm:h-8" className="mb-1 sm:mb-2" />
        <SkeletonText width="w-48 sm:w-64" height="h-4" />
      </div>
      <Skeleton className="w-full sm:w-28 h-10 rounded-lg" />
    </div>
    <div className="px-4 sm:px-6 pt-0 flex flex-col sm:flex-row gap-3 sm:gap-5 items-stretch sm:items-center">
      <Skeleton className="w-full sm:flex-1 h-10 rounded-lg" />
      <Skeleton className="w-full sm:w-24 h-10 rounded-lg" />
    </div>
    <div className="flex-1 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden flex flex-col mx-4 sm:mx-6 mb-4 sm:mb-6">
      <div className="flex border-b border-light-border dark:border-dark-border bg-light-bg-hover/50 dark:bg-dark-bg-hover/30 p-3 sm:p-4 gap-2 sm:gap-4 min-w-[640px]">
        <SkeletonText width="flex-1 min-w-[200px]" />
        <Skeleton className="w-28 sm:w-32 h-4 rounded" />
        <Skeleton className="w-24 sm:w-32 h-4 rounded" />
        <Skeleton className="w-36 sm:w-48 h-4 rounded hidden md:block" />
        <Skeleton className="w-24 sm:w-32 h-4 rounded" />
      </div>
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 min-w-[640px]">
            <SkeletonCircle size="w-4 h-4" className="!rounded-full shrink-0" />
            <SkeletonText width={`w-${32 + (i % 4) * 16}`} className="flex-1 min-w-[200px]" />
            <Skeleton className="w-20 h-6 rounded-full shrink-0" />
            <Skeleton className="w-16 h-4 rounded shrink-0" />
            <Skeleton className="w-28 h-4 rounded hidden md:block shrink-0" />
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
  return direction === "asc" ? (
    <FiArrowUp className="w-4 h-4" />
  ) : (
    <FiArrowDown className="w-4 h-4" />
  )
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
        setTasks(tasksRes.data)
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
  }, [user])

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
    <div className="h-full flex flex-col shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-light-bg-primary dark:bg-dark-bg-primary shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-1 sm:mb-2">
            My Tasks
          </h1>
          <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
            Track and manage all your assigned work across projects.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary whitespace-nowrap flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => setCreateModalOpen(true)}
        >
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>{" "}
          <span>Add Task</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-4 sm:px-6 pt-0 flex flex-col sm:flex-row gap-3 sm:gap-5 items-stretch sm:items-center">
        <div className="w-full sm:flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            aria-label="Search tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:border-accent-primary text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary min-h-[44px]"
          />
        </div>

        <div className="w-full sm:w-auto flex gap-3">
          <button
            type="button"
            aria-expanded={showFilters}
            aria-controls={filterPanelId}
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg flex items-center justify-center gap-2 border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[44px]"
          >
            <FiFilter className="w-4 h-4 shrink-0" />
            <span>Filters</span>
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
            className="px-4 sm:px-6 flex flex-wrap gap-2 sm:gap-3 pb-3"
          >
            <Listbox value={statusFilter} onChange={setStatusFilter}>
              <div className="relative">
                <Listbox.Button
                  aria-label="Filter by status"
                  className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left min-w-[120px] cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[44px]"
                >
                  <span className="text-light-text-primary dark:text-dark-text-primary">
                    {statusFilter === "all" ? "All Status" : statusFilter.replace("-", " ")}
                  </span>
                  <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden">
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
                  className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left min-w-[120px] cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[44px]"
                >
                  <span className="text-light-text-primary dark:text-dark-text-primary">
                    {priorityFilter === "all" ? "All Priority" : priorityFilter}
                  </span>
                  <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden">
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
                  className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left min-w-[150px] max-w-[180px] cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[44px]"
                >
                  <span className="text-light-text-primary dark:text-dark-text-primary truncate block">
                    {projectFilter === "all"
                      ? "All Projects"
                      : projects.find((p) => p._id === projectFilter)?.name || "All Projects"}
                  </span>
                  <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-auto">
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
                  className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left min-w-[120px] cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[44px]"
                >
                  <span className="text-light-text-primary dark:text-dark-text-primary">
                    {sprintFilter === "all"
                      ? "All Sprints"
                      : SPRINTS.find((s) => s.id === sprintFilter)?.name || "All Sprints"}
                  </span>
                  <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary" />
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Task List Table */}
      <div className="flex-1 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden flex flex-col mx-4 sm:mx-6 mb-4 sm:mb-6">
        {/* Table Header */}
        <div className="overflow-x-auto">
          <div className="flex border-b border-light-border dark:border-dark-border bg-light-bg-hover/50 dark:bg-dark-bg-hover/30 p-3 sm:p-4 font-semibold text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary min-w-[640px]">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">
              Title
            </div>
            <div className="w-28 sm:w-32 flex items-center justify-start gap-1 cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">
              Status
            </div>
            <button
              type="button"
              aria-label="Sort by priority"
              onClick={() => toggleSort("priority")}
              className="w-24 sm:w-32 flex items-center justify-start gap-1 cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors select-none bg-transparent border-none p-0 font-inherit text-inherit"
            >
              Priority{" "}
              <SortIcon field="priority" activeField={sortField} direction={sortDirection} />
            </button>
            <div className="w-36 sm:w-48 hidden md:flex items-center justify-start gap-1 cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors select-none">
              Project
            </div>
            <button
              type="button"
              aria-label="Sort by due date"
              onClick={() => toggleSort("dueDate")}
              className="w-24 sm:w-32 flex items-center justify-start gap-1 cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors select-none bg-transparent border-none p-0 font-inherit text-inherit"
            >
              Due Date{" "}
              <SortIcon field="dueDate" activeField={sortField} direction={sortDirection} />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-light-bg-hover dark:bg-dark-bg-hover rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filteredAndSortedTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 sm:p-12">
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
                className="mt-4 px-4 py-2 text-sm font-medium text-accent-primary hover:text-accent-primary-dark border border-accent-primary rounded-lg hover:bg-accent-primary/5 transition-colors"
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
                  className="flex w-full border-b border-light-border dark:border-dark-border last:border-0 p-3 sm:p-4 hover:bg-light-bg-hover/50 dark:hover:bg-dark-bg-hover active:bg-light-bg-hover/50 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-inset transition-colors items-center cursor-pointer group text-left min-w-[640px]"
                  onClick={() => setSelectedTask(task)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedTask(task)
                    }
                  }}
                >
                  <div className="flex-1 min-w-[200px] flex items-center gap-2 sm:gap-3">
                    <FiList className="text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-accent-primary transition-colors shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-light-text-primary dark:text-dark-text-primary text-sm line-clamp-1 truncate">
                        {task.title}
                      </p>
                    </div>
                  </div>
                  <div className="w-28 sm:w-32 flex items-center shrink-0">
                    <span className={getStatusBadgeClass(task.status)}>
                      {task.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="w-24 sm:w-32 flex items-center shrink-0">
                    <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
                  </div>
                  <div className="w-36 sm:w-48 hidden md:flex items-center gap-2 shrink-0">
                    <span className="tag tag-project truncate max-w-full">
                      <FiFolder className="inline mr-1 shrink-0" />
                      {task.project?.name || "Personal"}
                    </span>
                  </div>
                  <div className="w-24 sm:w-32 flex items-center text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary shrink-0">
                    {task.dueDate ? (
                      <span
                        className={`flex items-center gap-1.5 ${dayjs(task.dueDate).isBefore(dayjs(), "day") && task.status !== "completed" ? "text-accent-danger" : ""}`}
                      >
                        <FiCalendar className="w-4 h-4 shrink-0" />
                        <span className="truncate">{dayjs(task.dueDate).format("MMM D")}</span>
                      </span>
                    ) : (
                      <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                        —
                      </span>
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
