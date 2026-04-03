import dayjs from "dayjs"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiClock,
  FiEye,
  FiPlus,
  FiUsers,
} from "react-icons/fi"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/customHook.js"
import apiService from "../../service/apiService.js"
import { EmptyState, NetworkError, ServerError } from "../components/ErrorStates.jsx"
import CreateProjectModal from "../components/project/CreateProjectModal.jsx"
import ProjectCardSkeleton from "../components/project/ProjectCardSkeleton.jsx"
import { Skeleton, SkeletonCard, SkeletonCircle, SkeletonText } from "../components/Skeleton.jsx"
import TaskDetailPanel from "../components/task/TaskDetailPanel.jsx"

const OverviewSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="space-y-8 p-8 max-w-[1400px] mx-auto"
  >
    <div className="flex animate-pulse items-center justify-between">
      <div>
        <div className="mb-3 h-10 w-64 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover" />
        <div className="h-6 w-80 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover" />
      </div>
      <div className="hidden h-6 w-48 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover md:block" />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} className="p-6 h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <SkeletonCard className="p-6 h-48" />
        <SkeletonCard className="p-6 h-40" />
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
  <div className="flex animate-pulse items-center justify-between">
    <div>
      <div className="mb-3 h-10 w-64 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover" />
      <div className="h-6 w-80 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover" />
    </div>
    <div className="hidden h-6 w-48 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover md:block" />
  </div>
)

const StatCard = ({ icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="card group p-6"
  >
    <div className="mb-4 flex items-center justify-between">
      <div
        className={`p-3 rounded-xl ${color} transition-transform duration-200 group-hover:scale-110 flex items-center justify-center text-white shadow-sm`}
      >
        {icon}
      </div>
    </div>
    <div>
      <p className="text-light-text-primary dark:text-dark-text-primary mb-1 text-4xl font-sans font-bold py-1">
        {value}
      </p>
      <p className="text-light-text-secondary dark:text-dark-text-secondary font-medium">{label}</p>
    </div>
  </motion.div>
)

const RecentActivityItem = ({ task, onClick }) => (
  <div
    onClick={() => onClick(task)}
    className="flex items-start gap-4 p-4 border-b border-light-border dark:border-dark-border last:border-0 hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors rounded-xl cursor-pointer"
  >
    <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-accent-primary" />
    <div className="flex-1">
      <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary text-sm mb-1">
        {task.title}
      </h4>
      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2 line-clamp-1">
        {task.description}
      </p>
      <div className="flex gap-2">
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-light-bg-hover dark:bg-dark-bg-hover text-light-text-tertiary dark:text-dark-text-tertiary">
          {task.status.replace("-", " ")}
        </span>
      </div>
    </div>
    <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary flex-shrink-0 whitespace-nowrap">
      {dayjs(task.updatedAt).fromNow
        ? dayjs(task.updatedAt).fromNow()
        : dayjs(task.updatedAt).format("MMM D")}
    </div>
  </div>
)

const UpcomingTaskItem = ({ task, onClick }) => {
  const isUrgent = dayjs(task.dueDate).diff(dayjs(), "day") <= 1
  return (
    <div
      onClick={() => onClick(task)}
      className={`flex items-center justify-between p-4 rounded-xl border ${isUrgent ? "border-accent-danger/30 bg-accent-danger/5" : "border-light-border dark:border-dark-border"} mb-3 cursor-pointer hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${isUrgent ? "bg-accent-danger text-white" : "bg-light-bg-hover dark:bg-dark-bg-hover text-light-text-tertiary dark:text-dark-text-tertiary"}`}
        >
          <FiCalendar className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary text-sm">
            {task.title}
          </h4>
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
    </div>
  )
}

const Overview = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
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

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [tasksResponse] = await Promise.all([apiService.getAllTaskOfUser()])

      if (tasksResponse.success) {
        const tasksData = tasksResponse.data

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
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
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
    <div className="space-y-8 p-8 max-w-[1400px] mx-auto">
      {/* Header Section */}
      {user ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              {getGreeting()}, {user.fullname?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
              Here is what's happening across your workspace today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center p-3 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl text-light-text-secondary dark:text-dark-text-secondary font-medium border border-light-border dark:border-dark-border shadow-sm">
              <FiCalendar className="mr-2" />
              {dayjs().format("dddd, MMMM D, YYYY")}
            </div>
            <button onClick={() => setCreateProjectModalOpen(true)} className="btn-primary">
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
          icon={<FiClipboard className="h-6 w-6" />}
          label="To Do"
          value={stats.todo}
          color="bg-light-text-tertiary dark:bg-dark-text-tertiary"
          delay={0.1}
        />
        <StatCard
          icon={<FiClock className="h-6 w-6" />}
          label="In Progress"
          value={stats.inProgress}
          color="bg-accent-primary"
          delay={0.2}
        />
        <StatCard
          icon={<FiEye className="h-6 w-6" />}
          label="Under Review"
          value={stats.underReview}
          color="bg-accent-warning"
          delay={0.3}
        />
        <StatCard
          icon={<FiCheckSquare className="h-6 w-6" />}
          label="Completed"
          value={stats.completed}
          color="bg-accent-success"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upcoming & Sprint */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Due Dates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-serif text-light-text-primary dark:text-dark-text-primary flex items-center">
                <FiCalendar className="mr-2 text-accent-primary" />
                Upcoming Deadlines
              </h2>
              <Link
                to="/my-tasks"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-serif text-light-text-primary dark:text-dark-text-primary flex items-center">
                <FiActivity className="mr-2 text-accent-warning" />
                Current Sprint Progress
              </h2>
              <span className="text-xs font-semibold px-3 py-1 bg-accent-warning/10 text-accent-warning rounded-full">
                Sprint 4: Q3 Goals
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Expected Completion
                  </p>
                  <p className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                    68%
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    Time Remaining
                  </p>
                  <p className="text-sm font-bold text-accent-danger">4 Days</p>
                </div>
              </div>
              <div className="w-full h-3 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                <div className="h-full bg-accent-warning" style={{ width: "68%" }} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="card h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-serif text-light-text-primary dark:text-dark-text-primary flex items-center">
                <FiClock className="mr-2 text-accent-success" />
                Recent Activity
              </h2>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-light-bg-hover dark:bg-dark-bg-hover mt-2" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-light-bg-hover dark:bg-dark-bg-hover rounded w-3/4" />
                      <div className="h-3 bg-light-bg-hover dark:bg-dark-bg-hover rounded w-1/2" />
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
              <div className="text-center py-10">
                <div className="text-light-text-tertiary dark:text-dark-text-tertiary mb-3 flex justify-center">
                  <FiAlertCircle className="w-8 h-8" />
                </div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  No recent activity detected.
                </p>
              </div>
            )}

            <button className="w-full mt-6 py-3 border border-light-border dark:border-dark-border rounded-xl font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors">
              View Activity Log
            </button>
          </motion.div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onProjectCreated={() => {}} // Handle globally typically
      />

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          isOpen={!!selectedTask}
          onClose={() => {
            setSelectedTask(null)
            fetchDashboardData()
          }}
          task={selectedTask}
          members={[{ user: user }]}
          onTaskUpdated={(updatedTask) => {
            fetchDashboardData()
          }}
        />
      )}
    </div>
  )
}

export default Overview
