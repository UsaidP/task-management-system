import dayjs from "dayjs"
import { memo, useState } from "react"
import { FiAlertCircle, FiCheckCircle, FiClock, FiUser } from "react-icons/fi"

const statusConfig = {
  todo: { color: "#8B8178", bg: "bg-[#8B817822]", text: "text-[#8B8178]", label: "To Do" },
  "in-progress": {
    color: "#C4654A",
    bg: "bg-[#C4654A22]",
    text: "text-[#C4654A]",
    label: "In Progress",
  },
  "under-review": {
    color: "#D4A548",
    bg: "bg-[#D4A54822]",
    text: "text-[#D4A548]",
    label: "Review",
  },
  completed: { color: "#7A9A6D", bg: "bg-[#7A9A6D22]", text: "text-[#7A9A6D]", label: "Done" },
}

const priorityConfig = {
  urgent: { bg: "bg-[#C44A4A22]", text: "text-[#C44A4A]" },
  high: { bg: "bg-[#D45A5A22]", text: "text-[#D45A5A]" },
  medium: { bg: "bg-[#D4A54822]", text: "text-[#D4A548]" },
  low: { bg: "bg-[#6888A022]", text: "text-[#6888A0]" },
}

const Avatar = ({ src, alt, size = "w-5 h-5", textSize = "text-[8px]" }) => {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        className={`${size} rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-tertiary bg-gradient-to-br from-accent-primary to-accent-info flex items-center justify-center font-bold text-white ${textSize}`}
        aria-hidden="true"
      >
        {alt}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${size} rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-tertiary object-cover`}
      loading="lazy"
      decoding="async"
      width="20"
      height="20"
      onError={() => setHasError(true)}
    />
  )
}

const getAssigneeInfo = (assignedTo) => {
  if (!assignedTo || assignedTo.length === 0) {
    return { avatar: null, initials: "?", count: 0 }
  }
  const assignee = assignedTo[0]
  let avatar = null
  const name =
    typeof assignee === "object" ? assignee.user?.fullname || assignee.fullname || "User" : "User"
  if (typeof assignee === "object" && assignee.user?.avatar?.url) {
    avatar = assignee.user.avatar.url
  } else if (typeof assignee === "object" && assignee.avatar?.url) {
    avatar = assignee.avatar.url
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  return { avatar, initials, count: assignedTo.length }
}

const formatDate = (date) => {
  if (!date) return null
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const TaskCard = memo(({ task, onClick, onDragStart, onDragEnd }) => {
  const completedSubtasks = task.completedSubtasks || 0
  const totalSubtasks = task.totalSubtasks || 0
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
  const isCompleted = task.status === "completed"
  const currentStatus = statusConfig[task.status] || statusConfig.todo
  const currentPriority = priorityConfig[task.priority?.toLowerCase()] || priorityConfig.medium
  const {
    avatar: assigneeAvatar,
    initials: assigneeInitials,
    count: assigneeCount,
  } = getAssigneeInfo(task.assignedTo)

  return (
    <div
      key={task._id}
      onClick={() => onClick(task)}
      className="group bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border dark:border-dark-border rounded-xl p-3.5 cursor-pointer hover:border-accent-primary/50 dark:hover:border-accent-primary-light/50 hover:shadow-md dark:hover:shadow-dark-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in"
      style={
        isCompleted
          ? { borderLeft: "4px solid #7A9A6D" }
          : { borderLeft: `4px solid ${currentStatus.color}` }
      }
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
    >
      {/* Header: Title + Priority */}
      <div className="flex justify-between items-start gap-2 mb-2.5">
        <h4 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary line-clamp-2 leading-snug flex-1">
          {task.title}
        </h4>
        {!isCompleted && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${currentPriority.bg} ${currentPriority.text} uppercase tracking-wide flex-shrink-0`}
          >
            {task.priority || "Medium"}
          </span>
        )}
        {isCompleted && task.completedAt && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#7A9A6D22] text-[#7A9A6D] flex items-center gap-1 flex-shrink-0">
            <FiCheckCircle className="w-3 h-3" />
            Done
          </span>
        )}
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Subtask Progress */}
      {totalSubtasks > 0 && !isCompleted && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide">
              Progress
            </span>
            <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">
              {progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-light-bg-hover dark:bg-dark-bg-hover rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: progress > 60 ? "#7A9A6D" : progress > 30 ? "#C4654A" : "#8B8178",
              }}
            />
          </div>
        </div>
      )}

      {/* Footer: Due Date + Assignees + Comments */}
      <div className="flex items-center justify-between pt-3 border-t border-light-border dark:border-dark-border mt-1">
        <div className="flex items-center gap-1">
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 text-xs font-medium ${dayjs(task.dueDate).isBefore(dayjs()) && !isCompleted ? "text-accent-danger" : "text-light-text-tertiary dark:text-dark-text-tertiary"}`}
            >
              <FiClock className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Comments Count */}
          {(task.comments?.length || 0) > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
              <FiAlertCircle className="w-3 h-3" />
              {task.comments.length}
            </span>
          )}

          {/* Subtask Count */}
          {totalSubtasks > 0 && !isCompleted && (
            <span className="flex items-center gap-1 text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
              <FiCheckCircle className="w-3 h-3" />
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}

          {/* Assignee Avatar(s) */}
          <div className="flex items-center">
            {assigneeCount > 0 ? (
              <div className="flex -space-x-1.5">
                <Avatar
                  src={assigneeAvatar}
                  alt={assigneeInitials}
                  size="w-5 h-5"
                  textSize="text-[8px]"
                />
                {assigneeCount > 1 && (
                  <div className="w-5 h-5 rounded-full border-2 border-light-bg-secondary dark:border-dark-bg-tertiary bg-light-bg-hover dark:bg-dark-bg-hover flex items-center justify-center text-[7px] font-bold text-light-text-tertiary dark:text-dark-text-tertiary">
                    +{assigneeCount - 1}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center">
                <FiUser className="w-3 h-3 text-light-text-tertiary dark:text-dark-text-tertiary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

TaskCard.displayName = "TaskCard"

export default TaskCard
