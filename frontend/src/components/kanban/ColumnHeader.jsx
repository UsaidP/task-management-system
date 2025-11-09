import { motion } from "framer-motion"

const ColumnHeader = ({
  title,
  count,
  totalCount,
  showFilterCount,
  color,
  icon,
  children,
  className = "",
}) => {
  const taskText = (num) => (num === 1 ? "task" : "tasks")

  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Added check for icon */}
        {icon && (
          <motion.div whileHover={{ scale: 1.1 }} className={`p-2 rounded-lg ${color}`}>
            {icon}
          </motion.div>
        )}
        <div>
          <h2 className="text-lg font-bold text-highlight-text">{title}</h2>
          <span className="text-sm text-default-text">
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
