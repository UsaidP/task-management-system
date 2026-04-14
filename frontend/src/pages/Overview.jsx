import dayjs from "dayjs"
import { motion, useReducedMotion } from "framer-motion"
import { memo, useCallback, useEffect, useState } from "react"
import {
  FiActivity,
  FiAlertCircle,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiClock,
  FiEye,
  FiPlus,
} from "react-icons/fi"
import { Link } from "react-router-dom"
import apiService from "../../service/apiService.js"
import { EmptyState, NetworkError, ServerError } from "../components/ErrorStates.jsx"
import CreateProjectModal from "../components/project/CreateProjectModal.jsx"
import { SkeletonCard, SkeletonCircle, SkeletonText } from "../components/Skeleton.jsx"
import TaskDetailPanel from "../components/task/TaskDetailPanel.jsx"
import { useAuth } from "../contexts/customHook.js"

const OverviewSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="space-y-8 p-6 sm:p-8 max-w-[1400px] mx-auto"
  >
    <div className="flex items-center justify-between animate-pulse">
      <div>
        <div className="w-64 h-10 mb-3 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover" />
        <div className="h-6 rounded-lg w-80 bg-light-bg-hover dark:bg-dark-bg-hover" />
      </div>
      <div className="hidden w-48 h-6 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover md:block" />
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
      <div className="w-64 h-10 mb-3 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover" />
      <div className="h-6 rounded-lg w-80 bg-light-bg-hover dark:bg-dark-bg-hover" />
    </div>
    <div className="hidden w-48 h-6 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover md:block" />
  </div>
)

const StatCard = memo(({ icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="p-6 card group active:bg-light-bg-tertiary dark:active:bg-dark-bg-hover"
  >
    <div className="flex items-center justify-between mb-4">
      <div
        className={`p-3 rounded-xl ${color} transition-transform duration-200 group-hover:scale-110 flex items-center justify-center text-white shadow-sm`}
      >
        {icon}
      </div>
    </div>
    <div>
      <p className="py-1 mb-1 font-sans text-4xl font-bold text-light-text-primary dark:text-dark-text-primary">
        {value}
      </p>
      <p className="font-medium text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
    </div>
  </motion.div>
))
StatCard.displayName = "StatCard"

const RecentActivityItem = memo(({ task, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(task)}
    aria-label={`View task: ${task.title}`}
    className="flex items-start w-full gap-4 p-4 text-left transition-colors border-b cursor-pointer border-light-border dark:border-dark-border last:border-0 hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary active:bg-light-bg-tertiary dark:active:bg-dark-bg-hover focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary rounded-xl"
  >
    <div className="flex-shrink-0 w-2 h-2 mt-1 rounded-full bg-accent-primary" />
    <div className="flex-1">
      <h3 className="mb-1 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
        {task.title}
      </h3>
      <p className="mb-2 text-xs text-light-text-secondary dark:text-dark-text-secondary line-clamp-1">
        {task.description}
      </p>
      <div className="flex gap-2">
        <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-full bg-light-bg-hover dark:bg-dark-bg-hover text-light-text-tertiary dark:text-dark-text-tertiary">
          {task.status.replace("-", " ")}
        </span>
      </div>
    </div>
    <div className="flex-shrink-0 text-xs text-light-text-tertiary dark:text-dark-text-tertiary whitespace-nowrap">
      {dayjs(task.updatedAt).fromNow
        ? dayjs(task.updatedAt).fromNow()
        : dayjs(task.updatedAt).format("MMM D")}
    </div>
  </button>
))
RecentActivityItem.displayName = "RecentActivityItem"

const UpcomingTaskItem = memo(({ task, onClick }) => {
  const isUrgent = dayjs(task.dueDate).diff(dayjs(), "day") <= 1
  return (
    <button
      type="button"
      onClick={() => onClick(task)}
      aria-label={`View task: ${task.title}, due ${dayjs(task.dueDate).format("MMM D")}`}
      className={`flex items-center justify-between w-full p-4 rounded-xl border ${isUrgent ? "border-accent-danger/30 bg-accent-danger/5" : "border-light-border dark:border-dark-border"} mb-3 hover:shadow-sm active:shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary transition-shadow cursor-pointer text-left`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${isUrgent ? "bg-accent-danger text-white" : "bg-light-bg-hover dark:bg-dark-bg-hover text-light-text-tertiary dark:text-dark-text-tertiary"}`}
        >
          <FiCalendar className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            {task.title}
          </h3>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            {task.project?.name || "Personal"}
          </p>
        </div>
      </div>
      <div
        className={`text-sm font-medium ${isUrgent ? "text-accent-danger" : "text-light-text-primary dark:text-dark-text-primary"}`}
      >
        {dayjs(task.dueDate).format("MMM D")}
      </div>
    </button>
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
  }, [user])

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

  return (
    <div className="space-y-8 p-6 sm:p-8 max-w-[1400px] mx-auto">
      {/* Header Section */}
      {user ? (
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
        >
          <div>
            <h1 className="mb-2 font-serif text-4xl font-bold text-light-text-primary dark:text-dark-text-primary">
              {getGreeting()}, {user.fullname?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
              Here is what's happening across your workspace today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center p-3 font-medium border shadow-sm bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl text-light-text-secondary dark:text-dark-text-secondary border-light-border dark:border-dark-border">
              <FiCalendar className="mr-2" />
              {dayjs().format("dddd, MMMM D, YYYY")}
            </div>
            <button
              type="button"
              onClick={() => setCreateProjectModalOpen(true)}
              className="btn-primary"
            >
              <FiPlus className="mr-2" />
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
          icon={<FiClipboard className="w-6 h-6" />}
          label="To Do"
          value={stats.todo}
          color="bg-light-text-tertiary dark:bg-dark-text-tertiary"
          delay={0.1}
        />
        <StatCard
          icon={<FiClock className="w-6 h-6" />}
          label="In Progress"
          value={stats.inProgress}
          color="bg-accent-primary"
          delay={0.2}
        />
        <StatCard
          icon={<FiEye className="w-6 h-6" />}
          label="Under Review"
          value={stats.underReview}
          color="bg-accent-warning"
          delay={0.3}
        />
        <StatCard
          icon={<FiCheckSquare className="w-6 h-6" />}
          label="Completed"
          value={stats.completed}
          color="bg-accent-success"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Upcoming & Sprint */}
        <div className="space-y-8 lg:col-span-2">
          {/* Upcoming Due Dates */}
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center font-serif text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                <FiCalendar className="mr-2 text-accent-primary" />
                Upcoming Deadlines
              </h2>
              <Link
                to="/my-tasks"
                aria-label="View all tasks"
                className="text-sm font-medium text-accent-primary hover:text-accent-primary-dark"
              >
                View All
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-light-bg-hover dark:bg-dark-bg-hover rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : upcomingTasks.length > 0 ? (
              <div className="flex flex-col">
                {upcomingTasks.map((task) => (
                  <UpcomingTaskItem key={task._id} task={task} onClick={setSelectedTask} />
                ))}
              </div>
            ) : (
              <EmptyState message="No tasks due in the next 7 days. You're all caught up!" />
            )}
          </motion.div>

          {/* Current Sprint Progress Mock */}
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center font-serif text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                <FiActivity className="mr-2 text-accent-warning" />
                Current Sprint Progress
              </h2>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent-warning/10 text-accent-warning">
                Sprint 4: Q3 Goals
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Expected Completion
                  </p>
                  <p className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                    68%
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Time Remaining
                  </p>
                  <p className="text-sm font-bold text-accent-danger">4 Days</p>
                </div>
              </div>
              <div
                className="w-full h-3 overflow-hidden rounded-full bg-light-border dark:bg-dark-border"
                role="progressbar"
                aria-valuenow={68}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Sprint completion progress"
              >
                <div className="h-full bg-accent-warning" style={{ width: "68%" }} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-1">
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="h-full card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center font-serif text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                <FiClock className="mr-2 text-accent-success" />
                Recent Activity
              </h2>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-2 h-2 mt-2 rounded-full bg-light-bg-hover dark:bg-dark-bg-hover" />
                    <div className="flex-1 space-y-2">
                      <div className="w-3/4 h-4 rounded bg-light-bg-hover dark:bg-dark-bg-hover" />
                      <div className="w-1/2 h-3 rounded bg-light-bg-hover dark:bg-dark-bg-hover" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="flex flex-col">
                {recentTasks.map((task) => (
                  <RecentActivityItem key={task._id} task={task} onClick={setSelectedTask} />
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="flex justify-center mb-3 text-light-text-tertiary dark:text-dark-text-tertiary">
                  <FiAlertCircle className="w-8 h-8" />
                </div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  No recent activity detected.
                </p>
              </div>
            )}

            <button
              type="button"
              aria-label="View full activity log"
              className="w-full py-3 mt-6 text-sm font-semibold transition-colors border border-light-border dark:border-dark-border rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
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
