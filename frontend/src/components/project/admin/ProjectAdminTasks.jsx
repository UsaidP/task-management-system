import { useMemo, useState } from "react"
import { TriangleAlertIcon, LayersIcon } from "@animateicons/react/lucide"

const ProjectAdminTasks = ({ stats }) => {
  const [statusFilter, setStatusFilter] = useState("")
  const taskStatus = stats?.taskStatusCounts || {}

  const statusBreakdown = useMemo(() => {
    const _total = stats?.totalTasks || 0
    return [
      {
        status: "todo",
        label: "To Do",
        count: taskStatus.todo || 0,
        color: "bg-light-border dark:bg-dark-border",
      },
      {
        status: "in-progress",
        label: "In Progress",
        count: taskStatus["in-progress"] || 0,
        color: "bg-accent-warning",
      },
      {
        status: "under-review",
        label: "Under Review",
        count: taskStatus["under-review"] || 0,
        color: "bg-accent-primary",
      },
      {
        status: "completed",
        label: "Completed",
        count: taskStatus.completed || 0,
        color: "bg-accent-success",
      },
    ]
  }, [taskStatus, stats])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statusBreakdown.map(({ status, label, count, color }) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
            className={`rounded-xl border p-4 text-center transition-all ${
              statusFilter === status
                ? "border-accent-primary ring-2 ring-accent-primary/20"
                : "border-light-border dark:border-dark-border"
            } bg-light-bg-secondary dark:bg-dark-bg-tertiary`}
          >
            <div className={`mx-auto mb-2 h-3 w-3 rounded-full ${color}`} />
            <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
              {count}
            </p>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              {label}
            </p>
          </button>
        ))}
      </div>

      {/* Bar Chart Visualization */}
      {stats?.totalTasks > 0 && (
        <div className="rounded-xl border border-light-border bg-light-bg-secondary p-5 dark:border-dark-border dark:bg-dark-bg-tertiary">
          <h3 className="mb-4 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            Task Distribution
          </h3>
          <div className="flex items-end gap-3" style={{ height: "120px" }}>
            {statusBreakdown.map(({ status, label, count }) => {
              const maxCount = Math.max(...statusBreakdown.map((s) => s.count), 1)
              const heightPct = (count / maxCount) * 100
              return (
                <div key={status} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    {count}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all ${statusBreakdown.find((s) => s.status === status)?.color}`}
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                  />
                  <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Overdue Tasks Section */}
      {stats?.overdueTasks > 0 && (
        <div className="rounded-xl border border-accent-danger/20 bg-accent-danger/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <TriangleAlertIcon className="h-4 w-4 text-accent-danger" />
            <h3 className="text-sm font-semibold text-accent-danger">
              {stats.overdueTasks} Overdue Task{stats.overdueTasks > 1 ? "s" : ""}
            </h3>
          </div>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            There are tasks that have passed their due date. Consider following up with assignees.
          </p>
        </div>
      )}

      {/* Unassigned Tasks */}
      {stats?.totalTasks > 0 && (
        <div className="rounded-xl border border-light-border bg-light-bg-secondary p-5 dark:border-dark-border dark:bg-dark-bg-tertiary">
          <h3 className="mb-3 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            Task Completion
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 flex-shrink-0">
              <svg
                className="h-full w-full -rotate-90"
                viewBox="0 0 36 36"
                role="img"
                aria-label="Task completion progress"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  className="stroke-light-border dark:stroke-dark-border"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  className="stroke-accent-success"
                  strokeWidth="3"
                  strokeDasharray={
                    stats.totalTasks > 0
                      ? `${(taskStatus.completed / stats.totalTasks) * 100} ${100 - (taskStatus.completed / stats.totalTasks) * 100}`
                      : "0 100"
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">
                  {stats.totalTasks > 0
                    ? Math.round((taskStatus.completed / stats.totalTasks) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                <span className="font-semibold text-accent-success">{taskStatus.completed}</span> of{" "}
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.totalTasks}
                </span>{" "}
                tasks completed
              </p>
              <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                {stats.totalTasks - taskStatus.completed} tasks remaining
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats?.totalTasks === 0 && (
        <div className="rounded-xl border border-light-border bg-light-bg-secondary p-12 text-center dark:border-dark-border dark:bg-dark-bg-tertiary">
          <LayersIcon className="mx-auto mb-4 h-12 w-12 text-light-text-tertiary dark:text-dark-text-tertiary opacity-50" />
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
            No Tasks Yet
          </h3>
          <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Start by creating your first task for this project.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProjectAdminTasks
