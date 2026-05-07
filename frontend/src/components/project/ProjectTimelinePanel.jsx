import { useMemo } from "react"
import dayjs from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"
import { motion } from "framer-motion"

dayjs.extend(isoWeek)

const ZOOM_CONFIG = {
  week: {
    unit: "day",
    format: "ddd",
    subFormat: "DD",
    ticks: 7,
    label: "This Week",
  },
  month: {
    unit: "week",
    format: "W",
    subFormat: "MMM DD",
    ticks: 4,
    label: "This Month",
  },
  quarter: {
    unit: "month",
    format: "MMM",
    subFormat: "YYYY",
    ticks: 3,
    label: "This Quarter",
  },
}

const STATUS_PHASES = [
  { status: "todo", label: "To Do", color: "#8B8178" },
  { status: "in-progress", label: "In Progress", color: "#C4654A" },
  { status: "under-review", label: "Under Review", color: "#D4A548" },
  { status: "completed", label: "Completed", color: "#7A9A6D" },
]

const ZOOM_OPTIONS = ["week", "month", "quarter"]

/**
 * Generates timeline tick marks based on the current zoom level.
 */
function getTimelineTicks(zoom, projectStart, projectEnd) {
  const today = dayjs()
  const config = ZOOM_CONFIG[zoom]

  if (zoom === "week") {
    const weekStart = today.startOf("isoWeek")
    return Array.from({ length: 7 }, (_, i) => {
      const date = weekStart.add(i, "day")
      return {
        label: date.format("ddd"),
        subLabel: date.format("DD"),
        isToday: date.isSame(today, "day"),
        position: ((i + 0.5) / 7) * 100,
      }
    })
  }

  if (zoom === "month") {
    const monthStart = today.startOf("month")
    const daysInMonth = today.daysInMonth()
    const weeks = []
    let cursor = monthStart
    let weekIndex = 0

    while (cursor.isBefore(monthStart.endOf("month")) || cursor.isSame(monthStart.endOf("month"), "day")) {
      const weekEnd = cursor.endOf("isoWeek").isBefore(monthStart.endOf("month"))
        ? cursor.endOf("isoWeek")
        : monthStart.endOf("month")

      const dayOffset = cursor.diff(monthStart, "day")
      const position = ((dayOffset + 0.5) / daysInMonth) * 100

      weeks.push({
        label: `W${weekIndex + 1}`,
        subLabel: `${cursor.format("MMM DD")}–${weekEnd.format("DD")}`,
        isToday: today.isAfter(cursor.subtract(1, "day")) && today.isBefore(weekEnd.add(1, "day")),
        position,
      })

      cursor = weekEnd.add(1, "day")
      weekIndex++
    }

    return weeks
  }

  if (zoom === "quarter") {
    const quarterStart = today.startOf("quarter")
    return Array.from({ length: 3 }, (_, i) => {
      const month = quarterStart.add(i, "month")
      const daysInQuarter = quarterStart.add(2, "month").endOf("month").diff(quarterStart, "day") + 1
      const dayOffset = month.startOf("month").diff(quarterStart, "day")
      const daysInMonth = month.daysInMonth()

      return {
        label: month.format("MMM"),
        subLabel: month.format("YYYY"),
        isToday: month.isSame(today, "month"),
        position: ((dayOffset + daysInMonth / 2) / daysInQuarter) * 100,
      }
    })
  }

  return []
}

/**
 * Calculates project progress within the current zoom window.
 */
function getZoomProgress(zoom, project) {
  const today = dayjs()

  if (zoom === "week") {
    const weekStart = today.startOf("isoWeek")
    const weekEnd = today.endOf("isoWeek")
    const dayOfWeek = today.isoWeekday()
    return {
      progress: (dayOfWeek / 7) * 100,
      rangeLabel: `${weekStart.format("MMM DD")} – ${weekEnd.format("MMM DD, YYYY")}`,
    }
  }

  if (zoom === "month") {
    const monthStart = today.startOf("month")
    const monthEnd = today.endOf("month")
    const dayOfMonth = today.date()
    const daysInMonth = today.daysInMonth()
    return {
      progress: (dayOfMonth / daysInMonth) * 100,
      rangeLabel: today.format("MMMM YYYY"),
    }
  }

  if (zoom === "quarter") {
    const quarterStart = today.startOf("quarter")
    const quarterEnd = today.endOf("quarter")
    const daysInQuarter = quarterEnd.diff(quarterStart, "day") + 1
    const elapsed = today.diff(quarterStart, "day") + 1
    return {
      progress: (elapsed / daysInQuarter) * 100,
      rangeLabel: `${quarterStart.format("MMM DD")} – ${quarterEnd.format("MMM DD, YYYY")}`,
    }
  }

  return { progress: 0, rangeLabel: "" }
}

const ProjectTimelinePanel = ({
  project,
  columns,
  timelineZoom = "month",
  onZoomChange,
  onStatusClick,
}) => {
  const today = dayjs()

  const statusData = useMemo(
    () =>
      STATUS_PHASES.map((phase) => ({
        ...phase,
        count: columns[phase.status]?.tasks?.length || 0,
      })),
    [columns],
  )

  const totalTasksCount = statusData.reduce((sum, p) => sum + p.count, 0)

  const statusWithPercent = useMemo(
    () =>
      statusData.map((phase) => {
        const percentage = totalTasksCount > 0 ? (phase.count / totalTasksCount) * 100 : 0
        return {
          ...phase,
          width: percentage,
          text: phase.count > 0 ? `${phase.count} ${phase.count === 1 ? "task" : "tasks"}` : "0 tasks",
        }
      }),
    [statusData, totalTasksCount],
  )

  // Project duration progress
  const projectProgress = useMemo(() => {
    if (!project?.startDate || !project?.endDate) return null
    const start = dayjs(project.startDate)
    const end = dayjs(project.endDate)
    const totalDuration = end.diff(start, "day")
    const elapsed = today.diff(start, "day")
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
    return {
      progress,
      color: progress > 75 ? "#7A9A6D" : progress > 40 ? "#D4A548" : "#C4654A",
      text: `${Math.round(progress)}% complete`,
    }
  }, [project?.startDate, project?.endDate])

  // Zoom-dependent timeline
  const zoomProgress = useMemo(() => getZoomProgress(timelineZoom, project), [timelineZoom, project])
  const timelineTicks = useMemo(
    () => getTimelineTicks(timelineZoom, project?.startDate, project?.endDate),
    [timelineZoom, project?.startDate, project?.endDate],
  )

  return (
    <div className="flex-1.5 pl-5 min-w-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">
          Project Status & Timeline
        </h2>
        <div className="flex gap-1 bg-light-bg-hover dark:bg-dark-bg-hover p-0.5 rounded-lg">
          {ZOOM_OPTIONS.map((zoom) => (
            <button
              key={zoom}
              type="button"
              onClick={() => onZoomChange?.(zoom)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                timelineZoom === zoom
                  ? "bg-white dark:bg-dark-bg-secondary text-accent-primary shadow-sm"
                  : "text-light-text-tertiary hover:text-light-text-primary"
              }`}
            >
              {zoom.charAt(0).toUpperCase() + zoom.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Zoom Timeline Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-light-text-secondary dark:text-dark-text-secondary">
              {ZOOM_CONFIG[timelineZoom].label}
            </span>
            <span className="text-[10px] font-bold text-accent-primary dark:text-accent-primary-light bg-accent-primary/5 px-2 py-0.5 rounded-full">
              {zoomProgress.rangeLabel}
            </span>
          </div>

          {/* Timeline bar with tick marks */}
          <div className="relative">
            <div className="h-2.5 bg-light-bg-hover dark:bg-dark-bg-hover rounded-full relative overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${zoomProgress.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #C4654A 0%, #D4A548 50%, #7A9A6D 100%)",
                }}
              />
              {/* Today marker */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-0 bottom-0 w-0.5 bg-white/90 z-10 shadow-sm"
                style={{ left: `${zoomProgress.progress}%` }}
              />
            </div>

            {/* Tick labels */}
            <div className="relative h-5 mt-1">
              {timelineTicks.map((tick) => (
                <div
                  key={`${tick.label}-${tick.position}`}
                  className="absolute flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${tick.position}%` }}
                >
                  <span
                    className={`text-[9px] font-bold leading-none ${
                      tick.isToday
                        ? "text-accent-primary dark:text-accent-primary-light"
                        : "text-light-text-tertiary dark:text-dark-text-tertiary/60"
                    }`}
                  >
                    {tick.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Breakdown Section */}
        <div className="flex flex-col gap-2 pt-2 border-t border-light-border/50 dark:border-dark-border/50">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-light-text-tertiary dark:text-dark-text-tertiary/70 mb-1">
            Status Breakdown
          </span>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {statusWithPercent.map((phase, idx) => (
              <motion.div
                key={phase.status}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => onStatusClick?.(phase.status)}
              >
                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-light-text-secondary dark:text-dark-text-secondary group-hover:text-accent-primary transition-colors">
                      {phase.label}
                    </span>
                    <span className="text-[10px] font-black text-light-text-primary dark:text-dark-text-primary">
                      {phase.text.split(" ")[0]}
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-light-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${phase.width}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: phase.color }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectTimelinePanel