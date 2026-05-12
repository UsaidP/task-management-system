import Avatar from "../auth/Avatar"

const avatarColors = [
  "bg-accent-primary",
  "bg-accent-info",
  "bg-accent-success",
  "bg-accent-warning",
  "bg-accent-purple",
  "bg-accent-danger",
]

export default function AdminTeamMembers({ users, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
        <div className="animate-pulse h-6 w-32 bg-bg-elevated rounded mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse h-12 bg-bg-elevated rounded mb-2" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary font-serif">Team Members</h3>
          <p className="text-sm text-text-muted">{users?.length || 0} members</p>
        </div>
      </div>
      <div className="space-y-4">
        {(users || []).map((member, index) => {
          const progress =
            member.totalTasks > 0
              ? Math.round((member.completedTasks / member.totalTasks) * 100)
              : 0
          const _initials = (member.fullname || "U")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
          const _colorClass = avatarColors[index % avatarColors.length]

          return (
            <div
              key={member._id}
              className="group flex items-center gap-3 rounded-xl p-2 hover:bg-bg-hover transition-colors"
            >
              <Avatar
                src={member.avatar?.url || member.avatar}
                alt={member.fullname || "Team member"}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {member.fullname}
                  </p>
                  <span className="text-xs font-medium text-text-muted">{progress}%</span>
                </div>
                <p className="text-xs text-text-muted">{member.role}</p>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-bg-elevated">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-primary-light transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
        {(users || []).length === 0 && (
          <p className="text-center text-sm text-text-muted py-8">No team members found</p>
        )}
      </div>
    </div>
  )
}
