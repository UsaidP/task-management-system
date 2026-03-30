const statusColors = {
  todo: { dot: "bg-slate-400" },
  "in-progress": { dot: "bg-accent-primary" },
  "under-review": { dot: "bg-accent-warning" },
  completed: { dot: "bg-accent-success" },
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
        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
        <div>
          <h2 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wide">
            {title}
          </h2>
          <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
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
