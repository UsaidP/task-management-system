import { ArrowRight, CheckCircle2, MessageSquare, Plus, UserPlus } from "lucide-react"

const _iconMap = {
  completed: <CheckCircle2 size={14} />,
  created: <Plus size={14} />,
  assigned: <UserPlus size={14} />,
  updated: <ArrowRight size={14} />,
  commented: <MessageSquare size={14} />,
}

const _iconColors = {
  completed: "text-accent-success bg-accent-success/10",
  created: "text-accent-warning bg-accent-warning/10",
  updated: "text-accent-info bg-accent-info/10",
  assigned: "text-accent-primary bg-accent-primary/10",
  commented: "text-accent-purple bg-accent-purple/10",
}

function _getActivityColor(status) {
  switch (status) {
    case "created":
      return "bg-accent-success/10 text-accent-success"
    case "in-progress":
      return "bg-accent-warning/10 text-accent-warning"
    case "under-review":
      return "bg-accent-info/10 text-accent-info"
    case "completed":
      return "bg-accent-success/10 text-accent-success"
    case "todo":
      return "bg-light-bg-tertiary text-light-text-tertiary"
    default:
      return "text-light-text-tertiary bg-light-bg-tertiary"
  }
}

export default function AdminActivityFeed({ tasks, loading }) {
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

  // Generate activities from recent tasks
  const activities = (tasks || []).slice(0, 7).map((task) => {
    const author = task.createdBy || {}
    const initials = (author.fullname || "A")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    const actionType = task.status === "completed" ? "completed" : "created"
    return {
      user: author.fullname || "Unknown",
      initials,
      action: actionType,
      target: task.title,
      status: task.status,
      createdAt: task.createdAt,
    }
  })

  const timeAgo = (date) => {
    if (!date) return "recently"
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return (
    <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-serif">
            Recent Activity
          </h3>
          <p className="text-sm text-light-text-tertiary">Latest team updates</p>
        </div>
      </div>

      <div className="space-y-0">
        {activities.length === 0 && (
          <p className="text-sm text-light-text-tertiary text-center py-8">No recent activity</p>
        )}
        {activities.map((activity, index) => (
          <div
            key={`${activity.user}-${activity.createdAt}-${index}`}
            className="group relative flex gap-3 py-3"
          >
            {index < activities.length - 1 && (
              <div className="absolute left-[19px] top-[52px] bottom-0 w-px bg-light-border dark:bg-dark-border" />
            )}

            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${activity.status === "completed" ? "bg-accent-success" : "bg-accent-primary"} text-xs font-bold text-light-text-inverse`}
            >
              {activity.initials}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {activity.user}
                </span>{" "}
                {activity.action === "completed" ? "completed" : "created"}{" "}
                <span className="font-medium text-accent-primary">{activity.target}</span>
              </p>
              <p className="mt-1 flex items-center gap-2 text-xs text-light-text-tertiary">
                {timeAgo(activity.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
