import dayjs from "dayjs"

const ProjectActivityPanel = ({ tasks, members }) => {
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 5)

  return (
    <div className="flex-1 max-w-[340px] border-r border-light-border dark:border-dark-border pr-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">Recent Activity</h3>
        <span className="text-xs text-accent-primary dark:text-accent-primary-light cursor-pointer font-medium">View All</span>
      </div>
      <div className="flex flex-col gap-3">
        {recentTasks.length === 0 ? (
          <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">No recent activity</p>
        ) : (
          recentTasks.map((task) => {
            const member = members.find((m) => m.user?._id === task.createdBy)
            const initials = member?.user?.fullname?.slice(0, 2).toUpperCase() || "U"
            const colorClass =
              task.status === "completed"
                ? "from-accent-success to-accent-success-light"
                : task.status === "in-progress"
                  ? "from-accent-primary to-accent-primary-light"
                  : task.status === "under-review"
                    ? "from-accent-warning to-accent-warning-light"
                    : "from-accent-info to-accent-info-light"

            return (
              <div key={task._id} className="flex gap-2.5 items-start">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-xs text-white font-bold flex-shrink-0`}>
                  {initials}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                    {task.status === "completed" ? "Completed" : "Updated"} task{" "}
                    <span className="text-accent-primary dark:text-accent-primary-light">{task.title}</span>
                  </p>
                  <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                    {dayjs(task.updatedAt).fromNow()}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ProjectActivityPanel
