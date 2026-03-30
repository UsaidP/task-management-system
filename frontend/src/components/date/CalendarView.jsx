import dayjs from "dayjs"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import { useFilter } from "../context/FilterContext.jsx"
import CreateTaskModal from "../task/CreateTaskModal"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

const priorityStyles = {
  urgent: "bg-task-priority-urgent/20 text-task-priority-urgent",
  high: "bg-task-priority-high/20 text-task-priority-high",
  medium: "bg-task-priority-medium/20 text-task-priority-medium",
  low: "bg-task-priority-low/20 text-task-priority-low",
}

const statusBorder = {
  todo: "border-l-4 border-l-task-status-todo",
  "in-progress": "border-l-4 border-l-task-status-progress",
  "under-review": "border-l-4 border-l-task-status-review",
  completed: "border-l-4 border-l-task-status-done",
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const CalendarView = () => {
  const { user } = useAuth()
  const { projectFilter, sprintFilter } = useFilter()
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [tasks, setTasks] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState("month")
  const [hoveredDay, setHoveredDay] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const today = dayjs()

  const fetchData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const tasksRes = await apiService.getAllTaskOfUser()
      if (tasksRes.success) {
        setTasks(tasksRes.data || [])
      }
    } catch (err) {
      console.error("Failed to fetch calendar data", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

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

  const handleDayClick = (day) => {
    setSelectedDate(currentDate.date(day))
    setIsModalOpen(true)
  }

  const handleTaskClick = (e, task) => {
    e.stopPropagation()
    setSelectedTask(task)
  }

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask])
  }

  const getTasksForDay = (day) => {
    return filteredTasks.filter((task) => {
      const taskDate = dayjs(task.dueDate)
      return (
        taskDate.date() === day &&
        taskDate.month() === currentDate.month() &&
        taskDate.year() === currentDate.year()
      )
    })
  }

  const getProjectName = (task) => {
    if (task.project && typeof task.project === "object") return task.project.name || "Unknown"
    return "Unknown"
  }

  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.startOf("month")
    const startDay = startOfMonth.day()
    const daysInMonth = currentDate.daysInMonth()

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
  }, [currentDate])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 sm:p-6 shrink-0 max-w-[1400px] mx-auto w-full bg-light-bg-secondary dark:bg-dark-bg-secondary">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
            Calendar
          </h1>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            View and manage your tasks by date
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-light-border dark:border-dark-border overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-accent-primary text-white"
                  : "bg-light-bg-secondary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-accent-primary text-white"
                  : "bg-light-bg-secondary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
              }`}
            >
              Week
            </button>
          </div>
          {viewMode === "month" && (
            <>
              <button
                type="button"
                onClick={() => setCurrentDate(dayjs())}
                className="btn-secondary text-sm"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(currentDate.add(-1, "month"))}
                className="btn-ghost p-2"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary min-w-[180px] text-center">
                {currentDate.format("MMMM YYYY")}
              </span>
              <button
                type="button"
                onClick={() => setCurrentDate(currentDate.add(1, "month"))}
                className="btn-ghost p-2"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          {viewMode === "week" && (
            <>
              <button
                type="button"
                onClick={() => setCurrentDate(dayjs())}
                className="btn-secondary text-sm"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(currentDate.add(-1, "week"))}
                className="btn-ghost p-2"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary min-w-[250px] text-center">
                {currentDate.startOf("week").format("MMM D")} -{" "}
                {currentDate.endOf("week").format("MMM D, YYYY")}
              </span>
              <button
                type="button"
                onClick={() => setCurrentDate(currentDate.add(1, "week"))}
                className="btn-ghost p-2"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setSelectedDate(dayjs())
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="max-w-[1400px] mx-auto">
          {viewMode === "week" ? (
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide border-b border-light-border dark:border-dark-border">
                {weekDays.map((day) => (
                  <div key={day} className="py-3 bg-light-bg-hover dark:bg-dark-bg-hover">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const date = currentDate.startOf("week").add(dayIndex, "day")
                  const dayNum = date.date()
                  const isToday = date.isSame(today, "day")

                  const dayTasks = filteredTasks.filter((task) => {
                    const taskDate = dayjs(task.dueDate)
                    return taskDate.isSame(date, "day")
                  })

                  return (
                    <div
                      key={dayIndex}
                      onClick={() => {
                        setSelectedDate(date)
                        setIsModalOpen(true)
                      }}
                      className={`min-h-[300px] p-2 border-b border-r border-light-border dark:border-dark-border cursor-pointer transition-colors ${
                        isToday
                          ? "bg-accent-primary/10 dark:bg-accent-primary/20"
                          : "hover:bg-light-bg-hover/50 dark:hover:bg-dark-bg-hover/30"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mb-2 ${
                          isToday
                            ? "bg-accent-primary text-white"
                            : "text-light-text-primary dark:text-dark-text-primary"
                        }`}
                      >
                        {dayNum}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.map((task) => (
                          <motion.div
                            key={task._id}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={(e) => handleTaskClick(e, task)}
                            className={`text-xs p-2 rounded cursor-pointer transition-all hover:scale-[1.02] ${
                              priorityStyles[task.priority] ||
                              "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary"
                            } ${statusBorder[task.status] || ""}`}
                          >
                            <div className="font-semibold truncate">{task.title}</div>
                            <div className="text-[10px] mt-0.5 opacity-75">
                              {task.status?.replace("-", " ")} • {getProjectName(task)}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide border-b border-light-border dark:border-dark-border">
                {weekDays.map((day) => (
                  <div key={day} className="py-3 bg-light-bg-hover dark:bg-dark-bg-hover">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((item, index) => {
                  if (!item.isCurrentMonth) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-[120px] bg-light-bg-primary dark:bg-dark-bg-primary/30"
                      />
                    )
                  }

                  const isToday =
                    item.day === today.date() &&
                    currentDate.month() === today.month() &&
                    currentDate.year() === today.year()

                  const dayTasks = getTasksForDay(item.day)
                  const isHovered = hoveredDay === item.day

                  return (
                    <div
                      key={item.day}
                      onClick={() => handleDayClick(item.day)}
                      onMouseEnter={() => setHoveredDay(item.day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onMouseMove={handleMouseMove}
                      className={`min-h-[120px] p-2 border-b border-r border-light-border dark:border-dark-border cursor-pointer transition-colors ${
                        isToday
                          ? "bg-accent-primary/10 dark:bg-accent-primary/20"
                          : "hover:bg-light-bg-hover/50 dark:hover:bg-dark-bg-hover/30"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mb-2 ${
                          isToday
                            ? "bg-accent-primary text-white"
                            : "text-light-text-primary dark:text-dark-text-primary"
                        }`}
                      >
                        {item.day}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <motion.div
                            key={task._id}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={(e) => handleTaskClick(e, task)}
                            className={`text-xs p-1.5 rounded truncate cursor-pointer transition-all hover:scale-[1.02] ${
                              priorityStyles[task.priority] ||
                              "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary"
                            } ${statusBorder[task.status] || ""}`}
                          >
                            <div className="font-medium truncate">{task.title}</div>
                            {isHovered && (
                              <div className="text-[10px] mt-0.5 opacity-75">
                                {getProjectName(task)}
                              </div>
                            )}
                          </motion.div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary pl-1">
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Hover Tooltip */}
          <AnimatePresence>
            {hoveredDay && getTasksForDay(hoveredDay).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="fixed z-50 mt-2 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-lg border border-light-border dark:border-dark-border w-64"
                style={{
                  top: `${mousePos.y + 16}px`,
                  left: `${mousePos.x + 16}px`,
                }}
              >
                <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Tasks for {currentDate.date(hoveredDay).format("MMM D")}
                </h3>
                <div className="space-y-2">
                  {getTasksForDay(hoveredDay).map((task) => (
                    <div
                      key={task._id}
                      onClick={() => {
                        setSelectedTask(task)
                        setHoveredDay(null)
                      }}
                      className="p-2 bg-light-bg-hover dark:bg-dark-bg-hover rounded cursor-pointer hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            task.priority === "urgent"
                              ? "bg-task-priority-urgent"
                              : task.priority === "high"
                                ? "bg-task-priority-high"
                                : task.priority === "medium"
                                  ? "bg-task-priority-medium"
                                  : "bg-task-priority-low"
                          }`}
                        />
                        <span className="font-medium text-sm text-light-text-primary dark:text-dark-text-primary">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                        <span>{getProjectName(task)}</span>
                        <span className="capitalize">{task.status?.replace("-", " ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
            </div>
          )}

          {!isLoading && filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <FiChevronLeft className="hidden" />
              <div className="text-center">
                <FiChevronLeft className="hidden" />
                <p className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
                  No tasks found
                </p>
                <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                  Create a task to see it on the calendar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDate(null)
        }}
        onTaskCreated={handleTaskCreated}
        projectId={null}
        members={[]}
        selectedDate={selectedDate}
      />

      <TaskDetailPanel
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null)
          fetchData()
        }}
        task={selectedTask}
        members={[]}
        onTaskUpdated={fetchData}
      />
    </div>
  )
}

export default CalendarView
