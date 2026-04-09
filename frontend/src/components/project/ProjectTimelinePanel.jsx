import dayjs from "dayjs"

const ProjectTimelinePanel = ({ project, columns }) => {
  const today = dayjs()
  const statusPhases = [
    { status: "todo", label: "To Do", color: "#8B8178" },
    { status: "in-progress", label: "In Progress", color: "#C4654A" },
    { status: "under-review", label: "Under Review", color: "#D4A548" },
    { status: "completed", label: "Completed", color: "#7A9A6D" },
  ]

  const statusData = statusPhases.map((phase) => ({
    ...phase,
    count: columns[phase.status]?.tasks?.length || 0,
  }))

  const totalTasksCount = statusData.reduce((sum, p) => sum + p.count, 0)
  const statusWithPercent = statusData.map((phase, idx) => {
    const percentage = totalTasksCount > 0 ? (phase.count / totalTasksCount) * 100 : 0
    const leftOffset = statusData
      .slice(0, idx)
      .reduce((sum, p) => sum + ((p.count / totalTasksCount) * 100 || 0), 0)
    return {
      ...phase,
      left: totalTasksCount > 0 ? leftOffset : idx * 25,
      width: totalTasksCount > 0 ? percentage : 25,
      text: phase.count > 0 ? `${phase.count} tasks` : "",
    }
  })

  // Project duration bar
  const durationPhases = []
  if (project?.startDate && project?.endDate) {
    const start = dayjs(project.startDate)
    const end = dayjs(project.endDate)
    const totalDuration = end.diff(start, "day")
    const elapsed = today.diff(start, "day")
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
    durationPhases.push({
      label: "Project Duration",
      left: 0,
      width: 100,
      color: progress > 50 ? "#7A9A6D" : "#C4654A",
      text: `${Math.round(progress)}% complete`,
    })
  }

  return (
    <div className="flex-1.5 pl-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">
          Project Timeline
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            className="px-2.5 py-1 text-xs rounded border border-light-border dark:border-dark-border text-light-text-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
          >
            Week
          </button>
          <button
            type="button"
            className="px-2.5 py-1 text-xs rounded bg-light-border dark:bg-dark-border text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
          >
            Month
          </button>
          <button
            type="button"
            className="px-2.5 py-1 text-xs rounded border border-light-border dark:border-dark-border text-light-text-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
          >
            Quarter
          </button>
        </div>
      </div>
      <div className="flex gap-0 mb-1.5 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
        <div className="flex-1 text-center">{today.subtract(1, "month").format("MMM YYYY")}</div>
        <div className="flex-1 text-center">{today.format("MMM YYYY")}</div>
        <div className="flex-1 text-center">{today.add(1, "month").format("MMM YYYY")}</div>
        <div className="flex-1 text-center">{today.add(2, "month").format("MMM YYYY")}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        {durationPhases.map((phase) => (
          <div key={phase.label} className="flex items-center gap-2.5">
            <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary w-20 flex-shrink-0">
              {phase.label}
            </span>
            <div className="flex-1 h-2.5 bg-light-bg-hover dark:bg-dark-bg-hover rounded relative overflow-visible">
              {phase.width > 0 && (
                <div
                  className="absolute h-2.5 rounded flex items-center justify-end pr-1 transition-all"
                  style={{
                    left: `${phase.left}%`,
                    width: `${phase.width}%`,
                    backgroundColor: phase.color,
                  }}
                >
                  <span className="text-xs font-semibold text-white/80 whitespace-nowrap">
                    {phase.text}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {statusWithPercent.map((phase) => (
          <div key={phase.label} className="flex items-center gap-2.5">
            <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary w-20 flex-shrink-0">
              {phase.label}
            </span>
            <div className="flex-1 h-2.5 bg-light-bg-hover dark:bg-dark-bg-hover rounded relative overflow-visible">
              {phase.width > 0 && (
                <div
                  className="absolute h-2.5 rounded flex items-center justify-end pr-1 transition-all"
                  style={{
                    left: `${phase.left}%`,
                    width: `${phase.width}%`,
                    backgroundColor: phase.color,
                  }}
                >
                  <span className="text-xs font-semibold text-white/80 whitespace-nowrap">
                    {phase.text}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectTimelinePanel
