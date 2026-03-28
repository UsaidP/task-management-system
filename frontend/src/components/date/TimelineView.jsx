import dayjs from "dayjs"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import { useFilter } from "../context/FilterContext.jsx"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

const getStatusColor = (status) => {
  const colors = {
    todo: "bg-task-status-todo",
    "in-progress": "bg-task-status-progress",
    "under-review": "bg-task-status-review",
    completed: "bg-task-status-done",
  }
  return colors[status] || colors.todo
}

const getPriorityColor = (priority) => {
  const colors = {
    low: "border-l-task-priority-low",
    medium: "border-l-task-priority-medium",
    high: "border-l-task-priority-high",
    urgent: "border-l-task-priority-urgent",
  }
  return colors[priority] || colors.medium
}

const getDateColumns = (zoom, currentDate) => {
  if (zoom === "day") {
    const start = currentDate.startOf("day")
    return Array.from({ length: 14 }, (_, i) => {
      const d = start.add(i, "day")
      return {
        label: d.format("DD"),
        sublabel: d.format("ddd"),
        start: d.startOf("day"),
        end: d.endOf("day"),
      }
    })
  }

  if (zoom === "week") {
    const start = currentDate.startOf("week")
    return Array.from({ length: 12 }, (_, i) => {
      const s = start.add(i * 7, "day")
      return {
        label: `W${s.week()}`,
        sublabel: s.format("MMM D"),
        start: s.startOf("day"),
        end: s.add(6, "day").endOf("day"),
      }
    })
  }

  // month (default)
  const startOfMonth = currentDate.startOf("month")
  const daysInMonth = currentDate.daysInMonth()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = startOfMonth.add(i, "day")
    return {
      label: d.format("DD"),
      sublabel: d.format("ddd"),
      start: d.startOf("day"),
      end: d.endOf("day"),
    }
  })
}

const getTaskPosition = (task, columns) => {
  if (!task.dueDate && !task.startDate) return null

  const start = task.startDate ? dayjs(task.startDate) : dayjs(task.dueDate).subtract(3, "day")
  const end = task.dueDate ? dayjs(task.dueDate) : start.add(3, "day")

  const firstCol = columns[0].start
  const lastCol = columns[columns.length - 1].end

  if (end.isBefore(firstCol) || start.isAfter(lastCol)) return null

  const totalSpan = lastCol.diff(firstCol, "day") + 1
  const startOffset = Math.max(0, start.diff(firstCol, "day"))
  const duration = Math.max(1, end.diff(start, "day") + 1)

  return {
    left: (startOffset / totalSpan) * 100,
    width: Math.max((duration / totalSpan) * 100, 5),
  }
}

const TimelineView = () => {
  const { user } = useAuth()
  const { projectFilter, sprintFilter } = useFilter()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState("month")
  const [selectedTask, setSelectedTask] = useState(null)
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [groupBy, setGroupBy] = useState("project")

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

  const columns = useMemo(() => getDateColumns(zoom, currentDate), [zoom, currentDate])

  const navigateDate = (direction) => {
    if (zoom === "day") {
      setCurrentDate((prev) => prev.add(direction * 14, "day"))
    } else if (zoom === "week") {
      setCurrentDate((prev) => prev.add(direction * 12, "week"))
    } else {
      setCurrentDate((prev) => prev.add(direction, "month"))
    }
  }

  const getDateLabel = () => {
    if (zoom === "day") {
      const end = currentDate.add(13, "day")
      if (currentDate.month() === end.month()) {
        return `${currentDate.format("MMM D")} - ${end.format("D, YYYY")}`
      }
      return `${currentDate.format("MMM D")} - ${end.format("MMM D, YYYY")}`
    }
    if (zoom === "week") {
      const end = currentDate.startOf("week").add(11 * 7, "day")
      return `${currentDate.startOf("week").format("MMM D")} - ${end.format("MMM D, YYYY")}`
    }
    return currentDate.format("MMMM YYYY")
  }

  const todayColumnIndex = useMemo(() => {
    const today = dayjs()
    return columns.findIndex((col) => today.isAfter(col.start) && today.isBefore(col.end))
  }, [columns])

  const groupedTasks = useMemo(() => {
    const groups = {}
    filteredTasks.forEach((task) => {
      let key
      if (groupBy === "sprint") {
        key = task.sprint?.name || task.sprint || "Backlog"
      } else {
        key = typeof task.project === "object" ? task.project?.name || "Personal" : "Personal"
      }
      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    })
    return groups
  }, [filteredTasks, groupBy])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Loading timeline...
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
            Timeline
          </h1>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Visualize your project schedule
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Group By Toggle */}
          <div className="flex items-center gap-1 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-1">
            <button
              type="button"
              onClick={() => setGroupBy("project")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                groupBy === "project"
                  ? "bg-accent-primary text-white"
                  : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover"
              }`}
            >
              Project
            </button>
            <button
              type="button"
              onClick={() => setGroupBy("sprint")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                groupBy === "sprint"
                  ? "bg-accent-primary text-white"
                  : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover"
              }`}
            >
              Sprint
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-1">
            <button
              type="button"
              onClick={() => setZoom("day")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                zoom === "day"
                  ? "bg-accent-primary text-white"
                  : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover"
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setZoom("week")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                zoom === "week"
                  ? "bg-accent-primary text-white"
                  : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover"
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setZoom("month")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                zoom === "month"
                  ? "bg-accent-primary text-white"
                  : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover"
              }`}
            >
              Month
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigateDate(-1)}
              className="p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
            >
              <FiChevronLeft className="w-5 h-5 text-light-text-secondary" />
            </button>
            <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary min-w-[180px] text-center">
              {getDateLabel()}
            </span>
            <button
              type="button"
              onClick={() => navigateDate(1)}
              className="p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
            >
              <FiChevronRight className="w-5 h-5 text-light-text-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {/* Date Header */}
        <div className="sticky top-0 bg-light-bg-primary dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border z-10">
          <div className="flex">
            <div className="w-48 flex-shrink-0 p-3 border-r border-light-border dark:border-dark-border text-sm font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
              {groupBy === "sprint" ? "Sprint" : "Project"}
            </div>
            <div className="flex-1 flex">
              {columns.map((col, i) => (
                <div
                  key={i}
                  className={`flex-1 min-w-[40px] p-2 border-r border-light-border dark:border-dark-border text-center ${
                    todayColumnIndex === i ? "bg-accent-primary/10 dark:bg-accent-primary/15" : ""
                  }`}
                >
                  <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    {col.label}
                  </div>
                  <div className="text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary uppercase">
                    {col.sublabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Group Rows */}
        <div className="divide-y divide-light-border dark:divide-dark-border">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
            <div key={groupName} className="flex">
              <div className="w-48 flex-shrink-0 p-4 border-r border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary">
                <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {groupName}
                </h3>
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                  {groupTasks.length} tasks
                </p>
              </div>
              <div className="flex-1 relative min-h-[80px]">
                {/* Today Line */}
                {todayColumnIndex >= 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-accent-primary z-20"
                    style={{
                      left: `${((todayColumnIndex + 0.5) / columns.length) * 100}%`,
                    }}
                  />
                )}

                {/* Task Bars */}
                {groupTasks.map((task, idx) => {
                  const position = getTaskPosition(task, columns)
                  if (!position) return null

                  return (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedTask(task)}
                      className={`absolute top-2 bottom-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity border-l-4 ${getStatusColor(task.status)} ${getPriorityColor(task.priority)} bg-opacity-20`}
                      style={{
                        left: `${position.left}%`,
                        width: `${position.width}%`,
                      }}
                    >
                      <div className="p-2 overflow-hidden">
                        <p className="text-xs font-medium text-white truncate">{task.title}</p>
                        {position.width > 15 && (
                          <p className="text-[10px] text-white/70 truncate">
                            {task.dueDate ? dayjs(task.dueDate).format("MMM DD") : ""}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center">
              <FiCalendar className="w-16 h-16 mx-auto mb-4 text-light-text-tertiary opacity-30" />
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                No tasks yet
              </h3>
              <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                Create tasks with due dates to see them on the timeline
              </p>
            </div>
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

export default TimelineView
