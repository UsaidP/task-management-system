const ProjectTeamPanel = ({ members, tasks }) => {
  const memberStats = members
    .map((member) => {
      const userTasks = tasks.filter((t) =>
        t.assignedTo?.some(
          (a) => (typeof a === "object" ? a._id : a) === (member.user?._id || member.user)
        )
      )
      return {
        ...member,
        taskCount: userTasks.length,
        completedCount: userTasks.filter((t) => t.status === "completed").length,
      }
    })
    .sort((a, b) => b.taskCount - a.taskCount)

  const colors = [
    "from-accent-primary to-accent-primary-light",
    "from-accent-success to-accent-success-light",
    "from-accent-warning to-accent-warning-light",
    "from-accent-danger to-accent-danger-light",
    "from-accent-info to-accent-info-light",
  ]

  return (
    <div className="flex-1 max-w-sm border-r border-light-border dark:border-dark-border px-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">
          Team Performance
        </h2>
      </div>
      <div className="flex gap-4">
        {memberStats.length === 0 ? (
          <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            No team members
          </p>
        ) : (
          memberStats.slice(0, 5).map((member, idx) => (
            <div
              key={member.user?._id || idx}
              className="flex flex-col items-center gap-1.5 min-w-[70px]"
            >
              <div
                className={`w-9 h-9 rounded-full bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center text-sm text-white font-bold`}
              >
                {member.user?.fullname?.slice(0, 2).toUpperCase() || "U"}
              </div>
              <span className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary text-center truncate max-w-16">
                {member.user?.fullname?.split(" ")[0] || "User"}
              </span>
              <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                {member.taskCount || 0} tasks
              </span>
              <div
                className="w-14 h-0.5 rounded-full mt-0.5"
                style={{
                  backgroundColor:
                    member.taskCount > 0
                      ? member.completedCount / member.taskCount > 0.5
                        ? "#7A9A6D"
                        : "#C4654A"
                      : "#8B8178",
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProjectTeamPanel
