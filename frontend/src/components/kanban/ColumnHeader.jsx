const statusColors = {
  todo: { dot: "bg-task-status-todo" },
  "in-progress": { dot: "bg-task-status-progress" },
  "under-review": { dot: "bg-task-status-review" },
  completed: { dot: "bg-task-status-done" },
}

export { statusColors }

const ColumnHeader = ({
  title,
  count,
  totalCount,
  showFilterCount,
  status,
  children,
  className = "",
}) => {
  const taskText = (num) => (num === 1 ? "task" : "tasks")

  const colors = statusColors[status] || statusColors.todo

  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            {title}
          </h2>
          <span className="text-xs text-text-muted">
            {showFilterCount
              ? `${count} of ${totalCount} ${taskText(totalCount)}`
              : `${count} ${taskText(count)}`}
          </span>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

export default ColumnHeader
