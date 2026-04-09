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

const StatCard = ({ icon: Icon, label, value, color, bgGradient }) => (
  <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-bg-secondary p-5 dark:bg-dark-bg-tertiary shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
        <p className="mt-1 text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
          {value ?? 0}
        </p>
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgGradient}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
  </div>
)

const QuickAction = ({ icon: Icon, label, onClick, color = "text-accent-primary" }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-lg border border-light-border px-4 py-3 text-left transition-colors hover:bg-light-bg-hover dark:border-dark-border dark:bg-dark-bg-tertiary dark:hover:bg-dark-bg-hover"
  >
    <Icon className={`h-5 w-5 ${color}`} />
    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
      {label}
    </span>
  </button>
)

const ProjectAdminOverview = ({ stats }) => {
  const taskStatus = stats?.taskStatusCounts || {}

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
        <div className="rounded-xl border border-light-border bg-light-bg-secondary p-4 dark:border-dark-border dark:bg-dark-bg-tertiary">
          <div className="flex items-center gap-2">
            <FiUsers className="h-4 w-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Members
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {stats?.memberCount ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-light-border bg-light-bg-secondary p-4 dark:border-dark-border dark:bg-dark-bg-tertiary">
          <div className="flex items-center gap-2">
            <FiZap className="h-4 w-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Active Sprints
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {stats?.sprintCount ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-light-border bg-light-bg-secondary p-4 dark:border-dark-border dark:bg-dark-bg-tertiary">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="h-4 w-4 text-light-text-tertiary dark:text-dark-text-tertiary" />
            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Under Review
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {taskStatus["under-review"] ?? 0}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {stats?.totalTasks > 0 && (
        <div className="rounded-xl border border-light-border bg-light-bg-secondary p-5 dark:border-dark-border dark:bg-dark-bg-tertiary">
          <h3 className="mb-3 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            Task Progress
          </h3>
          <div className="flex h-3 overflow-hidden rounded-full bg-light-bg-primary dark:bg-dark-bg-primary">
            {stats.totalTasks > 0 && (
              <>
                <div
                  className="bg-accent-success transition-all"
                  style={{ width: `${(taskStatus.completed / stats.totalTasks) * 100}%` }}
                  title={`Completed: ${taskStatus.completed}`}
                />
                <div
                  className="bg-accent-warning transition-all"
                  style={{ width: `${(taskStatus["in-progress"] / stats.totalTasks) * 100}%` }}
                  title={`In Progress: ${taskStatus["in-progress"]}`}
                />
                <div
                  className="bg-accent-primary transition-all"
                  style={{ width: `${(taskStatus["under-review"] / stats.totalTasks) * 100}%` }}
                  title={`Under Review: ${taskStatus["under-review"]}`}
                />
                <div
                  className="bg-light-border transition-all dark:bg-dark-border"
                  style={{ width: `${(taskStatus.todo / stats.totalTasks) * 100}%` }}
                  title={`To Do: ${taskStatus.todo}`}
                />
              </>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-light-text-secondary dark:text-dark-text-secondary">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-accent-success" /> Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-accent-warning" /> In Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-accent-primary" /> Under Review
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-light-border dark:bg-dark-border" /> To Do
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-xl border border-light-border bg-light-bg-secondary p-5 dark:border-dark-border dark:bg-dark-bg-tertiary">
        <h3 className="mb-3 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <QuickAction
            icon={FiPlus}
            label="Create Task"
            onClick={() => {
              /* navigate to create task */
            }}
            color="text-accent-primary"
          />
          <QuickAction
            icon={FiUserPlus}
            label="Add Member"
            onClick={() => {
              /* open add member modal */
            }}
            color="text-accent-info"
          />
          <QuickAction
            icon={FiZap}
            label="Start Sprint"
            onClick={() => {
              /* navigate to sprint */
            }}
            color="text-accent-warning"
          />
        </div>
      </div>
    </div>
  )
}

export default ProjectAdminOverview
