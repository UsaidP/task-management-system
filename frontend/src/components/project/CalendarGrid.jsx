import dayjs from "dayjs"
import { motion } from "framer-motion"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const CalendarGrid = ({ tasks, calendarDaysData, calendarDate, onMonthChange, onTaskClick }) => {
  const today = dayjs()

  const getTasksForDay = (day) => {
    if (!day) return []
    return tasks.filter((task) => {
      const taskDate = dayjs(task.dueDate)
      return (
        taskDate.date() === day &&
        taskDate.month() === calendarDate.month() &&
        taskDate.year() === calendarDate.year()
      )
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-tertiary">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border-b border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">Calendar</h2>
          <p className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary">{tasks.length} tasks</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onMonthChange(calendarDate.add(-1, "month"))} className="p-1.5 sm:p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center">
              <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-light-text-primary dark:text-dark-text-primary min-w-[120px] sm:min-w-[160px] text-center px-2">
              {calendarDate.format("MMMM YYYY")}
            </span>
            <button type="button" onClick={() => onMonthChange(calendarDate.add(1, "month"))} className="p-1.5 sm:p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center">
              <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
          </div>
          <button type="button" onClick={() => onMonthChange(dayjs())} className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors min-h-[36px]">
            Today
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        <div className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg border border-light-border dark:border-dark-border overflow-hidden">
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-light-text-tertiary dark:text-dark-text-tertiary uppercase border-b border-light-border dark:border-dark-border min-w-[700px]">
            {weekDays.map((day) => (
              <div key={day} className="py-2 sm:py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-w-[700px]">
            {calendarDaysData.map((item, index) => {
              if (!item.isCurrentMonth) {
                return <div key={`empty-${index}`} className="min-h-[80px] sm:min-h-[100px] bg-light-bg-hover/50 dark:bg-dark-bg-hover/50" />
              }
              const isToday = item.day === today.date() && calendarDate.month() === today.month() && calendarDate.year() === today.year()
              const dayTasks = getTasksForDay(item.day)
              return (
                <div key={item.day} className={`min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 border-b border-r border-light-border dark:border-dark-border last:border-r-0 ${isToday ? "bg-accent-primary/10 dark:bg-accent-primary/20" : "hover:bg-light-bg-hover/50 dark:hover:bg-dark-bg-hover/50"}`}>
                  <div className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs sm:text-xs font-medium mb-1.5 ${isToday ? "bg-accent-primary text-white" : "text-light-text-tertiary dark:text-dark-text-tertiary"}`}>
                    {item.day}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    {dayTasks.length === 0 ? (
                      <div className="text-[10px] text-light-text-tertiary/50 dark:text-dark-text-tertiary/50 pl-0.5">No tasks</div>
                    ) : (
                      <>
                        {dayTasks.slice(0, 2).map((task) => (
                          <motion.div
                            key={task._id}
                            initial={{ opacity: 0, y: -3 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => onTaskClick(task)}
                            className="text-[10px] sm:text-xs p-1 rounded truncate cursor-pointer bg-light-bg-secondary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
                          >
                            <div className="font-medium truncate">{task.title}</div>
                          </motion.div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-[10px] sm:text-xs text-light-text-tertiary dark:text-dark-text-tertiary pl-1">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </>
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

export default CalendarGrid
