import dayjs from "dayjs"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@animateicons/react/lucide"
import { CalendarIcon } from "lucide-react"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../../contexts/customHook.js"
import { useFilter } from "../../contexts/FilterContext.jsx"
import { Skeleton, SkeletonText } from "../Skeleton.jsx"
import CreateTaskModal from "../task/CreateTaskModal"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

const priorityStyles = {
  urgent: "bg-task-priority-urgent/20 text-task-priority-urgent",
  high: "bg-task-priority-high/20 text-task-priority-high",
  medium: "bg-task-priority-medium/20 text-task-priority-medium",
  low: "bg-task-priority-low/20 text-task-priority-low",
}

const statusBorderClasses = {
  todo: "border-l-4 border-l-task-status-todo",
  "in-progress": "border-l-4 border-l-task-status-progress",
  "under-review": "border-l-4 border-l-task-status-review",
  completed: "border-l-4 border-l-task-status-done",
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const CalendarSkeleton = () => (
  <div className="flex flex-col h-full">
    <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 sm:p-6 shrink-0 max-w-[1400px] mx-auto w-full bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border">
      <div>
        <SkeletonText width="w-32 sm:w-40" height="h-7 sm:h-8" className="mb-1" />
        <SkeletonText width="w-48 sm:w-64" height="h-4" />
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Skeleton className="w-40 h-9 rounded-lg" />
        <Skeleton className="w-20 h-9 rounded-lg" />
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="w-32 h-9 rounded-lg" />
        <Skeleton className="w-9 h-9 rounded-lg" />
      </div>
    </div>
    <div className="flex-1 p-4 sm:p-6 overflow-auto">
      <div className="grid grid-cols-7 gap-px mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center">
            <SkeletonText width="w-8" height="h-4" className="mx-auto" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-light-border dark:bg-dark-border rounded-xl overflow-hidden border border-light-border dark:border-dark-border">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-[100px] p-2 bg-light-bg-primary dark:bg-dark-bg-secondary">
            <SkeletonText width="w-6" height="h-3" className="mb-2" />
            <div className="space-y-1">
              <Skeleton className="w-full h-5 rounded" />
              {i % 3 === 0 && <Skeleton className="w-3/4 h-5 rounded" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

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

  const today = dayjs()

  const fetchData = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const tasksRes = await apiService.getAllTaskOfUser()
      if (tasksRes.success) {
        setTasks(tasksRes.data?.tasks || [])
      }
    } catch (err) {
      console.error("Failed to fetch calendar data", err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // ✅ Pre-compute tasks by day: O(N) instead of O(42×N)
  // Build a Map where key = "YYYY-MM-DD" and value = array of tasks
  const tasksByDay = useMemo(() => {
    const map = new Map()

    filteredTasks.forEach((task) => {
      if (!task.dueDate) return
      const dayKey = dayjs(task.dueDate).format("YYYY-MM-DD")
      if (!map.has(dayKey)) {
        map.set(dayKey, [])
      }
      map.get(dayKey).push(task)
    })

    return map
  }, [filteredTasks])

  // ✅ Pre-compute tasks by week day offset (for week view)
  const weekTasksByOffset = useMemo(() => {
    const map = new Map()
    const weekStart = currentDate.startOf("week")

    filteredTasks.forEach((task) => {
      if (!task.dueDate) return
      const taskDate = dayjs(task.dueDate)
      if (taskDate.isSame(weekStart, "week")) {
        const dayOffset = taskDate.diff(weekStart, "day")
        if (!map.has(dayOffset)) {
          map.set(dayOffset, [])
        }
        map.get(dayOffset).push(task)
      }
    })

    return map
  }, [filteredTasks, currentDate])

  // ✅ O(1) lookup instead of O(N) filter
  const getTasksForDay = (day) => {
    const dayKey = currentDate.date(day).format("YYYY-MM-DD")
    return tasksByDay.get(dayKey) || []
  }

  const getWeekTasks = (dayOffset) => {
    return weekTasksByOffset.get(dayOffset) || []
  }

  const handleDayClick = (day) => {
    setSelectedDate(currentDate.date(day))
    setIsModalOpen(true)
  }

  const handleTaskClick = (e, task) => {
    e.stopPropagation()
    setSelectedTask(task)
  }

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [...prev, newTask])
    // Invalidate the tasksByDay map by triggering a re-render
    // The useMemo will recalculate when filteredTasks changes
  }

  const getProjectName = (task) => {
    if (typeof task.project === "object") return task.project?.name || "Personal"
    return "Personal"
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
    <div className="flex flex-col h-full">
      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 sm:p-6 shrink-0 max-w-[1400px] mx-auto w-full bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border">
            <div>
              <h1 className="mb-1 font-serif text-2xl font-bold sm:text-3xl text-light-text-primary dark:text-dark-text-primary">
                Calendar
              </h1>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                View and manage your tasks by date
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary">
                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 ${
                    viewMode === "month"
                      ? "bg-accent-primary text-white shadow-sm"
                      : "text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                  }`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("week")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 ${
                    viewMode === "week"
                      ? "bg-accent-primary text-white shadow-sm"
                      : "text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                  }`}
                >
                  Week
                </button>
              </div>
              {/* Navigation — always rendered, behavior changes with viewMode */}
              <button
                type="button"
                onClick={() => setCurrentDate(dayjs())}
                className="btn-secondary text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(currentDate.add(-1, viewMode))}
                aria-label={`Previous ${viewMode}`}
                className="btn-ghost p-1.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              >
                <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
              </button>
              <span className="text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary min-w-[180px] sm:min-w-[220px] text-center">
                {viewMode === "month"
                  ? currentDate.format("MMMM YYYY")
                  : `${currentDate.startOf("week").format("MMM D")} – ${currentDate.endOf("week").format("MMM D, YYYY")}`}
              </span>
              <button
                type="button"
                onClick={() => setCurrentDate(currentDate.add(1, viewMode))}
                aria-label={`Next ${viewMode}`}
                className="btn-ghost p-1.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              >
                <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(dayjs())
                  setIsModalOpen(true)
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-accent-primary text-white text-sm sm:text-base font-medium hover:bg-accent-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              >
                <PlusIcon className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Add Task</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto sm:p-6 bg-light-bg-primary dark:bg-dark-bg-primary">
            <div className="max-w-[1400px] mx-auto">
              {viewMode === "week" ? (
                <div className="overflow-hidden overflow-x-auto border bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border-light-border dark:border-dark-border">
                  <div className="grid grid-cols-7 text-center text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide border-b border-light-border dark:border-dark-border min-w-[700px]">
                    {weekDays.map((day) => (
                      <div key={day} className="py-3 bg-light-bg-hover dark:bg-dark-bg-hover">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 min-w-[700px]">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const date = currentDate.startOf("week").add(dayIndex, "day")
                      const dayNum = date.date()
                      const isToday = date.isSame(today, "day")
                      const dayTasks = getWeekTasks(dayIndex)

                      return (
                        <div
                          key={dayIndex}
                          onClick={() => {
                            setSelectedDate(date)
                            setIsModalOpen(true)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              setSelectedDate(date)
                              setIsModalOpen(true)
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`View tasks for ${date.format("MMMM D, YYYY")}`}
                          className={`min-h-[200px] sm:min-h-[300px] p-2 border-b border-r border-light-border dark:border-dark-border cursor-pointer transition-colors last:border-r-0 ${
                            isToday
                              ? "bg-accent-primary/10 dark:bg-accent-primary/20"
                              : "hover:bg-light-bg-hover/50 dark:hover:bg-dark-bg-hover/30"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium mb-2 ${
                              isToday
                                ? "bg-accent-primary text-white"
                                : "text-light-text-primary dark:text-dark-text-primary"
                            }`}
                          >
                            {dayNum}
                          </div>
                          <div className="space-y-0.5 sm:space-y-1">
                            {dayTasks.map((task) => (
                              <motion.div
                                key={task._id}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={(e) => handleTaskClick(e, task)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    handleTaskClick(e, task)
                                  }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label={`Task: ${task.title}`}
                                className={`text-[9px] sm:text-xs p-1 rounded-lg truncate cursor-pointer transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent-primary/30 ${
                                  priorityStyles[task.priority] ||
                                  "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary"
                                } ${statusBorderClasses[task.status] || ""}`}
                              >
                                <div className="font-medium truncate">{task.title}</div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden overflow-x-auto border bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border-light-border dark:border-dark-border">
                  <div className="grid grid-cols-7 text-center text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide border-b border-light-border dark:border-dark-border min-w-[700px]">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="py-2 sm:py-3 bg-light-bg-hover dark:bg-dark-bg-hover"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 min-w-[700px]">
                    {calendarDays.map((item, index) => {
                      if (!item.isCurrentMonth) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="min-h-[100px] sm:min-h-[120px] bg-light-bg-primary dark:bg-dark-bg-primary/30"
                          />
                        )
                      }

                      const isToday =
                        item.day === today.date() &&
                        currentDate.month() === today.month() &&
                        currentDate.year() === today.year()

                      const dayTasks = getTasksForDay(item.day)

                      return (
                        <div
                          key={item.day}
                          onClick={() => handleDayClick(item.day)}
                          onMouseEnter={() => setHoveredDay(item.day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              handleDayClick(item.day)
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`View tasks for ${currentDate.date(item.day).format("MMMM D, YYYY")}`}
                          className={`relative min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 border-b border-r border-light-border dark:border-dark-border cursor-pointer transition-colors last:border-r-0 ${
                            isToday
                              ? "bg-accent-primary/10 dark:bg-accent-primary/20"
                              : "hover:bg-light-bg-hover/50 dark:hover:bg-dark-bg-hover/30"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                              isToday
                                ? "bg-accent-primary text-white"
                                : "text-light-text-primary dark:text-dark-text-primary"
                            }`}
                          >
                            {item.day}
                          </div>
                          <div className="space-y-0.5 sm:space-y-1">
                            {dayTasks.slice(0, 3).map((task) => (
                              <motion.div
                                key={task._id}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={(e) => handleTaskClick(e, task)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    handleTaskClick(e, task)
                                  }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label={`Task: ${task.title}`}
                                className={`text-[9px] sm:text-xs p-1 rounded-lg truncate cursor-pointer transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent-primary/30 ${
                                  priorityStyles[task.priority] ||
                                  "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary"
                                } ${statusBorderClasses[task.status] || ""}`}
                              >
                                <div className="font-medium truncate">{task.title}</div>
                              </motion.div>
                            ))}
                            {dayTasks.length > 3 && (
                              <div className="text-[9px] sm:text-xs text-light-text-tertiary dark:text-dark-text-tertiary pl-1">
                                +{dayTasks.length - 3} more
                              </div>
                            )}
                          </div>

                          {/* Hover Tooltip - positioned absolutely relative to cell */}
                          <AnimatePresence>
                            {hoveredDay === item.day && dayTasks.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                transition={{ duration: 0.15 }}
                                className="absolute z-40 w-56 p-3 mb-2 overflow-y-auto -translate-x-1/2 border rounded-lg shadow-lg pointer-events-auto bottom-full left-1/2 bg-light-bg-secondary dark:bg-dark-bg-secondary border-light-border dark:border-dark-border max-h-64"
                              >
                                <h3 className="mb-2 text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">
                                  {currentDate.date(item.day).format("MMM D")}
                                </h3>
                                <div className="space-y-1.5">
                                  {dayTasks.map((task) => (
                                    <button
                                      key={task._id}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedTask(task)
                                        setHoveredDay(null)
                                      }}
                                      className={`p-1.5 rounded cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/30 w-full text-left ${
                                        priorityStyles[task.priority] || ""
                                      }`}
                                    >
                                      <div className="text-xs font-medium truncate text-light-text-primary dark:text-dark-text-primary">
                                        {task.title}
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary">
                                        <span className="capitalize">
                                          {task.status?.replace("-", " ")}
                                        </span>
                                        <span>·</span>
                                        <span>{getProjectName(task)}</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-3 border-accent-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                      Loading tasks...
                    </p>
                  </div>
                </div>
              )}

              {!isLoading && filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center px-4 py-16">
                  <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-light-bg-hover dark:bg-dark-bg-hover">
                    <CalendarIcon
                      className="w-8 h-8 text-light-text-tertiary opacity-40"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mb-1 text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
                    No tasks found
                  </p>
                  <p className="mt-1 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    Create a task to see it on the calendar
                  </p>
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
        </>
      )}
    </div>
  )
}

export default CalendarView
