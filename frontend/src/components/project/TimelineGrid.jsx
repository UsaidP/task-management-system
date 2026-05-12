import { ChevronLeftIcon, ChevronRightIcon } from "@animateicons/react/lucide"
import dayjs from "dayjs"
import weekOfYear from "dayjs/plugin/weekOfYear"
import { motion } from "framer-motion"
import { CalendarIcon } from "lucide-react"

dayjs.extend(weekOfYear)

const statusColors = {
  todo: "#8B8178",
  "in-progress": "#C4654A",
  "under-review": "#D4A548",
  completed: "#7A9A6D",
}

const getTaskPosition = (task, timelineColumns) => {
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

const TimelineGrid = ({
  tasks,
  timelineColumns,
  timelineZoom,
  timelineDate,
  onTimelineZoomChange,
  onTimelineDateChange,
  onTaskClick,
}) => {
  const formatPeriodLabel = () => {
    if (timelineZoom === "month") return timelineDate.format("MMMM YYYY")
    if (timelineZoom === "quarter")
      return `Q${timelineDate.quarter()} ${timelineDate.format("YYYY")}`
    if (timelineZoom === "week")
      return `Week ${timelineDate.week()}, ${timelineDate.format("YYYY")}`
    return timelineDate.format("MMM DD, YYYY")
  }

  // Compute month groupings for header row
  const monthGroups = []
  let lastMonth = null
  let colCount = 0
  for (const col of timelineColumns) {
    if (col.month !== lastMonth) {
      if (lastMonth !== null) monthGroups.push({ label: lastMonth, span: colCount })
      lastMonth = col.month
      colCount = 1
    } else {
      colCount++
    }
  }
  if (lastMonth !== null) monthGroups.push({ label: lastMonth, span: colCount })

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-surface">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border-b border-border bg-bg-surface shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary">Timeline</h2>
          <p className="text-xs sm:text-sm text-text-muted">{tasks.length} tasks</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-bg-surface rounded-lg p-1">
            {["day", "week", "month", "quarter"].map((zoom) => (
              <button
                key={zoom}
                type="button"
                onClick={() => onTimelineZoomChange(zoom)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors capitalize min-h-[36px] ${timelineZoom === zoom ? "bg-accent-primary text-white shadow-sm" : "text-light-text-secondary hover:bg-bg-hover dark:hover:bg-dark-bg-hover"}`}
              >
                {zoom}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onTimelineDateChange(timelineDate.add(-1, timelineZoom))}
              aria-label="Previous period"
              className="p-1.5 sm:p-2 rounded-lg hover:bg-bg-hover transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
            </button>
            <span className="text-xs sm:text-sm font-medium text-text-primary min-w-[120px] sm:min-w-[160px] text-center px-2">
              {formatPeriodLabel()}
            </span>
            <button
              type="button"
              onClick={() => onTimelineDateChange(timelineDate.add(1, timelineZoom))}
              aria-label="Next period"
              className="p-1.5 sm:p-2 rounded-lg hover:bg-bg-hover transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        <div className="bg-bg-canvas rounded-lg border border-border overflow-hidden">
          <div className="flex min-h-full">
            {/* Task List Sidebar */}
            <div className="w-40 sm:w-48 flex-shrink-0 border-r border-border bg-bg-surface">
              <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase border-b border-border">
                Task
              </div>
              {tasks.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-text-muted">No tasks</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => onTaskClick(task)}
                    className="h-10 px-3 flex items-center border-b border-border hover:bg-bg-hover cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-medium text-text-primary truncate">{task.title}</p>
                  </div>
                ))
              )}
            </div>

            {/* Grid */}
            <div className="flex-1 relative">
              {/* Month Header */}
              <div className="flex sticky top-0 bg-bg-surface border-b border-border z-10">
                <div className="flex w-full border-b border-light-border/50 dark:border-dark-border/50">
                  {monthGroups.map((m, i) => (
                    <div
                      key={i}
                      className="px-1 py-1 text-xs font-medium text-text-secondary text-center border-r border-light-border/30 dark:border-dark-border/30 last:border-r-0 shrink-0"
                      style={{ flexBasis: `${m.span * 40}px` }}
                    >
                      {m.label}
                    </div>
                  ))}
                </div>
              </div>
              {/* Day Header */}
              <div className="flex sticky top-7 bg-bg-surface border-b border-border z-10">
                {timelineColumns.map((col, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-[30px] sm:min-w-[40px] px-1 py-1 border-r border-border text-center"
                  >
                    <div className="text-xs text-text-muted">{col.label}</div>
                    <div className="text-xs text-text-muted uppercase">{col.sublabel}</div>
                  </div>
                ))}
              </div>

              {/* Task Bars */}
              <div className="flex flex-col">
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-12 h-12 rounded-full bg-bg-hover flex items-center justify-center mb-3">
                      <CalendarIcon
                        className="w-6 h-6 text-text-muted opacity-40"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-sm font-medium text-text-primary mb-1">No tasks yet</p>
                    <p className="text-xs text-text-muted">
                      Create tasks with due dates to see them here
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => {
                    const position = getTaskPosition(task, timelineColumns)
                    return (
                      <div
                        key={task._id}
                        className="relative h-10 border-b border-light-border/40 dark:border-dark-border/40"
                      >
                        <div className="absolute inset-0 flex pointer-events-none">
                          {timelineColumns.map((_col, i) => (
                            <div
                              key={i}
                              className={`flex-1 min-w-[30px] sm:min-w-[40px] border-r border-light-border/30 dark:border-dark-border/30 ${i % 2 === 0 ? "" : "bg-light-bg-secondary/20 dark:bg-dark-bg-secondary/20"}`}
                            />
                          ))}
                        </div>
                        {position && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => onTaskClick(task)}
                            className="absolute top-1.5 bottom-1.5 rounded-full cursor-pointer hover:opacity-90 transition-opacity border-l-2 z-10"
                            style={{
                              left: `${position.left}%`,
                              width: `${position.width}%`,
                              backgroundColor: `${statusColors[task.status] || statusColors.todo}33`,
                              borderLeftColor: statusColors[task.status] || statusColors.todo,
                            }}
                          >
                            <div className="px-2 overflow-hidden h-full flex items-center">
                              <p className="text-[10px] font-medium text-text-primary truncate">
                                {task.title}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineGrid
