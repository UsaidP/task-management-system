import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
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
        return <FiCircle className="w-4 h-4 text-slate-700" />
      case "in-progress":
        return <FiClock className="w-4 h-4 text-ocean-blue" />
      case "under-review":
        return <FiAlertCircle className="w-4 h-4 text-amber-orange" />
      case "completed":
        return <FiCheckCircle className="w-4 h-4 text-emerald-green" />
      default:
        return <FiCircle className="w-4 h-4 text-slate-700" />
    }
  }

  const getPriorityConfig = (priority = "Medium") => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return { borderClassName: "border-l-rose-red", label: "Urgent" }
      case "high":
        return { borderClassName: "border-l-rose-red", label: "High" }
      case "medium":
        return { borderClassName: "border-l-amber-orange", label: "Medium" }
      case "low":
        return { borderClassName: "border-l-ocean-blue", label: "Low" }
      default:
        return { borderClassName: "border-l-ocean-blue", label: "Medium" }
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
      className={`card border-l-4 ${priorityConfig.borderClassName} ${
        isDragging ? "opacity-50 shadow-lg rotate-2" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div onClick={() => onEdit(task)} className="flex items-center space-x-2 flex-1 min-w-0">
          {getStatusIcon(task.status)}
          <h3 className="font-semibold text-slate-900 group-hover:text-ocean-blue transition-colors line-clamp-1">
            {task.title}
          </h3>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
            className="p-1 rounded-md hover:bg-slate-200"
          >
            <FiMoreVertical className="w-4 h-4 text-slate-700" />
          </button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-slate-200"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(task)
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left flex items-center p-2 text-sm hover:bg-slate-200"
                >
                  <FiEdit3 className="w-4 h-4 mr-2" /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(task)
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left flex items-center p-2 text-sm text-rose-red hover:bg-slate-200"
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
          <p className="text-sm text-slate-700 mb-4 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-slate-700">
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
                        className="w-6 h-6 rounded-full border-2 border-white object-cover"
                      />
                    )
                  } else {
                    return (
                      <div
                        key={userId}
                        title={user?.fullname || "Unknown"}
                        className="w-6 h-6 rounded-full bg-ocean-blue flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      >
                        {user?.fullname?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )
                  }
                })}
                {task.assignedTo.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                    +{task.assignedTo.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
          {task.dueDate && (
            <div
              className={`flex items-center gap-1 ${isOverdue ? "text-rose-red" : "text-slate-700"}`}
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