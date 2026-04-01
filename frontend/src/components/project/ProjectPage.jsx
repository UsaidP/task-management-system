import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { motion } from "framer-motion"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCircle,
  FiClock,
  FiFilter,
  FiLock,
  FiPlus,
  FiSearch,
  FiUser,
  FiUsers,
} from "react-icons/fi"
import { useParams } from "react-router-dom"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import Modal from "../Modal"
import Skeleton from "../Skeleton"
import CreateTaskModal from "../task/CreateTaskModal"
import TaskCardSkeleton from "../task/TaskCardSkeleton"
import TaskDetailPanel from "../task/TaskDetailPanel"
import ProjectMembers from "./ProjectMembers"

dayjs.extend(relativeTime)

const deepCopy = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj
  }
  if (React.isValidElement(obj)) {
    return obj
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCopy(item))
  }
  const newObj = {}
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      newObj[key] = deepCopy(obj[key])
    }
  }
  return newObj
}

const initialColumns = {
  todo: {
    title: "To Do",
    tasks: [],
    color: "#8B8178", // TaskFlow task.status.todo (warm gray)
  },
  "in-progress": {
    title: "In Progress",
    tasks: [],
    color: "#C4654A", // TaskFlow task.status.progress (terracotta)
  },
  "under-review": {
    title: "Under Review",
    tasks: [],
    color: "#D4A548", // TaskFlow task.status.review (ochre)
  },
  completed: {
    title: "Completed",
    tasks: [],
    color: "#7A9A6D", // TaskFlow task.status.done (sage)
  },
}

const ProjectPage = () => {
  const { projectId } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [members, setMembers] = useState([])
  const [columns, setColumns] = useState(initialColumns)
  const [activeTab, setActiveTab] = useState("board")
  const [isStarred, setIsStarred] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [timelineZoom, setTimelineZoom] = useState("month")
  const [timelineDate, setTimelineDate] = useState(dayjs())
  const [calendarDate, setCalendarDate] = useState(dayjs())

  const userRole = members.find((m) => (m.user?._id || m.user) === user?._id)?.role
  // All project members (owner, project_admin, member) can view the board
  const canViewBoard = userRole === "owner" || userRole === "project_admin" || userRole === "member"

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  const fetchProjectData = useCallback(async () => {
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
        const groupedColumns = tasks.reduce((acc, task) => {
          const status = task.status || "todo"
          if (acc[status]) {
            acc[status].tasks.push(task)
          }
          return acc
        }, deepCopy(initialColumns))
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
  }, [fetchProjectData])

  const handleTaskCreated = (newTask) => {
    if (!newTask || !newTask.status || !columns[newTask.status]) return
    setColumns((prevColumns) => {
      const newColumns = { ...prevColumns }
      const newTasks = [...newColumns[newTask.status].tasks, newTask]
      newColumns[newTask.status] = { ...newColumns[newTask.status], tasks: newTasks }
      return newColumns
    })
    toast.success("Task created successfully!")
  }

  const handleTaskUpdated = (updatedTask) => {
    if (!updatedTask || !updatedTask.status || !columns[updatedTask.status]) return
    setColumns((prevColumns) => {
      const newColumns = { ...prevColumns }
      let originalStatus
      for (const status in newColumns) {
        if (newColumns[status].tasks.some((t) => t._id === updatedTask._id)) {
          originalStatus = status
          break
        }
      }
      if (originalStatus && originalStatus !== updatedTask.status) {
        const oldTasks = newColumns[originalStatus].tasks.filter((t) => t._id !== updatedTask._id)
        newColumns[originalStatus] = { ...newColumns[originalStatus], tasks: oldTasks }
      }
      const newTasks = [...newColumns[updatedTask.status].tasks]
      const taskIndex = newTasks.findIndex((t) => t._id === updatedTask._id)
      if (taskIndex !== -1) {
        newTasks[taskIndex] = updatedTask
      } else {
        newTasks.push(updatedTask)
      }
      newColumns[updatedTask.status] = { ...newColumns[updatedTask.status], tasks: newTasks }
      return newColumns
    })
    toast.success("Task updated successfully!")
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
      const newCols = { ...prev }
      const newTasks = newCols[status].tasks.filter((t) => t._id !== taskId)
      newCols[status] = { ...newCols[status], tasks: newTasks }
      return newCols
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

  // Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
    setTimeout(() => {
      e.target.style.opacity = "0.4"
    }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = ""
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId)
    }
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (!draggedTask) return

    const sourceColumnId = draggedTask.status
    if (sourceColumnId === targetColumnId) return

    // Optimistic UI update
    setColumns((prev) => {
      const newCols = { ...prev }
      const sourceTasks = newCols[sourceColumnId].tasks.filter((t) => t._id !== draggedTask._id)
      const updatedTask = { ...draggedTask, status: targetColumnId }
      const targetTasks = [...newCols[targetColumnId].tasks, updatedTask]
      newCols[sourceColumnId] = { ...newCols[sourceColumnId], tasks: sourceTasks }
      newCols[targetColumnId] = { ...newCols[targetColumnId], tasks: targetTasks }
      return newCols
    })

    // Update task status on server
    try {
      await apiService.updateTask(projectId, draggedTask._id, { status: targetColumnId })
      toast.success("Task moved successfully!")
    } catch (err) {
      toast.error("Failed to move task")
      // Revert on error
      fetchProjectData()
    }

    setDraggedTask(null)
  }

  const getTaskCounts = () => {
    return {
      todo: columns.todo?.tasks?.length || 0,
      inProgress: columns["in-progress"]?.tasks?.length || 0,
      underReview: columns["under-review"]?.tasks?.length || 0,
      completed: columns.completed?.tasks?.length || 0,
    }
  }

  const counts = getTaskCounts()
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
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query)
      )
    }
    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter)
    }
    if (priorityFilter) {
      result = result.filter((t) => t.priority?.toLowerCase() === priorityFilter.toLowerCase())
    }
    if (assigneeFilter) {
      result = result.filter((t) =>
        t.assignedTo?.some((a) => {
          const u = typeof a === "object" ? a : null
          return u?.fullname?.toLowerCase().includes(assigneeFilter.toLowerCase())
        })
      )
    }
    if (dateFilter) {
      const today = dayjs().startOf("day")
      result = result.filter((t) => {
        if (!t.dueDate) return false
        const due = dayjs(t.dueDate)
        if (dateFilter === "overdue") return due.isBefore(today) && t.status !== "completed"
        if (dateFilter === "today") return due.isSame(today, "day")
        if (dateFilter === "week") {
          const weekEnd = today.add(7, "day")
          return due.isAfter(today) && due.isBefore(weekEnd)
        }
        if (dateFilter === "month") {
          const monthEnd = today.add(30, "day")
          return due.isAfter(today) && due.isBefore(monthEnd)
        }
        return true
      })
    }
    return result
  }, [allTasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, dateFilter])

  // Filtered columns for board view
  const filteredColumns = useMemo(() => {
    const cols = deepCopy(initialColumns)
    filteredTasks.forEach((task) => {
      const status = task.status || "todo"
      if (cols[status]) {
        cols[status].tasks.push(task)
      }
    })
    return cols
  }, [filteredTasks])

  // Timeline view columns
  const timelineColumns = useMemo(() => {
    if (timelineZoom === "month") {
      const startOfMonth = timelineDate.startOf("month")
      const daysInMonth = timelineDate.daysInMonth()
      return Array.from({ length: daysInMonth }, (_, i) => {
        const d = startOfMonth.add(i, "day")
        return { label: d.format("DD"), sublabel: d.format("ddd"), date: d }
      })
    }
    return []
  }, [timelineZoom, timelineDate])

  // Calendar view days
  const calendarDaysData = useMemo(() => {
    const startOfMonth = calendarDate.startOf("month")
    const startDay = startOfMonth.day()
    const daysInMonth = calendarDate.daysInMonth()
    const days = []
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, isCurrentMonth: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true })
    }
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false })
    }
    return days
  }, [calendarDate])

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
      case "high":
        return "p-high"
      case "medium":
        return "p-medium"
      case "low":
        return "p-low"
      default:
        return "p-medium"
    }
  }

  const formatDate = (date) => {
    if (!date) return null
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getStatusBadge = (status) => {
    const styles = {
      todo: "bg-[#8B817822] text-[#8B8178]", // TaskFlow task.status.todo
      "in-progress": "bg-[#C4654A22] text-[#C4654A]", // TaskFlow task.status.progress
      "under-review": "bg-[#D4A54822] text-[#D4A548]", // TaskFlow task.status.review
      completed: "bg-[#7A9A6D22] text-[#7A9A6D]", // TaskFlow task.status.done
    }
    const labels = {
      todo: "To Do",
      "in-progress": "In Progress",
      "under-review": "Under Review",
      completed: "Completed",
    }
    return { style: styles[status] || styles.todo, label: labels[status] || status }
  }

  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: "bg-[#C44A4A22] text-[#C44A4A]", // TaskFlow task.priority.urgent
      high: "bg-[#D45A5A22] text-[#D45A5A]", // TaskFlow task.priority.high
      medium: "bg-[#D4A54822] text-[#D4A548]", // TaskFlow task.priority.medium
      low: "bg-[#6888A022] text-[#6888A0]", // TaskFlow task.priority.low
    }
    return styles[priority?.toLowerCase()] || styles.medium
  }

  const renderListView = () => (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-light-bg-secondary dark:bg-dark-bg-tertiary border-b border-light-border dark:border-dark-border z-10">
          <tr>
            <th className="px-4 py-3 text-left text-[12px] font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              Task
            </th>
            <th className="px-4 py-3 text-left text-[12px] font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              Status
            </th>
            <th className="px-4 py-3 text-left text-[12px] font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-[12px] font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              Assignees
            </th>
            <th className="px-4 py-3 text-left text-[12px] font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              Due Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-light-border dark:divide-dark-border">
          {filteredTasks.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-light-text-tertiary dark:text-dark-text-tertiary">
                No tasks found
              </td>
            </tr>
          ) : (
            filteredTasks.map((task) => {
              const status = getStatusBadge(task.status)
              return (
                <tr
                  key={task._id}
                  onClick={() => openEditModal(task)}
                  className="hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-light-text-primary dark:text-dark-text-primary">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-medium px-2 py-1 rounded-full ${status.style}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-medium px-2 py-1 rounded-full ${getPriorityBadge(task.priority)}`}
                    >
                      {task.priority || "Medium"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {task.assignedTo?.length > 0 ? (
                        task.assignedTo.slice(0, 3).map((a, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-primary to-accent-info flex items-center justify-center text-[10px] text-white font-bold -ml-1 first:ml-0"
                          >
                            {typeof a === "object" ? a.fullname?.slice(0, 2).toUpperCase() : "U"}
                          </div>
                        ))
                      ) : (
                        <span className="text-[12px] text-light-text-tertiary dark:text-dark-text-tertiary">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {task.dueDate ? (
                      <span className="text-[12px] text-light-text-secondary dark:text-dark-text-secondary">
                        {dayjs(task.dueDate).format("MMM DD, YYYY")}
                      </span>
                    ) : (
                      <span className="text-[12px] text-light-text-tertiary dark:text-dark-text-tertiary">—</span>
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )

  const renderTimelineView = () => {
    const getTaskPosition = (task) => {
      if (!task.dueDate) return null
      const start = task.startDate ? dayjs(task.startDate) : dayjs(task.dueDate).subtract(3, "day")
      const end = dayjs(task.dueDate)
      const firstCol = timelineColumns[0]?.date
      const lastCol = timelineColumns[timelineColumns.length - 1]?.date
      if (!firstCol || !lastCol) return null
      if (end.isBefore(firstCol) || start.isAfter(lastCol)) return null
      const totalSpan = lastCol.diff(firstCol, "day") + 1
      const startOffset = Math.max(0, start.diff(firstCol, "day"))
      const duration = Math.max(1, end.diff(start, "day") + 1)
      return {
        left: (startOffset / totalSpan) * 100,
        width: Math.max((duration / totalSpan) * 100, 5),
      }
    }

    const getStatusColor = (status) => {
      const colors = {
        todo: "#8B8178", // TaskFlow task.status.todo
        "in-progress": "#C4654A", // TaskFlow task.status.progress
        "under-review": "#D4A548", // TaskFlow task.status.review
        completed: "#7A9A6D", // TaskFlow task.status.done
      }
      return colors[status] || colors.todo
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 p-3 border-b border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary shrink-0">
          <div className="flex items-center gap-1 bg-light-bg-tertiary dark:bg-dark-bg-secondary rounded-lg p-1">
            <button
              type="button"
              onClick={() => setTimelineZoom("day")}
              className={`px-3 py-1.5 text-[12px] rounded transition-colors ${timelineZoom === "day"
                  ? "bg-accent-primary text-white"
                  : "text-light-text-tertiary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setTimelineZoom("week")}
              className={`px-3 py-1.5 text-[12px] rounded transition-colors ${timelineZoom === "week"
                  ? "bg-accent-primary text-white"
                  : "text-light-text-tertiary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setTimelineZoom("month")}
              className={`px-3 py-1.5 text-[12px] rounded transition-colors ${timelineZoom === "month"
                  ? "bg-accent-primary text-white"
                  : "text-light-text-tertiary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                }`}
            >
              Month
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTimelineDate(timelineDate.add(-1, timelineZoom))}
              className="p-1.5 rounded hover:bg-light-border dark:hover:bg-dark-border transition-colors"
            >
              <FiChevronLeft className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
            <span className="text-[13px] font-medium text-light-text-primary dark:text-dark-text-primary min-w-[140px] text-center">
              {timelineZoom === "month"
                ? timelineDate.format("MMMM YYYY")
                : timelineDate.format("MMM YYYY")}
            </span>
            <button
              type="button"
              onClick={() => setTimelineDate(timelineDate.add(1, timelineZoom))}
              className="p-1.5 rounded hover:bg-light-border dark:hover:bg-dark-border transition-colors"
            >
              <FiChevronRight className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
          </div>
          <div className="flex-1" />
          <span className="text-[12px] text-light-text-tertiary dark:text-dark-text-tertiary">{filteredTasks.length} tasks</span>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="flex min-h-full">
            <div className="w-40 flex-shrink-0 border-r border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary">
              <div className="px-3 py-2 text-[11px] font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase border-b border-light-border dark:border-dark-border">
                Task
              </div>
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => openEditModal(task)}
                  className="px-3 py-2.5 border-b border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover cursor-pointer"
                >
                  <p className="text-[12px] font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                    {task.title}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex-1 relative">
              <div className="flex sticky top-0 bg-light-bg-secondary dark:bg-dark-bg-tertiary border-b border-light-border dark:border-dark-border">
                {timelineColumns.map((col, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-[30px] px-1 py-2 border-r border-light-border dark:border-dark-border text-center"
                  >
                    <div className="text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary">{col.label}</div>
                    <div className="text-[9px] text-light-text-tertiary dark:text-dark-text-tertiary uppercase">
                      {col.sublabel}
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative">
                {filteredTasks.map((task, idx) => {
                  const position = getTaskPosition(task)
                  if (!position) return null
                  return (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => openEditModal(task)}
                      className="absolute top-1 bottom-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        left: `${position.left}%`,
                        width: `${position.width}%`,
                        backgroundColor: getStatusColor(task.status),
                        opacity: 0.8,
                      }}
                    >
                      <div className="p-1 overflow-hidden">
                        <p className="text-[10px] font-medium text-white truncate">{task.title}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              {filteredTasks.length === 0 && (
                <div className="flex items-center justify-center h-32 text-light-text-tertiary dark:text-dark-text-tertiary text-[13px]">
                  No tasks found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderCalendarView = () => {
    const today = dayjs()

    const getTasksForDay = (day) => {
      if (!day) return []
      return filteredTasks.filter((task) => {
        const taskDate = dayjs(task.dueDate)
        return (
          taskDate.date() === day &&
          taskDate.month() === calendarDate.month() &&
          taskDate.year() === calendarDate.year()
        )
      })
    }

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 p-3 border-b border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary shrink-0">
          <button
            type="button"
            onClick={() => setCalendarDate(calendarDate.add(-1, "month"))}
            className="p-1.5 rounded hover:bg-light-border dark:hover:bg-dark-border transition-colors"
          >
            <FiChevronLeft className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
          </button>
          <span className="text-[14px] font-semibold text-light-text-primary dark:text-dark-text-primary min-w-[160px] text-center">
            {calendarDate.format("MMMM YYYY")}
          </span>
          <button
            type="button"
            onClick={() => setCalendarDate(calendarDate.add(1, "month"))}
            className="p-1.5 rounded hover:bg-light-border dark:hover:bg-dark-border transition-colors"
          >
            <FiChevronRight className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
          </button>
          <button
            type="button"
            onClick={() => setCalendarDate(dayjs())}
            className="px-3 py-1.5 text-[12px] rounded bg-light-border dark:bg-dark-border text-light-text-primary dark:text-dark-text-primary hover:bg-light-border-strong dark:hover:bg-dark-border-strong transition-colors"
          >
            Today
          </button>
          <div className="flex-1" />
          <span className="text-[12px] text-light-text-tertiary dark:text-dark-text-tertiary">{filteredTasks.length} tasks</span>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg border border-light-border dark:border-dark-border overflow-hidden">
            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase border-b border-light-border dark:border-dark-border">
              {weekDays.map((day) => (
                <div key={day} className="py-2 bg-light-bg-tertiary dark:bg-dark-bg-secondary">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDaysData.map((item, index) => {
                if (!item.isCurrentMonth) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[100px] bg-light-bg-hover/50 dark:bg-dark-bg-hover/50"
                    />
                  )
                }
                const isToday =
                  item.day === today.date() &&
                  calendarDate.month() === today.month() &&
                  calendarDate.year() === today.year()
                const dayTasks = getTasksForDay(item.day)
                return (
                  <div
                    key={item.day}
                    className={`min-h-[100px] p-2 border-b border-r border-light-border dark:border-dark-border ${isToday
                        ? "bg-accent-primary/10"
                        : "hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                      }`}
                  >
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium mb-1 ${isToday ? "bg-accent-primary text-white" : "text-light-text-tertiary dark:text-dark-text-tertiary"
                        }`}
                    >
                      {item.day}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <motion.div
                          key={task._id}
                          initial={{ opacity: 0, y: -3 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => openEditModal(task)}
                          className={`text-[10px] p-1 rounded truncate cursor-pointer ${task.priority === "urgent" || task.priority === "high"
                              ? "bg-[#C44A4A22] text-[#C44A4A]"
                              : task.priority === "medium"
                                ? "bg-[#D4A54822] text-[#D4A548]"
                                : "bg-[#6888A022] text-[#6888A0]"
                            }`}
                        >
                          {task.title}
                        </motion.div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-[9px] text-light-text-tertiary dark:text-dark-text-tertiary pl-1">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderView = () => {
    if (!canViewBoard) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            <FiLock className="w-12 h-12 mx-auto mb-4 text-light-text-tertiary dark:text-dark-text-tertiary opacity-50" />
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              Board Access Restricted
            </h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              You are not a member of this project. Contact your project admin for access.
            </p>
          </div>
        </div>
      )
    }

    if (activeTab === "list") {
      return renderListView()
    }
    if (activeTab === "timeline") {
      return renderTimelineView()
    }
    if (activeTab === "calendar") {
      return renderCalendarView()
    }

    return (
      <div className="flex-1 overflow-x-auto p-5">
        <div className="flex gap-[14px] min-w-max">
          {Object.entries(filteredColumns).map(([status, column]) => (
            <div
              key={status}
              className={`w-[270px] flex-shrink-0 flex flex-col gap-2 transition-all duration-200 ${dragOverColumn === status
                  ? "outline-2 outline outline-accent-primary outline-offset-[-2px]"
                  : ""
                }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center gap-2 px-1 py-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
                <span className="text-[13px] font-bold text-light-text-primary dark:text-dark-text-primary flex-1">
                  {column.title}
                </span>
                <span className="w-[18px] h-[18px] flex items-center justify-center rounded bg-light-border dark:bg-dark-border text-[10px] font-bold text-light-text-tertiary dark:text-dark-text-tertiary">
                  {column.tasks.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                {column.tasks.map((task) => renderTaskCard(task))}
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-1.75 rounded border border-dashed border-light-border dark:border-dark-border text-light-text-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:text-light-text-primary dark:hover:text-dark-text-primary transition-all w-full"
                >
                  <FiPlus className="w-3 h-3" />
                  Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-light-bg-primary dark:bg-dark-bg-primary">
        <h2 className="text-2xl font-bold text-accent-danger dark:text-accent-danger-light mb-2">
          Error Loading Project
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-md">{error}</p>
      </div>
    )
  }

  const renderTaskCard = (task) => {
    const completedSubtasks = task.completedSubtasks || 0
    const totalSubtasks = task.totalSubtasks || 0
    const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
    const isCompleted = task.status === "completed"

    // Status color configuration
    const statusConfig = {
      todo: { color: "#8B8178", bg: "bg-[#8B817822]", text: "text-[#8B8178]", label: "To Do" },
      "in-progress": {
        color: "#C4654A",
        bg: "bg-[#C4654A22]",
        text: "text-[#C4654A]",
        label: "In Progress",
      },
      "under-review": {
        color: "#D4A548",
        bg: "bg-[#D4A54822]",
        text: "text-[#D4A548]",
        label: "Review",
      },
      completed: { color: "#7A9A6D", bg: "bg-[#7A9A6D22]", text: "text-[#7A9A6D]", label: "Done" },
    }
    const currentStatus = statusConfig[task.status] || statusConfig.todo

    // Priority color configuration
    const priorityConfig = {
      urgent: { bg: "bg-[#C44A4A22]", text: "text-[#C44A4A]" },
      high: { bg: "bg-[#D45A5A22]", text: "text-[#D45A5A]" },
      medium: { bg: "bg-[#D4A54822]", text: "text-[#D4A548]" },
      low: { bg: "bg-[#6888A022]", text: "text-[#6888A0]" },
    }
    const currentPriority = priorityConfig[task.priority?.toLowerCase()] || priorityConfig.medium

    // Get assignee avatar
    const getAssigneeAvatar = (assignedTo) => {
      if (!assignedTo || assignedTo.length === 0) return null
      const assignee = assignedTo[0]
      if (typeof assignee === "object" && assignee.user?.avatar?.url) {
        return assignee.user.avatar.url
      }
      if (typeof assignee === "object" && assignee.avatar?.url) {
        return assignee.avatar.url
      }
      return null
    }

    const getAssigneeInitials = (assignedTo) => {
      if (!assignedTo || assignedTo.length === 0) return "?"
      const assignee = assignedTo[0]
      const name =
        typeof assignee === "object"
          ? assignee.user?.fullname || assignee.fullname || "User"
          : "User"
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }

    const assigneeAvatar = getAssigneeAvatar(task.assignedTo)
    const assigneeInitials = getAssigneeInitials(task.assignedTo)
    const assigneeCount = task.assignedTo?.length || 0

    // Avatar component with error handling
    const Avatar = ({ src, alt, size = "w-5 h-5", textSize = "text-[8px]" }) => {
      const [hasError, setHasError] = useState(false)

      if (!src || hasError) {
        return (
          <div
            className={`${size} rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-tertiary bg-gradient-to-br from-accent-primary to-accent-info flex items-center justify-center font-bold text-white ${textSize}`}
          >
            {alt}
          </div>
        )
      }

      return (
        <img
          src={src}
          alt={alt}
          className={`${size} rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-tertiary object-cover`}
          onError={() => setHasError(true)}
        />
      )
    }

    return (
      <motion.div
        key={task._id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => openEditModal(task)}
        className="group bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-xl p-3.5 cursor-pointer hover:border-accent-primary/50 dark:hover:border-accent-primary-light/50 hover:shadow-md dark:hover:shadow-dark-md hover:-translate-y-0.5 transition-all duration-200"
        style={
          isCompleted
            ? { borderLeft: "4px solid #7A9A6D" }
            : { borderLeft: `4px solid ${currentStatus.color}` }
        }
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={handleDragEnd}
      >
        {/* Header: Title + Priority */}
        <div className="flex justify-between items-start gap-2 mb-2.5">
          <h4 className="text-[13px] font-semibold text-light-text-primary dark:text-dark-text-primary line-clamp-2 leading-snug flex-1">
            {task.title}
          </h4>
          {!isCompleted && (
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${currentPriority.bg} ${currentPriority.text} uppercase tracking-wide flex-shrink-0`}
            >
              {task.priority || "Medium"}
            </span>
          )}
          {isCompleted && task.completedAt && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#7A9A6D22] text-[#7A9A6D] flex items-center gap-1 flex-shrink-0">
              <FiCheckCircle className="w-3 h-3" />
              Done
            </span>
          )}
        </div>

        {/* Task Description */}
        {task.description && (
          <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Subtask Progress */}
        {totalSubtasks > 0 && !isCompleted && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide">
                Progress
              </span>
              <span className="text-[10px] font-bold text-light-text-primary dark:text-dark-text-primary">
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-light-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor:
                    progress > 60 ? "#7A9A6D" : progress > 30 ? "#C4654A" : "#8B8178",
                }}
              />
            </div>
          </div>
        )}

        {/* Footer: Due Date + Assignees + Comments */}
        <div className="flex items-center justify-between pt-3 border-t border-light-border dark:border-dark-border mt-1">
          <div className="flex items-center gap-1">
            {task.dueDate && (
              <span
                className={`flex items-center gap-1 text-[10px] font-medium ${dayjs(task.dueDate).isBefore(dayjs()) && !isCompleted ? "text-accent-danger" : "text-light-text-tertiary dark:text-dark-text-tertiary"}`}
              >
                <FiClock className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Comments Count */}
            {(task.comments?.length || 0) > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
                <FiAlertCircle className="w-3 h-3" />
                {task.comments.length}
              </span>
            )}

            {/* Subtask Count */}
            {totalSubtasks > 0 && !isCompleted && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
                <FiCheckCircle className="w-3 h-3" />
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}

            {/* Assignee Avatar(s) */}
            <div className="flex items-center">
              {assigneeCount > 0 ? (
                <div className="flex -space-x-1.5">
                  <Avatar
                    src={assigneeAvatar}
                    alt={assigneeInitials}
                    size="w-5 h-5"
                    textSize="text-[8px]"
                  />
                  {assigneeCount > 1 && (
                    <div className="w-5 h-5 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-tertiary bg-light-bg-hover dark:bg-dark-bg-hover flex items-center justify-center text-[7px] font-bold text-light-text-tertiary dark:text-dark-text-tertiary">
                      +{assigneeCount - 1}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center">
                  <FiUser className="w-3 h-3 text-light-text-tertiary dark:text-dark-text-tertiary" />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderActivity = () => {
    const recentTasks = [...allTasks]
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 5)

    return (
      <div className="flex-1 max-w-[340px] border-r border-light-border dark:border-dark-border pr-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-light-text-primary dark:text-dark-text-primary">
            Recent Activity
          </h3>
          <span className="text-[12px] text-accent-primary dark:text-accent-primary-light cursor-pointer font-medium">
            View All
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {recentTasks.length === 0 ? (
            <p className="text-[12px] text-light-text-tertiary dark:text-dark-text-tertiary">No recent activity</p>
          ) : (
            recentTasks.map((task) => {
              const member = members.find((m) => m.user?._id === task.createdBy)
              const initials = member?.user?.fullname?.slice(0, 2).toUpperCase() || "U"
              const colorClass =
                task.status === "completed"
                  ? "from-accent-success to-accent-success-light"
                  : task.status === "in-progress"
                    ? "from-accent-primary to-accent-primary-light"
                    : task.status === "under-review"
                      ? "from-accent-warning to-accent-warning-light"
                      : "from-accent-info to-accent-info-light"

              return (
                <div key={task._id} className="flex gap-2.5 items-start">
                  <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-[11px] text-white font-bold flex-shrink-0`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                      {task.status === "completed" ? "Completed" : "Updated"} task{" "}
                      <span className="text-accent-primary dark:text-accent-primary-light">
                        {task.title}
                      </span>
                    </p>
                    <p className="text-[11px] text-light-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                      {dayjs(task.updatedAt).fromNow()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  const renderTeam = () => {
    const memberStats = members
      .map((member) => {
        const userTasks = allTasks.filter((t) =>
          t.assignedTo?.some(
            (a) => (typeof a === "object" ? a._id : a) === (member.user?._id || member.user)
          )
        )
        return {
          ...member,
          taskCount: userTasks.length,
          completedCount: userTasks.filter((t) => t.status === "completed").length,
        }
      })
      .sort((a, b) => b.taskCount - a.taskCount)

    const colors = [
      "from-accent-primary to-accent-primary-light",
      "from-accent-success to-accent-success-light",
      "from-accent-warning to-accent-warning-light",
      "from-accent-danger to-accent-danger-light",
      "from-accent-info to-accent-info-light",
    ]

    return (
      <div className="flex-1 max-w-sm border-r border-light-border dark:border-dark-border px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-light-text-primary dark:text-dark-text-primary">
            Team Performance
          </h3>
        </div>
        <div className="flex gap-4">
          {memberStats.length === 0 ? (
            <p className="text-[12px] text-light-text-tertiary dark:text-dark-text-tertiary">No team members</p>
          ) : (
            memberStats.slice(0, 5).map((member, idx) => (
              <div
                key={member.user?._id || idx}
                className="flex flex-col items-center gap-1.5 min-w-[70px]"
              >
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center text-[13px] text-white font-bold`}
                >
                  {member.user?.fullname?.slice(0, 2).toUpperCase() || "U"}
                </div>
                <span className="text-[11px] font-semibold text-light-text-secondary dark:text-dark-text-secondary text-center truncate max-w-16">
                  {member.user?.fullname?.split(" ")[0] || "User"}
                </span>
                <span className="text-[11px] text-light-text-tertiary dark:text-dark-text-tertiary">
                  {member.taskCount || 0} tasks
                </span>
                <div
                  className="w-14 h-0.5 rounded-full mt-0.5"
                  style={{
                    backgroundColor:
                      member.taskCount > 0
                        ? member.completedCount / member.taskCount > 0.5
                          ? "#7A9A6D"
                          : "#C4654A"
                        : "#8B8178",
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const renderTimeline = () => {
    const today = dayjs()
    const phases = []

    if (project?.startDate && project?.endDate) {
      const start = dayjs(project.startDate)
      const end = dayjs(project.endDate)
      const totalDuration = end.diff(start, "day")
      const elapsed = today.diff(start, "day")
      const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

      phases.push({
        label: "Project Duration",
        left: 0,
        width: 100,
        color: progress > 50 ? "#7A9A6D" : "#C4654A",
        text: `${Math.round(progress)}% complete`,
      })
    }

    const statusPhases = [
      { status: "todo", label: "To Do", color: "#8B8178" },
      { status: "in-progress", label: "In Progress", color: "#C4654A" },
      { status: "under-review", label: "Under Review", color: "#D4A548" },
      { status: "completed", label: "Completed", color: "#7A9A6D" },
    ]

    const statusData = statusPhases.map((phase) => ({
      ...phase,
      count: columns[phase.status]?.tasks?.length || 0,
    }))

    const totalTasksCount = statusData.reduce((sum, p) => sum + p.count, 0)
    const statusWithPercent = statusData.map((phase, idx) => {
      const percentage = totalTasksCount > 0 ? (phase.count / totalTasksCount) * 100 : 0
      const leftOffset = statusData
        .slice(0, idx)
        .reduce((sum, p) => sum + ((p.count / totalTasksCount) * 100 || 0), 0)
      return {
        ...phase,
        left: totalTasksCount > 0 ? leftOffset : idx * 25,
        width: totalTasksCount > 0 ? percentage : 25,
        text: phase.count > 0 ? `${phase.count} tasks` : "",
      }
    })

    return (
      <div className="flex-1.5 pl-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-light-text-primary dark:text-dark-text-primary">
            Project Timeline
          </h3>
          <div className="flex gap-1">
            <button
              type="button"
              className="px-2.5 py-1 text-[11px] rounded border border-light-border dark:border-dark-border text-light-text-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
            >
              Week
            </button>
            <button
              type="button"
              className="px-2.5 py-1 text-[11px] rounded bg-light-border dark:bg-dark-border text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
            >
              Month
            </button>
            <button
              type="button"
              className="px-2.5 py-1 text-[11px] rounded border border-light-border dark:border-dark-border text-light-text-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
            >
              Quarter
            </button>
          </div>
        </div>
        <div className="flex gap-0 mb-1.5 text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary">
          <div className="flex-1 text-center">{today.subtract(1, "month").format("MMM YYYY")}</div>
          <div className="flex-1 text-center">{today.format("MMM YYYY")}</div>
          <div className="flex-1 text-center">{today.add(1, "month").format("MMM YYYY")}</div>
          <div className="flex-1 text-center">{today.add(2, "month").format("MMM YYYY")}</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {statusWithPercent.map((phase) => (
            <div key={phase.label} className="flex items-center gap-2.5">
              <span className="text-[11px] text-light-text-tertiary dark:text-dark-text-tertiary w-20 flex-shrink-0">
                {phase.label}
              </span>
              <div className="flex-1 h-2.5 bg-light-bg-hover dark:bg-dark-bg-hover rounded relative overflow-visible">
                {phase.width > 0 && (
                  <div
                    className="absolute h-2.5 rounded flex items-center justify-end pr-1 transition-all"
                    style={{
                      left: `${phase.left}%`,
                      width: `${phase.width}%`,
                      backgroundColor: phase.color,
                    }}
                  >
                    <span className="text-[9px] font-semibold text-white/80 whitespace-nowrap">
                      {phase.text}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col bg-light-bg-primary dark:bg-dark-bg-primary"
    >
      <header className="flex items-center justify-between px-5 h-[52px] flex-shrink-0 bg-light-bg-secondary dark:bg-dark-bg-tertiary border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2 flex-1">
          {loading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <>
              <h1 className="text-[15px] font-bold text-light-text-primary dark:text-dark-text-primary">
                {project?.name}
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-success text-white">
                Active
              </span>
              <button
                type="button"
                onClick={() => setIsStarred(!isStarred)}
                className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary bg-none border-none cursor-pointer text-2xl leading-none"
              >
                {isStarred ? "★" : "☆"}
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((m, idx) => (
                <div
                  key={m.user?._id || idx}
                  className="w-6 h-6 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-tertiary bg-gradient-to-br from-accent-primary to-accent-info flex items-center justify-center text-[10px] text-white font-bold"
                >
                  {m.user?.fullname?.slice(0, 2).toUpperCase() || "U"}
                </div>
              ))}
              {members.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-tertiary bg-light-border dark:bg-dark-border flex items-center justify-center text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary">
                  +{members.length - 3}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold bg-accent-primary text-white hover:bg-accent-primary-dark transition-all border-none cursor-pointer"
          >
            ＋ Add Task
          </button>
          <button
            type="button"
            onClick={() => setIsMembersModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all cursor-pointer"
          >
            <FiUsers className="w-4 h-4" />
            Members
          </button>
        </div>
      </header>

      <div className="flex items-center gap-0.5 px-5 bg-light-bg-secondary dark:bg-dark-bg-tertiary border-b border-light-border dark:border-dark-border h-10 flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("board")}
          className={`px-3 h-full text-[12px] font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "board"
              ? "border-accent-primary text-light-text-primary dark:text-dark-text-primary"
              : "border-transparent text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"
            }`}
        >
          <FiCircle className="w-4 h-4" />
          Board
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`px-3 h-full text-[12px] font-medium border-b-2 transition-colors ${activeTab === "list"
              ? "border-accent-primary text-light-text-primary dark:text-dark-text-primary"
              : "border-transparent text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"
            }`}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          className={`px-3 h-full text-[12px] font-medium border-b-2 transition-colors ${activeTab === "timeline"
              ? "border-accent-primary text-light-text-primary dark:text-dark-text-primary"
              : "border-transparent text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"
            }`}
        >
          Timeline
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          className={`px-3 h-full text-[12px] font-medium border-b-2 transition-colors ${activeTab === "calendar"
              ? "border-accent-primary text-light-text-primary dark:text-dark-text-primary"
              : "border-transparent text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary"
            }`}
        >
          Calendar
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 h-8 w-[180px] text-[12px] bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border dark:border-dark-border rounded text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary focus:border-accent-primary dark:focus:border-accent-primary-light focus:outline-none focus:ring-1 focus:ring-accent-primary/30 dark:focus:ring-accent-primary-light/30"
            />
          </div>
          <button
            type="button"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 h-8 text-[12px] font-medium rounded border transition-all appearance-none ${statusFilter || priorityFilter || assigneeFilter || dateFilter
                ? "bg-accent-primary text-white border-accent-primary hover:bg-accent-primary-dark shadow-sm"
                : "bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:border-accent-primary/50"
              }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </button>

          {/* Status Filter */}
          <Listbox value={statusFilter} onChange={setStatusFilter}>
            <div className="relative min-w-[140px]">
              <ListboxButton className="input-field w-full text-left flex items-center justify-between h-8 px-3 text-[12px] font-medium">
                <span className="truncate capitalize">
                  {statusFilter ? statusFilter.replace("-", " ") : "All Status"}
                </span>
                <FiChevronDown className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0" />
              </ListboxButton>
              <ListboxOptions className="absolute z-[100] mt-1 w-full bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto py-1">
                <ListboxOption
                  value=""
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      All Status
                    </span>
                  )}
                </ListboxOption>
                <ListboxOption
                  value="todo"
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      To Do
                    </span>
                  )}
                </ListboxOption>
                <ListboxOption
                  value="in-progress"
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      In Progress
                    </span>
                  )}
                </ListboxOption>
                <ListboxOption
                  value="under-review"
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      Under Review
                    </span>
                  )}
                </ListboxOption>
                <ListboxOption
                  value="completed"
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      Completed
                    </span>
                  )}
                </ListboxOption>
              </ListboxOptions>
            </div>
          </Listbox>

          {/* Priority Filter */}
          <Listbox value={priorityFilter} onChange={setPriorityFilter}>
            <div className="relative min-w-[130px]">
              <ListboxButton className="input-field w-full text-left flex items-center justify-between h-8 px-3 text-[12px] font-medium">
                <span className="truncate capitalize">{priorityFilter || "All Priority"}</span>
                <FiChevronDown className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0" />
              </ListboxButton>
              <ListboxOptions className="absolute z-[100] mt-1 w-full bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto py-1">
                <ListboxOption
                  value=""
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      All Priority
                    </span>
                  )}
                </ListboxOption>
                {["low", "medium", "high", "urgent"].map((priority) => (
                  <ListboxOption
                    key={priority}
                    value={priority}
                    className={({ active }) =>
                      `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                    }
                  >
                    {({ selected }) => (
                      <span
                        className={`block truncate capitalize ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                      >
                        {priority}
                      </span>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>

          {/* Assignee Filter */}
          <Listbox value={assigneeFilter} onChange={setAssigneeFilter}>
            <div className="relative min-w-[160px]">
              <ListboxButton className="input-field w-full text-left flex items-center justify-between h-8 px-3 text-[12px] font-medium">
                <span className="truncate">{assigneeFilter || "All Assignees"}</span>
                <FiChevronDown className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0" />
              </ListboxButton>
              <ListboxOptions className="absolute z-[100] mt-1 w-full bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto py-1">
                <ListboxOption
                  value=""
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      All Assignees
                    </span>
                  )}
                </ListboxOption>
                {members.map((m) => (
                  <ListboxOption
                    key={m.user?._id}
                    value={m.user?.fullname || ""}
                    className={({ active }) =>
                      `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                    }
                  >
                    {({ selected }) => (
                      <span
                        className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                      >
                        {m.user?.fullname}
                      </span>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>

          {/* Date Filter */}
          <Listbox value={dateFilter} onChange={setDateFilter}>
            <div className="relative min-w-[140px]">
              <ListboxButton className="input-field w-full text-left flex items-center justify-between h-8 px-3 text-[12px] font-medium">
                <span className="truncate">
                  {dateFilter ? dateFilter.replace("due-", "Due ").replace("_", " ") : "Any Date"}
                </span>
                <FiChevronDown className="w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0" />
              </ListboxButton>
              <ListboxOptions className="absolute z-[100] mt-1 w-full bg-light-bg-primary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto py-1">
                <ListboxOption
                  value=""
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      Any Date
                    </span>
                  )}
                </ListboxOption>
                <ListboxOption
                  value="overdue"
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      Overdue
                    </span>
                  )}
                </ListboxOption>
                <ListboxOption
                  value="today"
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      Due Today
                    </span>
                  )}
                </ListboxOption>
                <ListboxOption
                  value="week"
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      Due This Week
                    </span>
                  )}
                </ListboxOption>
                <ListboxOption
                  value="month"
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 px-3 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                  }
                >
                  {({ selected }) => (
                    <span
                      className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
                    >
                      Due This Month
                    </span>
                  )}
                </ListboxOption>
              </ListboxOptions>
            </div>
          </Listbox>

          {(searchQuery || statusFilter || priorityFilter || assigneeFilter || dateFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("")
                setPriorityFilter("")
                setAssigneeFilter("")
                setDateFilter("")
              }}
              className="text-[12px] font-medium text-accent-primary dark:text-accent-primary-light hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-hidden flex flex-col min-h-0">
        {loading ? (
          <div className="flex-1 flex gap-[14px] p-5 overflow-x-auto">
            {["todo", "in-progress", "under-review", "completed"].map((col) => (
              <div
                key={col}
                className="w-[270px] flex-shrink-0 bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className="w-2 h-2 rounded-full bg-light-text-tertiary dark:bg-dark-text-tertiary" />
                  <span className="text-[13px] font-bold text-light-text-primary dark:text-dark-text-primary flex-1">
                    {col === "in-progress"
                      ? "In Progress"
                      : col === "under-review"
                        ? "Under Review"
                        : col === "completed"
                          ? "Completed"
                          : "To Do"}
                  </span>
                  <div className="w-5 h-5 flex items-center justify-center rounded bg-light-border dark:bg-dark-border text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary">
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
        ) : (
          renderView()
        )}
      </main>

      <footer className="flex-shrink-0 border-t border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary">
        <div className="flex items-center gap-3 px-5 py-2 text-[11px] border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8B8178]" />
            <span className="text-light-text-tertiary dark:text-dark-text-tertiary">To Do:&nbsp;</span>
            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
              {counts.todo}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C4654A]" />
            <span className="text-light-text-tertiary dark:text-dark-text-tertiary">In Progress:&nbsp;</span>
            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
              {counts.inProgress}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D4A548]" />
            <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Under Review:&nbsp;</span>
            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
              {counts.underReview}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#7A9A6D]" />
            <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Completed:&nbsp;</span>
            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
              {counts.completed}
            </span>
          </div>
          <div className="flex-1" />
          <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Progress: {completedPercent}%</span>
          <div className="w-28 h-1 bg-light-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-primary rounded-full transition-all"
              style={{ width: `${completedPercent}%` }}
            />
          </div>
        </div>
        <div className="flex gap-4 p-5 overflow-x-auto">
          {renderActivity()}
          {renderTeam()}
          {renderTimeline()}
        </div>
      </footer>

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
    </motion.div>
  )
}

export default ProjectPage
