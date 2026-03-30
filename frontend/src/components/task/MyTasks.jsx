import { Listbox } from "@headlessui/react"
import dayjs from "dayjs"
import { AnimatePresence, motion } from "framer-motion"
import { Fragment, useEffect, useMemo, useState } from "react"
import {
  FiAlertCircle,
  FiArrowDown,
  FiArrowUp,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiFilter,
  FiFolder,
  FiList,
  FiPlus,
  FiSearch,
} from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import { EmptyState } from "../ErrorStates.jsx"
import { Skeleton, SkeletonCircle, SkeletonText } from "../Skeleton.jsx"
import CreateTaskModal from "./CreateTaskModal"
import TaskDetailPanel from "./TaskDetailPanel.jsx"

const MyTasksSkeleton = () => (
  <div className="h-full flex flex-col">
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 items-center p-6 bg-light-bg-primary dark:bg-dark-bg-primary shrink-0">
      <div>
        <SkeletonText width="w-40" height="h-8" className="mb-2" />
        <SkeletonText width="w-64" height="h-4" />
      </div>
      <Skeleton className="w-28 h-10 rounded-lg" />
    </div>
    <div className="p-6 pt-0 flex gap-5 items-center">
      <Skeleton className="w-full md:flex-1 h-10 rounded-lg" />
      <Skeleton className="w-24 h-10 rounded-lg" />
    </div>
    <div className="flex-1 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden flex flex-col">
      <div className="flex border-b border-light-border dark:border-dark-border bg-light-bg-hover/50 dark:bg-dark-bg-hover/30 p-4 gap-4">
        <SkeletonText width="flex-1 min-w-[300px]" />
        <SkeletonText width="w-32" />
        <SkeletonText width="w-32" />
        <SkeletonText width="w-48" className="hidden md:block" />
        <SkeletonText width="w-32" />
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <SkeletonCircle size="w-2 h-2" className="!rounded-full" />
            <SkeletonText width={`w-${32 + (i % 4) * 16}`} className="flex-1 min-w-[300px]" />
            <Skeleton className="w-20 h-6 rounded-full" />
            <Skeleton className="w-16 h-4 rounded" />
            <Skeleton className="w-28 h-4 rounded hidden md:block" />
            <Skeleton className="w-20 h-4 rounded" />
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

export const MyTasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const fetchData = async () => {
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
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // Apply filtering and sorting
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]

    // Search
    if (search) {
      const query = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      )
    }

    // Filters
    if (statusFilter !== "all") result = result.filter((t) => t.status === statusFilter)
    if (priorityFilter !== "all") result = result.filter((t) => t.priority === priorityFilter)
    if (projectFilter !== "all") result = result.filter((t) => t.project?._id === projectFilter)
    // Note: real sprint filtering not yet backend supported

    // Sorting
    result.sort((a, b) => {
      let valA, valB

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

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <div className="w-4 h-4" />
    return sortDirection === "asc" ? (
      <FiArrowUp className="w-4 h-4" />
    ) : (
      <FiArrowDown className="w-4 h-4" />
    )
  }

  if (loading) {
    return <MyTasksSkeleton />
  }

  return (
    <div className="h-full flex flex-col" style={{ boxShadow: "0px 0px 1px 0.1px #000000" }}>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 items-center p-6 bg-light-bg-primary dark:bg-dark-bg-primary shrink-0">
        <div>
          <h1 className="text-3xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
            My Tasks
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Track and manage all your assigned work across projects.
          </p>
        </div>
        <button
          className="btn-primary whitespace-nowrap flex items-center gap-2"
          onClick={() => setCreateModalOpen(true)}
        >
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>{" "}
          Add Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-6 pt-0 flex gap-5 items-center">
        <div className="w-full md:flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:border-accent-primary text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary"
          />
        </div>

        <div className="w-full md:w-auto flex gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto px-4 py-2 rounded-lg flex items-center justify-center gap-2 border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap gap-3 pb-3"
          >
            <Listbox value={statusFilter} onChange={setStatusFilter}>
              <div className="relative">
                <Listbox.Button className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left min-w-[120px] cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors">
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
                <Listbox.Button className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left min-w-[120px] cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors">
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
                <Listbox.Button className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left min-w-[150px] max-w-[180px] cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors">
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
                <Listbox.Button className="bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm text-left min-w-[120px] cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors">
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
      <div className="flex-1 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden flex flex-col">
        {/* Header Header */}
        <div className="flex border-b border-light-border dark:border-dark-border bg-light-bg-hover/50 dark:bg-dark-bg-hover/30 p-4 font-semibold text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
          <div className="flex-1 min-w-[300px] flex items-center gap-2 cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">
            Title
          </div>
          <div className="w-32 flex items-center justify-start gap-1 cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">
            Status
          </div>
          <div
            onClick={() => toggleSort("priority")}
            className="w-32 flex items-center justify-start gap-1 cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors select-none"
          >
            Priority <SortIcon field="priority" />
          </div>
          <div className="w-48 hidden md:flex items-center justify-start gap-1 cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors select-none">
            Project
          </div>
          <div
            onClick={() => toggleSort("dueDate")}
            className="w-32 flex items-center justify-start gap-1 cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors select-none"
          >
            Due Date <SortIcon field="dueDate" />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-light-bg-hover dark:bg-dark-bg-hover rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filteredAndSortedTasks.length === 0 ? (
            <div className="h-full flex items-center justify-center p-12">
              <EmptyState message="No tasks match your current filters." />
            </div>
          ) : (
            <AnimatePresence>
              {filteredAndSortedTasks.map((task) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex border-b border-light-border dark:border-dark-border last:border-0 p-4 hover:bg-light-bg-hover/50 dark:hover:bg-dark-bg-hover transition-colors items-center cursor-pointer group"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex-1 min-w-[300px] flex items-center gap-3">
                    <FiList className="text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-accent-primary transition-colors" />
                    <div>
                      <p className="font-semibold text-light-text-primary dark:text-dark-text-primary text-sm line-clamp-1">
                        {task.title}
                      </p>
                    </div>
                  </div>
                  <div className="w-32 flex items-center">
                    <span className={getStatusBadgeClass(task.status)}>
                      {task.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="w-32 flex items-center">
                    <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
                  </div>
                  <div className="w-48 hidden md:flex items-center gap-2">
                    <span className="tag tag-project truncate max-w-full">
                      <FiFolder className="inline mr-1" />
                      {task.project?.name || "Personal"}
                    </span>
                  </div>
                  <div className="w-32 flex items-center text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    {task.dueDate ? (
                      <span
                        className={`flex items-center gap-1.5 ${dayjs(task.dueDate).isBefore(dayjs(), "day") && task.status !== "completed" ? "text-accent-danger" : ""}`}
                      >
                        <FiCalendar className="w-4 h-4" />
                        {dayjs(task.dueDate).format("MMM D")}
                      </span>
                    ) : (
                      <span className="text-light-text-tertiary dark:text-dark-text-tertiary ml-6">
                        —
                      </span>
                    )}
                  </div>
                </motion.div>
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
          onTaskUpdated={(updatedTask) => {
            fetchData()
          }}
        />
      )}

      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTaskCreated={(newTask) => {
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
