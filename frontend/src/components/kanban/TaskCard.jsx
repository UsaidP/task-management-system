import { motion } from "framer-motion"
import { useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { Calendar } from "lucide-react"
import { MessageCircleIcon, PaperclipIcon } from "@animateicons/react/lucide"
import Avatar from "../auth/Avatar"

const AvatarWithFallback = ({ user }) => (
  <Avatar
    src={user.avatar?.url || user.avatar}
    alt={user.fullname || "User"}
    size="xs"
    className="border-2 border-light-bg-primary dark:border-dark-bg-tertiary"
  />
)

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
        return { handled: true }
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
  // Mock data for new fields
  const _category = task.labels || "Dev"
  const _comments = task.comments?.length || 0
  const _attachments = task.attachments?.length || 0
  const completedSubtasks = task.completedSubtasks || 0
  const totalSubtasks = task.totalSubtasks || 0
  const assignees = task.assignedTo || []

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
      className={`task-card w-full p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary hover:border-accent-primary/50 dark:hover:border-accent-primary/50 transition-colors cursor-pointer relative z-0 hover:z-20 ${isDragging ? "opacity-50 shadow-lg rotate-2 z-50" : "opacity-100 shadow-sm"}`}
    >
      <header className="flex items-start justify-between mb-3">
        <span className="tag tag-project">{task.project?.name || "Personal"}</span>
        <span className={getStatusClass(task.status)}>{task.status}</span>
      </header>
      <main className="mb-4">
        <h3 className="mb-1 text-base font-semibold text-light-text-primary dark:text-dark-text-primary line-clamp-2">
          {task.title}
        </h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
          {task.description}
        </p>
      </main>
      <div className="flex items-center justify-between mb-3">
        <span className={getPriorityClass(task.priority)}>{task.priority}</span>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            <Calendar className="w-3 h-3" />
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
          <div className="flex items-center justify-between mb-1">
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
      <footer className="flex items-center justify-between pt-2 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            <MessageCircleIcon className="w-3 h-3" />
            <span>{task.comments?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            <PaperclipIcon className="w-3 h-3" />
            <span>{task.attachments?.length || 0}</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex -space-x-1">
            {assignees.length > 0 &&
              assignees.slice(0, 3).map((assignee) => {
                const assigneeId = typeof assignee === "object" ? assignee._id : assignee
                const user = membersMap?.[assigneeId]
                if (!user) return null
                return <AvatarWithFallback key={user._id} user={user} />
              })}
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

export default TaskCard
