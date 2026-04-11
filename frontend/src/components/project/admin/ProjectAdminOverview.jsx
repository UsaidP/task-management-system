import { useNavigate } from "react-router-dom"
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiPlus,
  FiUserPlus,
  FiUsers,
  FiZap,
} from "react-icons/fi"

const StatCard = ({ icon: Icon, label, value, color, bgGradient, trend }) => (
  <div className="group relative overflow-hidden rounded-xl border border-light-border bg-light-bg-secondary p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-dark-border dark:bg-dark-bg-tertiary">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
          {label}
        </p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-light-text-primary dark:text-dark-text-primary">
          {value ?? 0}
        </p>
        {trend !== undefined && (
          <p
            className={`mt-1 flex items-center gap-1 text-xs font-medium ${
              trend >= 0 ? "text-accent-success" : "text-accent-danger"
            }`}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% from last week
          </p>
        )}
      </div>
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${bgGradient}`}
      >
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
  </div>
)

const QuickAction = ({ icon: Icon, label, description, onClick, color = "text-accent-primary", bgGradient = "bg-accent-primary/10" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative flex w-full flex-col items-start gap-3 rounded-xl border border-light-border bg-light-bg-primary p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-accent-primary/20 dark:border-dark-border dark:bg-dark-bg-tertiary dark:hover:ring-accent-primary/30`}
    aria-label={label}
  >
    <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${bgGradient} transition-transform duration-200 group-hover:scale-110`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <div className="flex-1">
      <span className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
        {label}
      </span>
      <span className="mt-0.5 block text-xs text-light-text-secondary dark:text-dark-text-secondary">
        {description}
      </span>
    </div>
    <svg
      className="absolute right-4 top-4 h-4 w-4 text-light-text-tertiary transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent-primary dark:text-dark-text-tertiary dark:group-hover:text-accent-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </button>
)

const ProjectAdminOverview = ({ stats, projectId }) => {
  const navigate = useNavigate()
  const taskStatus = stats?.taskStatusCounts || {}

  const handleCreateTask = () => {
    navigate(`/project/${projectId}/tasks/new`)
  }

  const handleAddMember = () => {
    // Navigate to members tab
    const membersTab = document.querySelector('[data-tab="members"]')
    if (membersTab) {
      membersTab.click()
    }
  }

  const handleStartSprint = () => {
    navigate(`/project/${projectId}/sprints`)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={FiLayers}
          label="Total Tasks"
          value={stats?.totalTasks}
          color="text-accent-primary"
          bgGradient="bg-accent-primary/10"
          trend={stats?.trend}
        />
        <StatCard
          icon={FiCheckCircle}
          label="Completed"
          value={taskStatus.completed}
          color="text-accent-success"
          bgGradient="bg-accent-success/10"
        />
        <StatCard
          icon={FiClock}
          label="In Progress"
          value={taskStatus["in-progress"]}
          color="text-accent-warning"
          bgGradient="bg-accent-warning/10"
        />
        <StatCard
          icon={FiAlertTriangle}
          label="Overdue"
          value={stats?.overdueTasks}
          color="text-accent-danger"
          bgGradient="bg-accent-danger/10"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-light-border bg-light-bg-secondary p-4 shadow-sm dark:border-dark-border dark:bg-dark-bg-tertiary">
          <div className="flex items-center gap-2">
            <FiUsers className="h-4 w-4 text-accent-info" />
            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Members
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-light-text-primary dark:text-dark-text-primary">
            {stats?.memberCount ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-light-border bg-light-bg-secondary p-4 shadow-sm dark:border-dark-border dark:bg-dark-bg-tertiary">
          <div className="flex items-center gap-2">
            <FiZap className="h-4 w-4 text-accent-warning" />
            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Active Sprints
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-light-text-primary dark:text-dark-text-primary">
            {stats?.sprintCount ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-light-border bg-light-bg-secondary p-4 shadow-sm dark:border-dark-border dark:bg-dark-bg-tertiary">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="h-4 w-4 text-accent-purple" />
            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Under Review
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-light-text-primary dark:text-dark-text-primary">
            {taskStatus["under-review"] ?? 0}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {stats?.totalTasks > 0 && (
        <div className="rounded-xl border border-light-border bg-light-bg-secondary p-5 shadow-sm dark:border-dark-border dark:bg-dark-bg-tertiary">
          <h3 className="mb-3 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            Task Progress
          </h3>
          <div className="flex h-3 overflow-hidden rounded-full bg-light-bg-primary dark:bg-dark-bg-primary">
            {stats.totalTasks > 0 && (
              <>
                <div
                  className="bg-accent-success transition-all duration-300"
                  style={{ width: `${(taskStatus.completed / stats.totalTasks) * 100}%` }}
                  title={`Completed: ${taskStatus.completed}`}
                  role="progressbar"
                  aria-valuenow={taskStatus.completed}
                  aria-valuemin={0}
                  aria-valuemax={stats.totalTasks}
                  aria-label={`Completed: ${taskStatus.completed}`}
                />
                <div
                  className="bg-accent-warning transition-all duration-300"
                  style={{ width: `${(taskStatus["in-progress"] / stats.totalTasks) * 100}%` }}
                  title={`In Progress: ${taskStatus["in-progress"]}`}
                  role="progressbar"
                  aria-valuenow={taskStatus["in-progress"]}
                  aria-valuemin={0}
                  aria-valuemax={stats.totalTasks}
                  aria-label={`In Progress: ${taskStatus["in-progress"]}`}
                />
                <div
                  className="bg-accent-primary transition-all duration-300"
                  style={{ width: `${(taskStatus["under-review"] / stats.totalTasks) * 100}%` }}
                  title={`Under Review: ${taskStatus["under-review"]}`}
                  role="progressbar"
                  aria-valuenow={taskStatus["under-review"]}
                  aria-valuemin={0}
                  aria-valuemax={stats.totalTasks}
                  aria-label={`Under Review: ${taskStatus["under-review"]}`}
                />
                <div
                  className="bg-light-border transition-all duration-300 dark:bg-dark-border"
                  style={{ width: `${(taskStatus.todo / stats.totalTasks) * 100}%` }}
                  title={`To Do: ${taskStatus.todo}`}
                  role="progressbar"
                  aria-valuenow={taskStatus.todo}
                  aria-valuemin={0}
                  aria-valuemax={stats.totalTasks}
                  aria-label={`To Do: ${taskStatus.todo}`}
                />
              </>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-success" /> Completed ({taskStatus.completed})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-warning" /> In Progress ({taskStatus["in-progress"]})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-primary" /> Under Review ({taskStatus["under-review"]})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-light-border dark:bg-dark-border" /> To Do ({taskStatus.todo})
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-xl border border-light-border bg-light-bg-secondary p-5 shadow-sm dark:border-dark-border dark:bg-dark-bg-tertiary">
        <h3 className="mb-1 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
          Quick Actions
        </h3>
        <p className="mb-4 text-xs text-light-text-secondary dark:text-dark-text-secondary">
          Common tasks to get you started
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickAction
            icon={FiPlus}
            label="Create Task"
            description="Add a new task to the project"
            onClick={handleCreateTask}
            color="text-accent-primary"
            bgGradient="bg-accent-primary/10"
          />
          <QuickAction
            icon={FiUserPlus}
            label="Add Member"
            description="Invite someone to the project"
            onClick={handleAddMember}
            color="text-accent-info"
            bgGradient="bg-accent-info/10"
          />
          <QuickAction
            icon={FiZap}
            label="Start Sprint"
            description="Begin a new sprint cycle"
            onClick={handleStartSprint}
            color="text-accent-warning"
            bgGradient="bg-accent-warning/10"
          />
        </div>
      </div>
    </div>
  )
}

export default ProjectAdminOverview
