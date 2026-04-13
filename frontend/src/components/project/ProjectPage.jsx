import dayjs from "dayjs"
import quarterOfYear from "dayjs/plugin/quarterOfYear"
import relativeTime from "dayjs/plugin/relativeTime"
import weekOfYear from "dayjs/plugin/weekOfYear"
import { useCallback, useEffect, useId, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  FiCalendar,
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiLock,
  FiPlus,
  FiSearch,
  FiSettings,
  FiUsers,
} from "react-icons/fi"
import { useNavigate, useParams } from "react-router-dom"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../../contexts/customHook.js"
import Modal from "../Modal"
import Skeleton from "../Skeleton"
import CreateTaskModal from "../task/CreateTaskModal"
import TaskCardSkeleton from "../task/TaskCardSkeleton"
import TaskDetailPanel from "../task/TaskDetailPanel"
import BoardColumn from "./BoardColumn.jsx"
import CalendarGrid from "./CalendarGrid.jsx"
import ListViewTable from "./ListViewTable.jsx"
import ProjectActivityPanel from "./ProjectActivityPanel.jsx"
import ProjectFilterBar from "./ProjectFilterBar.jsx"
import ProjectMembers from "./ProjectMembers"
import ProjectTeamPanel from "./ProjectTeamPanel.jsx"
import ProjectTimelinePanel from "./ProjectTimelinePanel.jsx"
import TimelineGrid from "./TimelineGrid.jsx"

dayjs.extend(relativeTime)
dayjs.extend(quarterOfYear)
dayjs.extend(weekOfYear)

const initialColumns = {
  todo: { title: "To Do", tasks: [], color: "#8B8178" },
  "in-progress": { title: "In Progress", tasks: [], color: "#C4654A" },
  "under-review": { title: "Under Review", tasks: [], color: "#D4A548" },
  completed: { title: "Completed", tasks: [], color: "#7A9A6D" },
}

const ProjectPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const searchId = useId()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [members, setMembers] = useState([])
  const [columns, setColumns] = useState(initialColumns)
  const [activeTab, setActiveTab] = useState("board")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [timelineZoom, setTimelineZoom] = useState("month")
  const [timelineDate, setTimelineDate] = useState(dayjs())
  const [calendarDate, setCalendarDate] = useState(dayjs())

  const userRole = members.find((m) => (m.user?._id || m.user) === user?._id)?.role
  const canViewBoard = userRole === "owner" || userRole === "project_admin" || userRole === "member"
  const isAdmin = userRole === "owner" || userRole === "project_admin"

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  // ── Data Fetching ──────────────────────────────────────────────────────
  const fetchProjectData = useCallback(async () => {
    if (!projectId || projectId === "undefined") return
    setLoading(true)
    try {
      const [projectResponse, tasksResponse, membersResponse] = await Promise.all([
        apiService.getProjectById(projectId),
        apiService.getTasksByProjectId(projectId),
        apiService.getAllMembers(projectId),
      ])
      if (projectResponse.success) setProject(projectResponse.data)
      if (membersResponse.success) setMembers(membersResponse.data)
      if (tasksResponse.success) {
        const tasks = tasksResponse.data
        const groupedColumns = Object.fromEntries(
          Object.entries(initialColumns).map(([key, val]) => [key, { ...val, tasks: [] }])
        )
        tasks.forEach((task) => {
          const status = task.status || "todo"
          if (groupedColumns[status]) groupedColumns[status].tasks.push(task)
        })
        setColumns(groupedColumns)
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "An error occurred while fetching project data."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProjectData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  // ── Task CRUD Handlers ─────────────────────────────────────────────────
  const handleTaskCreated = (newTask) => {
    if (!newTask?.status || !initialColumns[newTask.status]) return
    setColumns((prev) => ({
      ...prev,
      [newTask.status]: {
        ...prev[newTask.status],
        tasks: [...(prev[newTask.status]?.tasks || []), newTask],
      },
    }))
  }

  const handleTaskUpdated = (updatedTask) => {
    if (!updatedTask?.status || !initialColumns[updatedTask.status]) return
    setColumns((prev) => {
      let originalStatus
      for (const status in prev) {
        if (prev[status].tasks.some((t) => t._id === updatedTask._id)) {
          originalStatus = status
          break
        }
      }
      if (!originalStatus) return prev

      const updatedTasks = prev[originalStatus].tasks.map((t) =>
        t._id === updatedTask._id ? updatedTask : t
      )

      if (originalStatus !== updatedTask.status) {
        return {
          ...prev,
          [originalStatus]: {
            ...prev[originalStatus],
            tasks: updatedTasks.filter((t) => t._id !== updatedTask._id),
          },
          [updatedTask.status]: {
            ...prev[updatedTask.status],
            tasks: [...(prev[updatedTask.status]?.tasks || []), updatedTask],
          },
        }
      }

      return {
        ...prev,
        [originalStatus]: {
          ...prev[originalStatus],
          tasks: updatedTasks,
        },
      }
    })
  }

  const openEditModal = (task) => {
    setSelectedTask(task)
    setIsEditModalOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedTask) return
    const toastId = toast.loading("Deleting task...")
    const { _id: taskId, status } = selectedTask
    const previousColumns = columns
    setColumns((prev) => {
      const c = { ...prev }
      c[status] = { ...c[status], tasks: c[status].tasks.filter((t) => t._id !== taskId) }
      return c
    })
    setIsDeleteModalOpen(false)
    try {
      await apiService.deleteTask(projectId, taskId)
      toast.success("Task deleted successfully!", { id: toastId })
    } catch (_err) {
      toast.error("Failed to delete task", { id: toastId })
      setColumns(previousColumns)
    } finally {
      setSelectedTask(null)
    }
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
    requestAnimationFrame(() => {
      if (e.currentTarget) e.currentTarget.style.opacity = "0.4"
    })
  }, [])

  const handleDragEnd = useCallback((e) => {
    if (e.currentTarget) e.currentTarget.style.opacity = "1"
    setDraggedTask(null)
    setDragOverColumn(null)
  }, [])

  const handleDragOver = useCallback((e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn((prev) => (prev !== columnId ? columnId : prev))
  }, [])

  const handleDragLeave = useCallback(() => setDragOverColumn(null), [])

  const handleDrop = useCallback(
    async (e, targetColumnId, dropIndex) => {
      e.preventDefault()
      setDragOverColumn(null)
      if (!draggedTask || !draggedTask.status || !initialColumns[targetColumnId]) return
      const sourceColumnId = draggedTask.status
      if (!initialColumns[sourceColumnId]) return

      const isSameColumn = sourceColumnId === targetColumnId

      setColumns((prev) => {
        const sourceTasks = prev[sourceColumnId]?.tasks || []
        const sourceIndex = sourceTasks.findIndex((t) => t._id === draggedTask._id)
        if (sourceIndex === -1) return prev

        if (isSameColumn) {
          if (dropIndex === sourceIndex || dropIndex === sourceIndex + 1) return prev
          const newTasks = [...sourceTasks]
          const [movedTask] = newTasks.splice(sourceIndex, 1)
          const insertAt = dropIndex > sourceIndex ? dropIndex - 1 : dropIndex
          newTasks.splice(Math.max(0, Math.min(insertAt, newTasks.length)), 0, movedTask)
          return {
            ...prev,
            [sourceColumnId]: { ...prev[sourceColumnId], tasks: newTasks },
          }
        }

        const targetTasks = prev[targetColumnId]?.tasks || []
        const [movedTask] = sourceTasks.filter((t) => t._id === draggedTask._id)
        const updatedSourceTasks = sourceTasks.filter((t) => t._id !== draggedTask._id)
        const insertAt = Math.min(dropIndex ?? targetTasks.length, targetTasks.length)
        const newTargetTasks = [
          ...targetTasks.slice(0, insertAt),
          { ...movedTask, status: targetColumnId },
          ...targetTasks.slice(insertAt),
        ]

        return {
          ...prev,
          [sourceColumnId]: { ...prev[sourceColumnId], tasks: updatedSourceTasks },
          [targetColumnId]: { ...prev[targetColumnId], tasks: newTargetTasks },
        }
      })

      // Only call API when status actually changes
      if (!isSameColumn) {
        const toastId = toast.loading("Updating task status...")
        try {
          await apiService.updateTask(projectId, draggedTask._id, { status: targetColumnId })
          toast.success("Task status updated successfully!", { id: toastId })
        } catch (_err) {
          toast.error("Failed to update task status", { id: toastId })
          fetchProjectData()
        }
      }
      setDraggedTask(null)
    },
    [draggedTask, projectId, fetchProjectData]
  )

  // ── Computed Values ────────────────────────────────────────────────────
  const counts = useMemo(
    () => ({
      todo: columns.todo?.tasks?.length || 0,
      inProgress: columns["in-progress"]?.tasks?.length || 0,
      underReview: columns["under-review"]?.tasks?.length || 0,
      completed: columns.completed?.tasks?.length || 0,
    }),
    [columns]
  )

  const totalTasks = counts.todo + counts.inProgress + counts.underReview + counts.completed
  const completedPercent = totalTasks > 0 ? Math.round((counts.completed / totalTasks) * 100) : 0

  const allTasks = useMemo(() => {
    const tasks = []
    Object.values(columns).forEach((col) => {
      tasks.push(...col.tasks)
    })
    return tasks
  }, [columns])

  const filteredTasks = useMemo(() => {
    let result = [...allTasks]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      )
    }
    if (statusFilter) result = result.filter((t) => t.status === statusFilter)
    if (priorityFilter)
      result = result.filter((t) => t.priority?.toLowerCase() === priorityFilter.toLowerCase())
    if (assigneeFilter)
      result = result.filter((t) =>
        t.assignedTo?.some((a) => {
          const u = typeof a === "object" ? a : null
          return u?.fullname?.toLowerCase().includes(assigneeFilter.toLowerCase())
        })
      )
    if (dateFilter) {
      const today = dayjs().startOf("day")
      result = result.filter((t) => {
        if (!t.dueDate) return false
        const due = dayjs(t.dueDate)
        if (dateFilter === "overdue") return due.isBefore(today) && t.status !== "completed"
        if (dateFilter === "today") return due.isSame(today, "day")
        if (dateFilter === "week") return due.isAfter(today) && due.isBefore(today.add(7, "day"))
        if (dateFilter === "month") return due.isAfter(today) && due.isBefore(today.add(30, "day"))
        return true
      })
    }
    return result
  }, [allTasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, dateFilter])

  const filteredColumns = useMemo(() => {
    const cols = Object.fromEntries(
      Object.entries(initialColumns).map(([key, val]) => [key, { ...val, tasks: [] }])
    )
    filteredTasks.forEach((task) => {
      const status = task.status || "todo"
      if (cols[status]) cols[status].tasks.push(task)
    })
    return cols
  }, [filteredTasks])

  const timelineColumns = useMemo(() => {
    if (timelineZoom === "day") {
      const d = timelineDate.startOf("day")
      return [{ label: d.format("DD"), sublabel: d.format("ddd"), month: d.format("MMM"), date: d }]
    }
    if (timelineZoom === "week") {
      const start = timelineDate.startOf("week")
      return Array.from({ length: 7 }, (_, i) => {
        const d = start.add(i, "day")
        return { label: d.format("DD"), sublabel: d.format("ddd"), month: d.format("MMM"), date: d }
      })
    }
    if (timelineZoom === "month") {
      const start = timelineDate.startOf("month")
      return Array.from({ length: timelineDate.daysInMonth() }, (_, i) => {
        const d = start.add(i, "day")
        return { label: d.format("DD"), sublabel: d.format("ddd"), month: d.format("MMM"), date: d }
      })
    }
    if (timelineZoom === "quarter") {
      const start = timelineDate.startOf("quarter")
      const end = timelineDate.endOf("quarter")
      const days = end.diff(start, "day") + 1
      return Array.from({ length: days }, (_, i) => {
        const d = start.add(i, "day")
        return { label: d.format("DD"), sublabel: d.format("ddd"), month: d.format("MMM"), date: d }
      })
    }
    return []
  }, [timelineZoom, timelineDate])

  const calendarDaysData = useMemo(() => {
    const start = calendarDate.startOf("month")
    const startDay = start.day()
    const daysInMonth = calendarDate.daysInMonth()
    const days = []
    for (let i = 0; i < startDay; i++) days.push({ day: null, isCurrentMonth: false })
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, isCurrentMonth: true })
    for (let i = 1; i <= 42 - days.length; i++) days.push({ day: i, isCurrentMonth: false })
    return days
  }, [calendarDate])

  // ── Error State ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-light-bg-primary dark:bg-dark-bg-primary">
        <h1 className="text-2xl font-bold text-accent-danger dark:text-accent-danger-dark mb-2">
          Error Loading Project
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-md">{error}</p>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-light-bg-primary dark:bg-dark-bg-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-[56px] flex-shrink-0 bg-light-bg-secondary dark:bg-dark-bg-tertiary border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {loading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <>
              <h1 className="text-base sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary truncate">
                {project?.name}
              </h1>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${project?.isActive !== false ? "bg-accent-success/10 text-accent-success" : "bg-accent-danger/10 text-accent-danger"}`}
              >
                {project?.isActive !== false ? "Active" : "Inactive"}
              </span>
              {(userRole === "owner" || userRole === "project_admin") && (
                <button
                  type="button"
                  onClick={async () => {
                    const newStatus = project?.isActive === false
                    const toastId = toast.loading("Updating project...")
                    try {
                      await apiService.updateProject(projectId, {
                        name: project.name,
                        description: project.description,
                        isActive: newStatus,
                      })
                      setProject((prev) => ({ ...prev, isActive: newStatus }))
                      toast.success(`Project ${newStatus ? "activated" : "deactivated"}`, {
                        id: toastId,
                      })
                    } catch {
                      toast.error("Failed to update project status", { id: toastId })
                    }
                  }}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors cursor-pointer ${project?.isActive !== false ? "bg-accent-warning/10 text-accent-warning hover:bg-accent-warning/20" : "bg-accent-success/10 text-accent-success hover:bg-accent-success/20"}`}
                  aria-label={
                    project?.isActive !== false ? "Deactivate project" : "Activate project"
                  }
                >
                  {project?.isActive !== false ? "Deactivate" : "Activate"}
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center" title={`${members.length} members`}>
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((m, idx) => (
                <div
                  key={m.user?._id || idx}
                  className="w-7 h-7 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-tertiary bg-gradient-to-br from-accent-primary to-accent-info flex items-center justify-center text-xs text-white font-bold"
                >
                  {m.user?.fullname?.slice(0, 2).toUpperCase() || "U"}
                </div>
              ))}
              {members.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-tertiary bg-light-border dark:bg-dark-border flex items-center justify-center text-xs text-light-text-tertiary dark:text-dark-text-tertiary font-medium">
                  +{members.length - 4}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-accent-primary text-white hover:bg-accent-primary-dark transition-all border-none cursor-pointer shadow-sm hover:shadow-md"
          >
            <FiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
          <button
            type="button"
            onClick={() => setIsMembersModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all cursor-pointer"
          >
            <FiUsers className="w-4 h-4" />
            <span className="hidden lg:inline">Members</span>
          </button>
        </div>
      </header>

      {/* View Tabs & Filter Bar */}
      {(activeTab === "board" || activeTab === "list") && (
        <div className="flex flex-col gap-3 px-4 sm:px-6 py-4 bg-light-bg-secondary dark:bg-dark-bg-tertiary border-b border-light-border dark:border-dark-border">
          {/* Top Row: View Tabs + Search */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg p-1">
              {[
                { id: "board", icon: FiCircle, label: "Board" },
                { id: "list", icon: FiCheckCircle, label: "List" },
                { id: "timeline", icon: FiClock, label: "Timeline" },
                { id: "calendar", icon: FiCalendar, label: "Calendar" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`px-3 sm:px-4 h-9 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === id ? "bg-accent-primary text-white shadow-sm" : "text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate(`/project/${projectId}/admin`)}
                  className="px-3 sm:px-4 h-9 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center gap-2 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"
                >
                  <FiSettings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
            </div>
            <div className="relative flex-shrink-0">
              <label htmlFor={searchId} className="sr-only">
                Search tasks
              </label>
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
              <input
                id={searchId}
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 sm:w-56 lg:w-64 pl-9 pr-3 py-2 h-9 text-sm bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border dark:border-dark-border rounded-lg text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
              />
            </div>
          </div>
          {/* Bottom Row: Filters */}
          <ProjectFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            assigneeFilter={assigneeFilter}
            onAssigneeChange={setAssigneeFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            members={members}
          />
        </div>
      )}

      {/* Simple View Tabs for Timeline/Calendar */}
      {(activeTab === "timeline" || activeTab === "calendar") && (
        <div className="flex items-center gap-1 px-4 sm:px-6 py-3 bg-light-bg-secondary dark:bg-dark-bg-tertiary border-b border-light-border dark:border-dark-border overflow-x-auto">
          {[
            { id: "board", icon: FiCircle },
            { id: "list", icon: FiCheckCircle },
            { id: "timeline", icon: FiClock },
            { id: "calendar", icon: FiCalendar },
          ].map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-3 sm:px-4 h-9 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center gap-2 flex-shrink-0 ${activeTab === id ? "bg-accent-primary text-white shadow-sm" : "text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {id === "board"
                  ? "Board"
                  : id === "list"
                    ? "List"
                    : id === "timeline"
                      ? "Timeline"
                      : "Calendar"}
              </span>
            </button>
          ))}
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate(`/project/${projectId}/admin`)}
              className="px-3 sm:px-4 h-9 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center gap-2 flex-shrink-0 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"
            >
              <FiSettings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-h-0 bg-light-bg-secondary dark:bg-dark-bg-tertiary">
        {loading ? (
          <div className="flex gap-4 p-4 sm:p-6 min-w-max">
            {["todo", "in-progress", "under-review", "completed"].map((col) => (
              <div
                key={col}
                className="w-72 flex-shrink-0 bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-light-text-tertiary dark:bg-dark-text-tertiary" />
                  <span className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary flex-1">
                    {col === "in-progress"
                      ? "In Progress"
                      : col === "under-review"
                        ? "Under Review"
                        : col === "completed"
                          ? "Completed"
                          : "To Do"}
                  </span>
                  <div className="w-6 h-6 flex items-center justify-center rounded-md bg-light-border dark:bg-dark-border text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    {col === "todo"
                      ? 5
                      : col === "in-progress"
                        ? 3
                        : col === "under-review"
                          ? 2
                          : 4}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <TaskCardSkeleton />
                  <TaskCardSkeleton />
                </div>
              </div>
            ))}
          </div>
        ) : !canViewBoard ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md p-6">
              <FiLock className="w-12 h-12 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary opacity-50" />
              <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                Board Access Restricted
              </h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                You are not a member of this project. Contact your project admin for access.
              </p>
            </div>
          </div>
        ) : activeTab === "list" ? (
          <ListViewTable tasks={filteredTasks} members={members} onTaskClick={openEditModal} />
        ) : activeTab === "timeline" ? (
          <TimelineGrid
            tasks={filteredTasks}
            timelineColumns={timelineColumns}
            timelineZoom={timelineZoom}
            timelineDate={timelineDate}
            onTimelineZoomChange={setTimelineZoom}
            onTimelineDateChange={setTimelineDate}
            onTaskClick={openEditModal}
          />
        ) : activeTab === "calendar" ? (
          <CalendarGrid
            tasks={filteredTasks}
            calendarDaysData={calendarDaysData}
            calendarDate={calendarDate}
            onMonthChange={setCalendarDate}
            onTaskClick={openEditModal}
          />
        ) : (
          <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-light-bg-secondary dark:bg-dark-bg-tertiary">
            <div className="flex gap-4 min-w-[288px]">
              {Object.entries(filteredColumns).map(([status, column]) => (
                <BoardColumn
                  key={status}
                  column={column}
                  columnId={status}
                  tasks={column.tasks}
                  isDragOver={dragOverColumn === status}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onTaskClick={openEditModal}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onAddTask={() => setIsCreateModalOpen(true)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer: Stats Bar + Bottom Panels */}
      <footer className="flex-shrink-0 border-t border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary">
        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 text-xs flex-wrap">
          {[
            { color: "#8B8178", label: "To Do", count: counts.todo },
            { color: "#C4654A", label: "In Progress", count: counts.inProgress },
            { color: "#D4A548", label: "Under Review", count: counts.underReview },
            { color: "#7A9A6D", label: "Completed", count: counts.completed },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
                {s.label}:&nbsp;
              </span>
              <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                {s.count}
              </span>
            </div>
          ))}
          <div className="flex-1" />
          <span className="text-light-text-tertiary dark:text-dark-text-tertiary">
            Progress: {completedPercent}%
          </span>
          <div className="w-28 h-1 bg-light-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-primary rounded-full transition-all"
              style={{ width: `${completedPercent}%` }}
            />
          </div>
        </div>
        <div className="flex gap-4 p-5 overflow-x-auto">
          <ProjectActivityPanel tasks={allTasks} members={members} />
          <ProjectTeamPanel members={members} tasks={allTasks} />
          <ProjectTimelinePanel project={project} columns={columns} />
        </div>
      </footer>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        projectId={projectId}
        members={members}
      />
      <ProjectMembers
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        projectId={projectId}
        members={members}
        setMembers={setMembers}
      />
      <TaskDetailPanel
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onTaskUpdated={handleTaskUpdated}
        task={selectedTask}
        members={members}
      />
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Task"
      >
        <div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Are you sure you want to delete the task titled "{selectedTask?.title}"?
          </p>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="button" onClick={handleDelete} className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProjectPage
