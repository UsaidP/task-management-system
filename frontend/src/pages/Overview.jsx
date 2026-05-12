import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { motion, useReducedMotion } from "framer-motion"
import { memo, useCallback, useEffect, useState } from "react"

dayjs.extend(relativeTime)

import {
  ActivityIcon,
  ClipboardIcon,
  EyeIcon,
  PlusIcon,
  TriangleAlertIcon,
} from "@animateicons/react/lucide"
import { CalendarIcon, ClockIcon, SquareCheckIcon } from "lucide-react"
import { Link } from "react-router-dom"
import apiService from "../../service/apiService.js"
import { EmptyState, NetworkError, ServerError } from "../components/ErrorStates.jsx"
import CreateProjectModal from "../components/project/CreateProjectModal.jsx"
import { SkeletonCard, SkeletonCircle, SkeletonText } from "../components/Skeleton.jsx"
import TaskDetailPanel from "../components/task/TaskDetailPanel.jsx"
import { useAuth } from "../contexts/customHook.js"
import { capitalizeName } from "../utils/stringHelpers.js"

const OverviewSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="p-6 space-y-8 sm:p-8 max-w-[1400px] mx-auto"
  >
    <div className="flex items-center justify-between animate-pulse">
      <div>
        <div className="w-64 h-10 mb-3 rounded-xl bg-bg-hover" />
        <div className="h-6 rounded-xl w-80 bg-bg-hover" />
      </div>
      <div className="hidden w-48 h-6 rounded-xl bg-bg-hover md:block" />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} className="h-32 p-6" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <SkeletonCard className="h-48 p-6" />
        <SkeletonCard className="h-40 p-6" />
      </div>
      <div className="lg:col-span-1">
        <SkeletonCard className="p-6 h-96">
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <SkeletonCircle size="w-2 h-2 mt-2" className="!rounded-full" />
                <div className="flex-1 space-y-2">
                  <SkeletonText width="w-3/4" />
                  <SkeletonText width="w-1/2" height="h-3" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  </motion.div>
)

const HeaderSkeleton = () => (
  <div className="flex items-center justify-between animate-pulse">
    <div>
      <div className="w-64 h-10 mb-3 rounded-xl bg-bg-hover" />
      <div className="h-6 rounded-xl w-80 bg-bg-hover" />
    </div>
    <div className="hidden w-48 h-6 rounded-xl bg-bg-hover md:block" />
  </div>
)

const StatCard = memo(({ icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className="relative overflow-hidden transition-all duration-300 p-6 bg-bg-surface border border-border rounded-xl shadow-sm group interactive-card"
  >
    {/* Subtle gradient overlay on hover */}
    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent group-hover:opacity-100" />
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl ${color} transition-all duration-200 group-hover:scale-110 group-hover:shadow-md flex items-center justify-center text-white shadow-sm`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="py-1 mb-1 font-sans text-4xl font-bold tracking-tight text-text-primary">
          {value}
        </p>
        <p className="text-sm font-medium text-text-secondary">{label}</p>
      </div>
    </div>
  </motion.div>
))
StatCard.displayName = "StatCard"

const statusColors = {
  todo: "bg-light-text-tertiary dark:bg-dark-text-tertiary",
  "in-progress": "bg-accent-primary",
  "under-review": "bg-accent-warning",
  completed: "bg-accent-success",
}

const RecentActivityItem = memo(({ task, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      delay: 0.5 + index * 0.05,
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    }}
    type="button"
    onClick={() => onClick(task)}
    aria-label={`View task: ${task.title}`}
    className="flex items-start w-full gap-4 p-4 text-left transition-all duration-200 rounded-xl hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-accent-primary/30 group"
  >
    <div
      className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${statusColors[task.status] || "bg-accent-primary"} transition-transform duration-200 group-hover:scale-125`}
    />
    <div className="flex-1 min-w-0">
      <h3 className="mb-1 text-sm font-semibold text-text-primary line-clamp-1">{task.title}</h3>
      <p className="mb-2 text-xs text-text-secondary line-clamp-1">{task.description}</p>
      <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-bg-hover text-text-muted tracking-wider">
        {task.status.replace("-", " ")}
      </span>
    </div>
    <div className="flex-shrink-0 text-xs text-text-muted whitespace-nowrap mt-0.5">
      {dayjs(task.updatedAt).fromNow
        ? dayjs(task.updatedAt).fromNow()
        : dayjs(task.updatedAt).format("MMM D")}
    </div>
  </motion.button>
))
RecentActivityItem.displayName = "RecentActivityItem"

const UpcomingTaskItem = memo(({ task, onClick, index }) => {
  const isUrgent = dayjs(task.dueDate).diff(dayjs(), "day") <= 1
  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.3 + index * 0.05,
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      type="button"
      onClick={() => onClick(task)}
      aria-label={`View task: ${task.title}, due ${dayjs(task.dueDate).format("MMM D")}`}
      className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all duration-200 group mb-3 ${isUrgent ? "border-accent-danger/30 bg-accent-danger/5 hover:bg-accent-danger/10" : "border-light-border/60 dark:border-dark-border/60 hover:border-light-border dark:hover:border-dark-border hover:bg-light-bg-secondary/50 dark:hover:bg-dark-bg-secondary/50"} hover:shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-accent-primary/30 cursor-pointer text-left`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl transition-all duration-200 group-hover:scale-105 ${isUrgent ? "bg-accent-danger text-white shadow-sm shadow-accent-danger/20" : "bg-light-bg-hover text-text-muted dark:text-dark-text-tertiary"}`}
        >
          <CalendarIcon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{task.title}</h3>
          <p className="text-xs text-text-secondary">{task.project?.name || "Personal"}</p>
        </div>
      </div>
      <div
        className={`text-sm font-medium px-3 py-1 rounded-lg ${isUrgent ? "text-accent-danger bg-accent-danger/10" : "text-light-text-primary bg-bg-surface dark:bg-dark-bg-tertiary"}`}
      >
        {dayjs(task.dueDate).format("MMM D")}
      </div>
    </motion.button>
  )
})
UpcomingTaskItem.displayName = "UpcomingTaskItem"

const Overview = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const reduceMotion = useReducedMotion()
  const [stats, setStats] = useState({
    totalTasks: 0,
    todo: 0,
    inProgress: 0,
    underReview: 0,
    completed: 0,
  })
  const [recentTasks, setRecentTasks] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [error, setError] = useState(null)
  const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [tasksResponse] = await Promise.all([apiService.getAllTaskOfUser()])
      if (tasksResponse.success) {
        const tasksData = tasksResponse.data.tasks

        setStats({
          totalTasks: tasksData.length,
          todo: tasksData.filter((t) => t.status === "todo").length,
          inProgress: tasksData.filter((t) => t.status === "in-progress").length,
          underReview: tasksData.filter((t) => t.status === "under-review").length,
          completed: tasksData.filter((t) => t.status === "completed").length,
        })

        // Setup recent activity (last 5 updated tasks)
        const sortedByUpdated = [...tasksData].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        )
        setRecentTasks(sortedByUpdated.slice(0, 5))

        // Setup upcoming tasks (due within 7 days)
        const now = dayjs()
        const nextWeek = now.add(7, "day")
        const upcoming = tasksData
          .filter((t) => {
            if (!t.dueDate || t.status === "completed") return false
            const due = dayjs(t.dueDate)
            return due.isAfter(now.subtract(1, "day")) && due.isBefore(nextWeek)
          })
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        setUpcomingTasks(upcoming.slice(0, 4))
      }
    } catch (err) {
      console.error("Failed to fetch overview data:", err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchDashboardData])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  if (loading) {
    return <OverviewSkeleton />
  }

  if (error) {
    if (error.name === "NetworkError") {
      return <NetworkError onRetry={fetchDashboardData} />
    }
    return <ServerError onRetry={fetchDashboardData} />
  }

  const completionRate =
    stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header Section */}
      {user ? (
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <h1 className="mb-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl text-text-primary">
              {getGreeting()}, {capitalizeName(user.fullname?.split(" ")[0]) || "User"}{" "}
              <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
            </h1>
            <p className="text-base text-text-secondary">
              Here's what's happening across your workspace today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center px-4 py-2.5 text-sm font-medium border bg-bg-surface rounded-xl text-text-secondary border-light-border/60 dark:border-dark-border/60">
              <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
              {dayjs().format("dddd, MMM D")}
            </div>
            <button
              type="button"
              onClick={() => setCreateProjectModalOpen(true)}
              className="bg-primary px-4 py-2 flex items-center rounded-xl hover:bg-primary/90 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer btn-press"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
        </motion.div>
      ) : (
        <HeaderSkeleton />
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ClipboardIcon className="w-5 h-5" />}
          label="To Do"
          value={stats.todo}
          color="bg-light-text-tertiary dark:bg-dark-text-tertiary"
          delay={0.1}
        />
        <StatCard
          icon={<ClockIcon className="w-5 h-5" />}
          label="In Progress"
          value={stats.inProgress}
          color="bg-primary"
          delay={0.15}
        />
        <StatCard
          icon={<EyeIcon className="w-5 h-5" />}
          label="Under Review"
          value={stats.underReview}
          color="bg-warning"
          delay={0.2}
        />
        <StatCard
          icon={<SquareCheckIcon className="w-5 h-5" />}
          label="Completed"
          value={stats.completed}
          color="bg-success"
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Upcoming & Sprint */}
        <div className="space-y-6 lg:col-span-2">
          {/* Upcoming Due Dates */}
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 bg-bg-surface border border-border rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center font-serif text-lg font-bold tracking-tight text-text-primary">
                <CalendarIcon className="w-5 h-5 mr-2.5 text-primary" />
                Upcoming Deadlines
              </h2>
              <Link
                to="/my-tasks"
                aria-label="View all tasks"
                className="text-sm font-medium transition-colors duration-150 text-primary hover:text-accent-primary-dark"
              >
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-bg-hover rounded-xl animate-pulse" />
                ))}
              </div>
            ) : upcomingTasks.length > 0 ? (
              <div className="flex flex-col">
                {upcomingTasks.map((task, index) => (
                  <UpcomingTaskItem
                    key={task._id}
                    task={task}
                    onClick={setSelectedTask}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No tasks due in the next 7 days. You're all caught up!" />
            )}
          </motion.div>

          {/* Current Sprint Progress */}
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 bg-bg-surface border border-border rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center font-serif text-lg font-bold tracking-tight text-text-primary">
                <ActivityIcon className="w-5 h-5 mr-2.5 text-warning" />
                Current Sprint Progress
              </h2>
              <span className="px-3 py-1 text-xs font-semibold border rounded-lg bg-accent-warning/10 text-warning border-accent-warning/20">
                Sprint 4: Q3 Goals
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-text-secondary">Expected Completion</p>
                  <p className="text-2xl font-bold tracking-tight text-text-primary">68%</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm font-medium text-text-secondary">Time Remaining</p>
                  <p className="text-sm font-bold text-danger">4 Days</p>
                </div>
              </div>
              {/* Animated progress bar */}
              <div
                className="relative w-full h-3 overflow-hidden rounded-full bg-light-border/80 dark:bg-dark-border/80"
                role="progressbar"
                aria-valuenow={68}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Sprint completion progress"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{
                    duration: 1.2,
                    delay: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-warning to-amber-400"
                />
                {/* Shimmer effect on progress bar */}
                <div
                  className="absolute inset-y-0 left-0 w-full animate-pulse bg-bg-hover"
                  style={{ width: "68%" }}
                />
              </div>
              {/* Completion rate summary */}
              <div className="flex items-center justify-between pt-2 border-t border-light-border/40 dark:border-dark-border/40">
                <p className="text-xs text-text-muted">Overall task completion</p>
                <p className="text-sm font-semibold text-success">{completionRate}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-1">
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full p-6 bg-bg-surface border border-border rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center font-serif text-lg font-bold tracking-tight text-text-primary">
                <ClockIcon className="w-5 h-5 mr-2.5 text-success" />
                Recent Activity
              </h2>
              <span className="text-xs font-medium text-text-muted">Last 5 updates</span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-2 h-2 mt-2 rounded-full bg-bg-hover" />
                    <div className="flex-1 space-y-2">
                      <div className="w-3/4 h-4 rounded bg-bg-hover" />
                      <div className="w-1/2 h-3 rounded bg-bg-hover" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="flex flex-col -mx-2">
                {recentTasks.map((task, index) => (
                  <RecentActivityItem
                    key={task._id}
                    task={task}
                    onClick={setSelectedTask}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="flex justify-center mb-3 text-text-muted">
                  <TriangleAlertIcon className="w-10 h-10 opacity-50" />
                </div>
                <p className="text-sm font-medium text-text-secondary">
                  No recent activity detected.
                </p>
                <p className="mt-1 text-xs text-text-muted">Tasks you work on will appear here.</p>
              </div>
            )}

            <button
              type="button"
              aria-label="View full activity log"
              className="w-full py-3 mt-6 text-sm font-semibold transition-all duration-200 border rounded-xl text-text-secondary border-light-border/60 dark:border-dark-border/60 hover:bg-bg-hover hover:border-light-border dark:hover:border-dark-border active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
            >
              View Activity Log
            </button>
          </motion.div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onProjectCreated={() => setCreateProjectModalOpen(false)}
      />

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          isOpen={!!selectedTask}
          onClose={() => {
            setSelectedTask(null)
          }}
          task={selectedTask}
          members={[{ user: user }]}
          onTaskUpdated={() => {
            fetchDashboardData()
            setSelectedTask(null)
          }}
        />
      )}
    </div>
  )
}

export default Overview
