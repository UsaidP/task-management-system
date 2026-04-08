import { ArrowUpDown, Download, Filter } from "lucide-react"

const statusColors = {
  "in-progress": "status-in-progress",
  completed: "status-completed",
  "under-review": "status-under-review",
  todo: "status-todo",
}

const priorityColors = {
  urgent: "priority-urgent",
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
}

export default function AdminRecentTasks({ tasks, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 shadow-sm">
        <div className="animate-pulse h-6 w-32 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="animate-pulse h-10 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded mb-2"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary shadow-sm">
      <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-serif">
            Recent Tasks
          </h3>
          <p className="text-sm text-light-text-tertiary">Showing {tasks?.length || 0} tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-light-border dark:border-dark-border px-3 py-1.5 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-light-border dark:border-dark-border px-3 py-1.5 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover">
            <ArrowUpDown size={14} /> Sort
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-light-border dark:border-dark-border px-3 py-1.5 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                Assignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                Priority
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border">
            {(tasks || []).map((task) => {
              const assignee = task.assignedTo?.[0] || task.createdBy || {}
              const initials = (assignee.fullname || "A")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
              return (
                <tr
                  key={task._id}
                  className="group hover:bg-light-bg-hover/50 dark:hover:bg-dark-bg-hover/50"
                >
                  <td className="px-6 py-3.5">
                    <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      {task.title}
                    </p>
                    <p className="text-xs text-light-text-tertiary">{task._id?.slice(-6)}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-primary text-[10px] font-bold text-light-text-inverse">
                        {initials}
                      </div>
                      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {assignee.fullname || "Unassigned"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status] || "bg-light-bg-tertiary text-light-text-tertiary"}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[task.priority] || "bg-light-bg-tertiary text-light-text-tertiary"}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="text-xs text-light-text-tertiary capitalize">
                      {task.project?.name || "—"}
                    </span>
                  </td>
                </tr>
              )
            })}
            {(tasks || []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-light-text-tertiary">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
