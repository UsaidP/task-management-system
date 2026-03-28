import dayjs from "dayjs"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { FiCalendar, FiChevronLeft, FiChevronRight, FiFilter, FiZoomIn } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

const TimelineView = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState("month") // day, week, month
  const [selectedTask, setSelectedTask] = useState(null)
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [groupBy, setGroupBy] = useState("project") // project, sprint

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

  const getDatesForZoom = () => {
    const startOfMonth = currentDate.startOf("month")
    const endOfMonth = currentDate.endOf("month")
    const dates = []
    let current = startOfMonth
    while (current.isBefore(endOfMonth) || current.isSame(endOfMonth, "day")) {
      dates.push(current)
      current = current.add(1, "day")
    }
    return dates
  }

  const dates = getDatesForZoom()

  const getTaskPosition = (task) => {
    if (!task.dueDate && !task.startDate) return null

    const start = task.startDate ? dayjs(task.startDate) : dayjs(task.dueDate).subtract(3, "day")
    const end = task.dueDate ? dayjs(task.dueDate) : start.add(3, "day")

    const monthStart = currentDate.startOf("month")
    const monthEnd = currentDate.startOf("month").endOf("month")

    const daysInMonth = monthEnd.date()

    const startOffset = start.diff(monthStart, "day")
    const duration = end.diff(start, "day")

    if (end.isBefore(monthStart) || start.isAfter(monthEnd)) return null

    const clampedStart = Math.max(0, startOffset)
    const clampedDuration = Math.min(duration, daysInMonth - clampedStart)

    return {
      left: (clampedStart / daysInMonth) * 100,
      width: (clampedDuration / daysInMonth) * 100,
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      todo: "bg-slate-400",
      "in-progress": "bg-blue-500",
      "under-review": "bg-amber-500",
      completed: "bg-emerald-500",
    }
    return colors[status] || colors.todo
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: "border-l-blue-500",
      medium: "border-l-amber-500",
      high: "border-l-orange-500",
      urgent: "border-l-red-500",
    }
    return colors[priority] || colors.medium
  }

  const groupedTasks = useMemo(() => {
    const groups = {}
    tasks.forEach((task) => {
      const projectName =
        typeof task.project === "object" ? task.project?.name || "Personal" : "Personal"
      if (!groups[projectName]) groups[projectName] = []
      groups[projectName].push(task)
    })
    return groups
  }, [tasks])

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
    <div className="h-full flex flex-col" style={{ boxShadow: "0px 0px 1px 0.1px #000000" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-tertiary">
        <div>
          <h1 className="text-2xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary">
            Timeline
          </h1>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Visualize your project schedule
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-1">
            <button
              onClick={() => setZoom("day")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${zoom === "day" ? "bg-accent-primary text-white" : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover"}`}
            >
              Day
            </button>
            <button
              onClick={() => setZoom("week")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${zoom === "week" ? "bg-accent-primary text-white" : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover"}`}
            >
              Week
            </button>
            <button
              onClick={() => setZoom("month")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${zoom === "month" ? "bg-accent-primary text-white" : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover"}`}
            >
              Month
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
              className="p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
            >
              <FiChevronLeft className="w-5 h-5 text-light-text-secondary" />
            </button>
            <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary min-w-[120px] text-center">
              {currentDate.format("MMMM YYYY")}
            </span>
            <button
              onClick={() => setCurrentDate(currentDate.add(1, "month"))}
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
        <div className="sticky top-0 bg-light-bg-primary dark:bg-dark-bg-tertiary border-b border-light-border dark:border-dark-border z-10">
          <div className="flex">
            <div className="w-48 flex-shrink-0 p-3 border-r border-light-border dark:border-dark-border text-sm font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
              Project
            </div>
            <div className="flex-1 flex">
              {dates.map((date, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-[40px] p-2 border-r border-light-border dark:border-dark-border text-center"
                >
                  <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    {date.format("DD")}
                  </div>
                  <div className="text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary uppercase">
                    {date.format("ddd")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Rows */}
        <div className="divide-y divide-light-border dark:divide-dark-border">
          {Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
            <div key={projectName} className="flex">
              <div className="w-48 flex-shrink-0 p-4 border-r border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary">
                <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {projectName}
                </h3>
                <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                  {projectTasks.length} tasks
                </p>
              </div>
              <div className="flex-1 relative min-h-[80px]">
                {/* Today Line */}
                {dates.some((d) => d.isSame(dayjs(), "day")) && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-accent-primary z-20"
                    style={{
                      left: `${(dayjs().diff(currentDate.startOf("month"), "day") / dates.length) * 100}%`,
                    }}
                  />
                )}

                {/* Task Bars */}
                {projectTasks.map((task, idx) => {
                  const position = getTaskPosition(task)
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
                        width: `${Math.max(position.width, 5)}%`,
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
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
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
