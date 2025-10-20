import { AnimatePresence, motion } from "framer-motion"
import  { useEffect, useRef, useState } from "react"
import { useDrag, useDrop } from "react-dnd"
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiEdit3,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi"

const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [ref, callback])
}

const TaskCard = ({ task, index, onEdit, onDelete, membersMap }) => {
  const ref = useRef(null)
  const menuRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useOutsideClick(menuRef, () => setIsMenuOpen(false))

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task._id, status: task.status, index },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }))

  drag(ref)

  const getStatusIcon = (status) => {
    switch (status) {
      case "todo":
        return <FiCircle className="w-4 h-4 text-text-muted" />
      case "in-progress":
        return <FiClock className="w-4 h-4 text-accent" />
      case "under-review":
        return <FiAlertCircle className="w-4 h-4 text-warning" />
      case "completed":
        return <FiCheckCircle className="w-4 h-4 text-success" />
      default:
        return <FiCircle className="w-4 h-4 text-text-muted" />
    }
  }

  const getPriorityConfig = (priority = "Medium") => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return { borderClassName: "border-l-urgent", label: "Urgent" }
      case "high":
        return { borderClassName: "border-l-error", label: "High" }
      case "medium":
        return { borderClassName: "border-l-warning", label: "Medium" }
      case "low":
        return { borderClassName: "border-l-success", label: "Low" }
      default:
        return { borderClassName: "border-l-primary", label: "Medium" }
    }
  }

  const priorityConfig = getPriorityConfig(task.priority)
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`card-interactive border-l-4 ${priorityConfig.borderClassName} ${
        isDragging ? "opacity-50 shadow-glow rotate-2" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div onClick={() => onEdit(task)} className="flex items-center space-x-2 flex-1 min-w-0">
          {getStatusIcon(task.status)}
          <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-1">
            {task.title}
          </h3>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
            className="p-1 rounded-md hover:bg-surface-light"
          >
            <FiMoreVertical className="w-4 h-4 text-text-muted" />
          </button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg z-10 border border-border"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(task)
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left flex items-center p-2 text-sm hover:bg-surface-light"
                >
                  <FiEdit3 className="w-4 h-4 mr-2" /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(task)
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left flex items-center p-2 text-sm text-error hover:bg-surface-light"
                >
                  <FiTrash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div onClick={() => onEdit(task)}>
        {task.description && (
          <p className="text-sm text-text-secondary mb-4 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center space-x-2">
            {task.assignedTo?.length > 0 && (
              <div className="flex -space-x-1">
                {task.assignedTo.slice(0, 3).map((userId) => {
                  const user = membersMap[userId]
                  if (user?.avatar?.url) {
                    return (
                      <img
                        key={userId}
                        src={user.avatar.url}
                        title={user.fullname || "Unknown"}
                        alt={user.fullname || "User"}
                        className="w-6 h-6 rounded-full border-2 border-surface object-cover"
                      />
                    )
                  } else {
                    return (
                      <div
                        key={userId}
                        title={user?.fullname || "Unknown"}
                        className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-xs font-medium border-2 border-surface"
                      >
                        {user?.fullname?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )
                  }
                })}
                {task.assignedTo.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-text-muted flex items-center justify-center text-white text-xs font-medium border-2 border-surface">
                    +{task.assignedTo.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
          {task.dueDate && (
            <div
              className={`flex items-center gap-1 ${isOverdue ? "text-error" : "text-text-muted"}`}
            >
              <FiCalendar className="w-3 h-3" />
              <span>
                {new Date(task.dueDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default TaskCard
