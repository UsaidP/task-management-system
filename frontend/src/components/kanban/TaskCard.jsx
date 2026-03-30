import { motion } from "framer-motion"
import { useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { FiCalendar, FiMessageSquare, FiPaperclip } from "react-icons/fi"

const TaskCard = ({ task, index, onEdit, onDelete, membersMap, onDrop }) => {
  const ref = useRef(null)
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "task",
      item: {
        id: task._id,
        status: task.status,
        projectId: typeof task.project === "object" ? task.project?._id : task.project,
      },
      collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }),
    [task]
  )

  const [, drop] = useDrop(
    () => ({
      accept: "task",
      drop: (item) => {
        if (item.id !== task._id) {
          onDrop(item, task.status, index)
        }
      },
    }),
    [task, index, onDrop]
  )

  drag(drop(ref))

  const getStatusClass = (status) => {
    const base = "tag"
    switch (status) {
      case "in-progress":
        return `${base} status-in-progress`
      case "under-review":
        return `${base} status-under-review`
      case "completed":
        return `${base} status-completed`
      default:
        return `${base} status-todo`
    }
  }

  const getPriorityClass = (priority) => {
    const base = "tag"
    switch (priority?.toLowerCase()) {
      case "urgent":
        return `${base} priority-urgent`
      case "high":
        return `${base} priority-high`
      case "medium":
        return `${base} priority-medium`
      case "low":
        return `${base} priority-low`
      default:
        return `${base} priority-medium`
    }
  }
  console.log(`Task :${JSON.stringify(task)}`)
  // Mock data for new fields
  const category = task.labels || "Dev"
  const comments = task.comments || 0
  const attachments = task.attachments || 0
  const completedSubtasks = task.completedSubtasks || 0
  const totalSubtasks = task.totalSubtasks || 1
  const assignees = task.assignees || []

  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  return (
    <motion.div
      ref={ref}
      onClick={() => {
        onEdit(task)
      }}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, zIndex: 10 }}
      className={`w-full p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary hover:border-accent-primary/50 dark:hover:border-accent-primary/50 transition-all cursor-pointer relative z-0 hover:z-20 ${isDragging ? "opacity-50 shadow-lg rotate-2 z-50" : "opacity-100"}`}
    >
      <header className="flex justify-between items-start mb-3">
        <span className="tag tag-project">{task.project?.name || "Personal"}</span>
        <span className={getStatusClass(task.status)}>{task.status}</span>
      </header>
      <main className="mb-4">
        <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-1 line-clamp-2">
          {task.title}
        </h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
          {task.description}
        </p>
      </main>
      <div className="flex justify-between items-center mb-3">
        <span className={getPriorityClass(task.priority)}>{task.priority}</span>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            <FiCalendar className="w-3 h-3" />
            <span>
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
              Subtasks
            </span>
            <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="w-full bg-light-bg-hover dark:bg-dark-bg-hover rounded-full h-1.5">
            <div
              className="bg-accent-primary h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <footer className="flex justify-between items-center pt-2 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            <FiMessageSquare className="w-3 h-3" />
            <span>{task.comments?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            <FiPaperclip className="w-3 h-3" />
            <span>{(task.attachments && task.attachments.length) || 0}</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex -space-x-1">
            {assignees.length > 0 &&
              assignees.slice(0, 3).map((assignee) => {
                const user = membersMap[assignee._id]
                if (!user) return null
                return (
                  <div
                    key={user._id}
                    className="w-6 h-6 rounded-full border-2 border-light-bg-primary dark:border-dark-bg-tertiary bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${user.avatar?.url || `https://i.pravatar.cc/150?u=${user._id}`})`,
                    }}
                    title={user.fullname}
                  />
                )
              })}
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

export default TaskCard
