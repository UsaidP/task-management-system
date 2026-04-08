const projectColors = [
  "bg-accent-primary",
  "bg-accent-info",
  "bg-accent-success",
  "bg-accent-warning",
  "bg-accent-danger",
  "bg-accent-purple",
]

export default function AdminProjectProgress({ projects, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 shadow-sm">
        <div className="animate-pulse h-6 w-32 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse h-8 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded mb-2"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-serif">
            Project Progress
          </h3>
          <p className="text-sm text-light-text-tertiary">Active project milestones</p>
        </div>
      </div>
      <div className="space-y-5">
        {(projects || []).map((project, index) => (
          <div key={project._id || index}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${projectColors[index % projectColors.length]}`}
                />
                <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  {project.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-light-text-tertiary">{project.totalTasks} tasks</span>
                <span className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                  {project.progress}%
                </span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
              <div
                className={`h-full rounded-full ${projectColors[index % projectColors.length]} transition-all duration-700`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        ))}
        {(projects || []).length === 0 && (
          <p className="text-center text-sm text-light-text-tertiary py-8">No projects found</p>
        )}
      </div>
    </div>
  )
}
