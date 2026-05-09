import dayjs from "dayjs"
import weekOfYear from "dayjs/plugin/weekOfYear"
import { motion } from "framer-motion"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@animateicons/react/lucide"
import { CalendarIcon } from "lucide-react"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../../contexts/customHook.js"
import { useFilter } from "../../contexts/FilterContext.jsx"
import { Skeleton, SkeletonText } from "../Skeleton.jsx"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

dayjs.extend(weekOfYear)

// ─── helpers ────────────────────────────────────────────────────────────────

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
  return Array.from({ length: currentDate.daysInMonth() }, (_, i) => {
    const d = startOfMonth.add(i, "day")
    return {
      label: d.format("DD"),
      sublabel: d.format("ddd"),
      start: d.startOf("day"),
      end: d.endOf("day"),
    }
  })
}

const getTaskBar = (task, columns) => {
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
    width: Math.min(
      Math.max((duration / totalSpan) * 100, 2),
      100 - (startOffset / totalSpan) * 100
    ),
  }
}

// ─── style maps ─────────────────────────────────────────────────────────────

const STATUS_BAR = {
  todo: "bg-task-status-todo/25      border-task-status-todo      text-task-status-todo",
  "in-progress":
    "bg-task-status-progress/25  border-task-status-progress  text-task-status-progress",
  "under-review":
    "bg-task-status-review/25    border-task-status-review    text-task-status-review",
  completed: "bg-task-status-done/25      border-task-status-done      text-task-status-done",
}

const STATUS_DOT = {
  todo: "bg-task-status-todo",
  "in-progress": "bg-task-status-progress",
  "under-review": "bg-task-status-review",
  completed: "bg-task-status-done",
}

const PRIORITY_PILL = {
  low: "bg-task-priority-low/20    text-task-priority-low",
  medium: "bg-task-priority-medium/20 text-task-priority-medium",
  high: "bg-task-priority-high/20   text-task-priority-high",
  urgent: "bg-task-priority-urgent/20 text-task-priority-urgent",
}

// ─── row heights ─────────────────────────────────────────────────────────────
const ROW_H = 44 // px — height of each task row
const HDR_H = 52 // px — height of the date header strip

// ─── component ───────────────────────────────────────────────────────────────

const TimelineSkeleton = () => (
  <div className="h-full flex flex-col">
    <div className="flex items-center justify-between p-5 border-b border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-secondary shrink-0">
      <div>
        <SkeletonText width="w-32" height="h-7" className="mb-1" />
        <SkeletonText width="w-48" height="h-4" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-24 h-9 rounded-lg" />
        <Skeleton className="w-24 h-9 rounded-lg" />
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="w-32 h-9 rounded-lg" />
        <Skeleton className="w-9 h-9 rounded-lg" />
      </div>
    </div>
    <div className="flex items-center gap-3 p-4 border-b border-light-border dark:border-dark-border bg-light-bg-hover/30 dark:bg-dark-bg-hover/20 shrink-0">
      <SkeletonText width="w-20" height="h-4" />
      <div className="flex gap-2">
        <Skeleton className="w-20 h-8 rounded-full" />
        <Skeleton className="w-20 h-8 rounded-full" />
        <Skeleton className="w-20 h-8 rounded-full" />
      </div>
    </div>
    <div className="flex-1 overflow-hidden">
      <div className="flex border-b border-light-border dark:border-dark-border bg-light-bg-hover/50 dark:bg-dark-bg-hover/30 shrink-0">
        <div className="w-[220px] p-3 border-r border-light-border dark:border-dark-border">
          <SkeletonText width="w-16" height="h-4" />
        </div>
        <div className="flex-1 flex">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 p-2 border-r border-light-border dark:border-dark-border text-center"
            >
              <SkeletonText width="w-8" height="h-3" className="mx-auto" />
              <SkeletonText width="w-6" height="h-3" className="mx-auto mt-1" />
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-auto">
        {Array.from({ length: 6 }).map((_, group) => (
          <div key={group} className="border-b border-light-border dark:border-dark-border">
            <div className="w-[220px] p-3 border-r border-light-border dark:border-dark-border bg-light-bg-primary/50 dark:bg-dark-bg-primary/50">
              <SkeletonText width="w-24" height="h-5" />
            </div>
            <div className="relative h-11 p-2">
              <Skeleton
                className="absolute h-7 rounded-lg"
                style={{
                  left: `${(group * 15) % 70}%`,
                  width: `${20 + (group % 3) * 10}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const TimelineView = () => {
  useAuth()
  const { projectFilter, sprintFilter } = useFilter()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState("month")
  const [selectedTask, setSelectedTask] = useState(null)
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [groupBy, setGroupBy] = useState("project")

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiService.getAllTaskOfUser()
      if (res.success) setTasks(res.data?.tasks || [])
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // ── derived ────────────────────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    let r = tasks
    if (projectFilter)
      r = r.filter(
        (t) => (typeof t.project === "object" ? t.project?._id : t.project) === projectFilter
      )
    if (sprintFilter) r = r.filter((t) => t.sprint === sprintFilter)
    return r
  }, [tasks, projectFilter, sprintFilter])

  const columns = useMemo(() => getDateColumns(zoom, currentDate), [zoom, currentDate])

  const todayPct = useMemo(() => {
    const today = dayjs()
    const firstCol = columns[0]?.start
    const lastCol = columns[columns.length - 1]?.end
    if (!firstCol || today.isBefore(firstCol) || today.isAfter(lastCol)) return null
    const total = lastCol.diff(firstCol, "day") + 1
    const offset = today.diff(firstCol, "day") + 0.5
    return (offset / total) * 100
  }, [columns])

  const groupedTasks = useMemo(() => {
    const groups = {}
    filteredTasks.forEach((task) => {
      const key =
        groupBy === "sprint"
          ? task.sprint?.name || task.sprint || "Backlog"
          : typeof task.project === "object"
            ? task.project?.name || "Personal"
            : "Personal"
      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    })
    return groups
  }, [filteredTasks, groupBy])

  // ── navigation ─────────────────────────────────────────────────────────────
  const navigateDate = (dir) => {
    if (zoom === "day") setCurrentDate((p) => p.add(dir * 14, "day"))
    else if (zoom === "week") setCurrentDate((p) => p.add(dir * 12, "week"))
    else setCurrentDate((p) => p.add(dir, "month"))
  }

  const getDateLabel = () => {
    if (zoom === "day") {
      const end = currentDate.add(13, "day")
      return currentDate.month() === end.month()
        ? `${currentDate.format("MMM D")} – ${end.format("D, YYYY")}`
        : `${currentDate.format("MMM D")} – ${end.format("MMM D, YYYY")}`
    }
    if (zoom === "week") {
      const end = currentDate.startOf("week").add(11 * 7, "day")
      return `${currentDate.startOf("week").format("MMM D")} – ${end.format("MMM D, YYYY")}`
    }
    return currentDate.format("MMMM YYYY")
  }

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return <TimelineSkeleton />
  }

  // ─── render ──────────────────────────────────────────────────────────────
  const LEFT_COL_W = 220 // px — frozen left label column width

  return (
    <div className="h-full flex flex-col bg-light-bg-primary dark:bg-dark-bg-primary overflow-hidden">
      {/* ── top header bar ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-5 py-4 border-b border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-secondary gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary">
            Timeline
          </h1>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
            Visualize your project schedule
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Group By */}
          <div className="flex items-center gap-1 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-1">
            {["project", "sprint"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroupBy(g)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/30 ${
                  groupBy === g
                    ? "bg-accent-primary text-white font-medium"
                    : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg p-1">
            {["day", "week", "month"].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZoom(z)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/30 ${
                  zoom === z
                    ? "bg-accent-primary text-white font-medium"
                    : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          {/* Nav */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigateDate(-1)}
              aria-label="Previous period"
              className="p-1.5 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
            >
              <ChevronLeftIcon
                className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary"
                aria-hidden="true"
              />
            </button>
            <span className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary min-w-[140px] text-center">
              {getDateLabel()}
            </span>
            <button
              type="button"
              onClick={() => navigateDate(1)}
              aria-label="Next period"
              className="p-1.5 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
            >
              <ChevronRightIcon
                className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── main grid ── */}
      {filteredTasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-light-bg-hover dark:bg-dark-bg-hover flex items-center justify-center mx-auto mb-4">
              <CalendarIcon
                className="w-8 h-8 text-light-text-tertiary opacity-40"
                aria-hidden="true"
              />
            </div>
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              No tasks yet
            </h3>
            <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
              Create tasks with due dates to see them on the timeline
            </p>
          </div>
        </div>
      ) : (
        /* Outer scroll container — scrolls both axes together */
        <div className="flex-1 overflow-auto custom-scrollbar" style={{ minWidth: 0 }}>
          {/* Inner wrapper — wide enough to hold all columns */}
          <div style={{ minWidth: LEFT_COL_W + columns.length * 60 }}>
            {/* ─── sticky date-header ─────────────────────────────────── */}
            <div
              className="sticky top-0 z-30 flex border-b border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-secondary"
              style={{ height: HDR_H }}
            >
              {/* frozen top-left corner */}
              <div
                className="shrink-0 flex items-end pb-2 px-3 border-r border-light-border dark:border-dark-border text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary"
                style={{ width: LEFT_COL_W }}
              >
                {groupBy === "sprint" ? "Sprint / Task" : "Project / Task"}
              </div>

              {/* date columns */}
              <div className="flex flex-1 relative">
                {/* today needle in header */}
                {todayPct !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-accent-primary/60 z-10 pointer-events-none"
                    style={{ left: `${todayPct}%` }}
                  />
                )}
                {columns.map((col) => (
                  <div
                    key={col.start.toISOString()}
                    className="flex-1 flex flex-col items-center justify-end pb-2 border-r border-light-border/50 dark:border-dark-border/50 last:border-r-0"
                  >
                    <span className="text-[11px] font-semibold text-light-text-primary dark:text-dark-text-primary leading-none">
                      {col.label}
                    </span>
                    <span className="text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary mt-0.5 uppercase tracking-wide">
                      {col.sublabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── group sections ──────────────────────────────────────── */}
            {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
              <div key={groupName}>
                {/* group header row */}
                <div
                  className="sticky left-0 z-20 flex items-center px-3 border-b border-light-border dark:border-dark-border bg-light-bg-secondary/80 dark:bg-dark-bg-tertiary/80 backdrop-blur-sm"
                  style={{ height: 36 }}
                >
                  <div
                    style={{ width: LEFT_COL_W - 12 }}
                    className="shrink-0 flex items-center gap-2"
                  >
                    <span className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary truncate">
                      {groupName}
                    </span>
                    <span className="text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary shrink-0">
                      {groupTasks.length} task{groupTasks.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {/* thin colored bar extend across grid */}
                  <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
                </div>

                {/* one row per task */}
                {groupTasks.map((task, idx) => {
                  const bar = getTaskBar(task, columns)
                  const barStyle = STATUS_BAR[task.status] || STATUS_BAR.todo
                  const dotStyle = STATUS_DOT[task.status] || STATUS_DOT.todo
                  const pillStyle = PRIORITY_PILL[task.priority] || PRIORITY_PILL.low

                  return (
                    <div
                      key={task._id}
                      className="flex border-b border-light-border/40 dark:border-dark-border/40 hover:bg-light-bg-hover/30 dark:hover:bg-dark-bg-hover/30 transition-colors"
                      style={{ height: ROW_H }}
                    >
                      {/* ── left label column (sticky) ── */}
                      <div
                        className="sticky left-0 z-10 shrink-0 flex items-center gap-2 px-3 bg-light-bg-primary dark:bg-dark-bg-primary border-r border-light-border dark:border-dark-border"
                        style={{ width: LEFT_COL_W }}
                      >
                        <span className={`shrink-0 w-2 h-2 rounded-full ${dotStyle}`} />
                        <button
                          type="button"
                          className="flex-1 text-left text-xs text-light-text-primary dark:text-dark-text-primary truncate cursor-pointer hover:text-accent-primary transition-colors focus:outline-none"
                          onClick={() => setSelectedTask(task)}
                        >
                          {task.title}
                        </button>
                        {task.priority && (
                          <span
                            className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${pillStyle}`}
                          >
                            {task.priority}
                          </span>
                        )}
                      </div>

                      {/* ── gantt bar area ── */}
                      <div className="flex-1 relative">
                        {/* today needle */}
                        {todayPct !== null && (
                          <div
                            className="absolute top-0 bottom-0 w-px bg-accent-primary/40 z-10 pointer-events-none"
                            style={{ left: `${todayPct}%` }}
                          />
                        )}

                        {/* alternating column stripes */}
                        <div className="absolute inset-0 flex pointer-events-none">
                          {columns.map((col, ci) => (
                            <div
                              key={col.start.toISOString()}
                              className={`flex-1 border-r border-light-border/30 dark:border-dark-border/30 ${
                                ci % 2 === 0
                                  ? ""
                                  : "bg-light-bg-secondary/20 dark:bg-dark-bg-secondary/20"
                              }`}
                            />
                          ))}
                        </div>

                        {/* the actual Gantt bar */}
                        {bar && (
                          <motion.button
                            type="button"
                            initial={{ opacity: 0, scaleX: 0.8 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: idx * 0.03, duration: 0.2 }}
                            onClick={() => setSelectedTask(task)}
                            aria-label={`${task.title} – ${task.status}${task.dueDate ? `, due ${dayjs(task.dueDate).format("MMM DD")}` : ""}`}
                            className={`absolute inset-y-0 my-auto rounded-full border-l-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary/50 hover:brightness-110 transition-all ${barStyle}`}
                            style={{
                              left: `${bar.left}%`,
                              width: `${bar.width}%`,
                              height: 24,
                              originX: "left",
                            }}
                          >
                            <span className="px-2 text-[11px] font-medium truncate block leading-6 text-left">
                              {task.title}
                            </span>
                          </motion.button>
                        )}

                        {/* no-date pill */}
                        {!bar && (
                          <div className="absolute inset-0 flex items-center px-3">
                            <span className="text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary italic">
                              No dates set
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── task detail panel ── */}
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
