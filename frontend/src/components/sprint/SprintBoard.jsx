import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { FiCheckCircle, FiClock, FiEye, FiPlus } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { getOptimizedAvatarUrl } from "../../utils/imageHelpers.js"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

const TaskCard = ({ task, onTaskClick }) => {
  const reduceMotion = useReducedMotion()
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { taskId: task._id, currentStatus: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "badge-status-done"
      case "in-progress":
        return "badge-status-progress"
      case "under-review":
        return "badge-status-review"
      default:
        return "badge-status-todo"
    }
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-accent-danger"
      case "high":
        return "text-task-priority-high"
      case "medium":
        return "text-task-priority-medium"
      case "low":
        return "text-task-priority-low"
      default:
        return "text-light-text-tertiary"
    }
  }

  return (
    <motion.div
      ref={drag}
      layout
      initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      exit={reduceMotion ? {} : { opacity: 0, scale: 0.95 }}
      transition={{ duration: reduceMotion ? 0 : 0.15 }}
      className={`task-card p-3 rounded-xl border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-tertiary hover:border-accent-primary/40 dark:hover:border-accent-primary/40 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
        isDragging ? "opacity-40 scale-95 ring-2 ring-accent-primary/30" : ""
      }`}
      onClick={() => onTaskClick(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onTaskClick(task)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}, Status: ${task.status}, Priority: ${task.priority}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`${getStatusClass(task.status)} text-xs`}>
          {task.status?.replace("-", " ")}
        </span>
        <span
          className={`px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityClass(task.priority)} bg-light-bg-hover dark:bg-dark-bg-hover`}
        >
          {task.priority}
        </span>
      </div>
      <h4 className="font-medium text-sm text-light-text-primary dark:text-dark-text-primary mb-1 line-clamp-2">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary line-clamp-2 mb-2">
          {task.description}
        </p>
      )}
      {task.assignedTo?.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-light-border/50 dark:border-dark-border/50">
          <div className="flex -space-x-1 first:space-x-0">
            {task.assignedTo.slice(0, 3).map((user, idx) => {
              const avatarUrl = getOptimizedAvatarUrl(user?.avatar?.url, 50)
              const fallback = `https://i.pravatar.cc/150?u=${user._id || idx}`
              const name = user.fullname || user.email || "User"
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)

              return (
                <AvatarWithFallback
                  key={user._id || idx}
                  src={avatarUrl || fallback}
                  alt={initials}
                  name={name}
                />
              )
            })}
          </div>
          {task.assignedTo.length > 3 && (
            <span className="text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary ml-1">
              +{task.assignedTo.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}

const AvatarWithFallback = ({ src, alt, name }) => {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div
        className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary text-white text-[10px] flex items-center justify-center font-medium ring-2 ring-light-bg-primary dark:ring-dark-bg-tertiary -ml-1 first:ml-0"
        title={name}
      >
        {alt}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      className="w-6 h-6 rounded-full object-cover ring-2 ring-light-bg-primary dark:ring-dark-bg-tertiary -ml-1 first:ml-0"
      title={name}
      loading="lazy"
      decoding="async"
      width="24"
      height="24"
      onError={() => setHasError(true)}
    />
  )
}

const Column = ({ status, tasks, onTaskClick, onDropTask }) => {
  const reduceMotion = useReducedMotion()
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item) => {
      if (item.currentStatus !== status) {
        onDropTask(item.taskId, status)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const columnConfig = {
    todo: {
      bg: "bg-task-status-todo",
      icon: FiPlus,
      title: "To Do",
    },
    "in-progress": {
      bg: "bg-task-status-progress",
      icon: FiClock,
      title: "In Progress",
    },
    "under-review": {
      bg: "bg-task-status-review",
      icon: FiEye,
      title: "In Review",
    },
    completed: {
      bg: "bg-task-status-done",
      icon: FiCheckCircle,
      title: "Done",
    },
  }

  const config = columnConfig[status]
  const Icon = config.icon

  return (
    <div
      ref={drop}
      className={`w-[300px] flex-shrink-0 flex flex-col rounded-xl border transition-all duration-200 ${
        isOver
          ? "border-accent-primary border-dashed bg-accent-primary/5 dark:bg-accent-primary/10"
          : "border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary"
      }`}
      aria-label={`${config.title} column, ${tasks.length} tasks`}
    >
      {/* Column Header */}
      <div className={`p-3 rounded-t-xl ${config.bg}/15 dark:${config.bg}/20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${config.bg.replace("bg-", "text-")}`} />
            <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary text-sm">
              {config.title}
            </h4>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md ${config.bg}/20 dark:${config.bg}/30 ${config.bg.replace("bg-", "text-")} text-xs font-semibold`}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div
        className={`flex-1 p-2 space-y-2 overflow-y-auto min-h-[150px] max-h-[calc(100vh-280px)] transition-colors duration-200 ${
          isOver ? "bg-accent-primary/5" : ""
        }`}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-light-text-tertiary dark:text-dark-text-tertiary">
            <Icon className="w-8 h-8 mb-2 opacity-30" aria-hidden="true" />
            <p className="text-xs">No tasks</p>
            {isOver && <p className="text-[10px] text-accent-primary mt-1">Drop here</p>}
          </div>
        ) : (
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onTaskClick={onTaskClick}
                moveTask={onDropTask}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

const SprintBoard = ({ sprintId, projectId }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)

  const fetchSprintTasks = useCallback(async () => {
    if (!sprintId) return
    setLoading(true)
    try {
      const response = await apiService.getTasksByProjectId(projectId)
      if (response.success) {
        const sprintTasks = response.data?.filter((t) => t.sprint === sprintId) || []
        setTasks(sprintTasks)
      }
    } catch (err) {
      console.error("Failed to load sprint tasks:", err)
    } finally {
      setLoading(false)
    }
  }, [sprintId, projectId])

  useEffect(() => {
    fetchSprintTasks()
  }, [fetchSprintTasks])

  const handleDropTask = async (taskId, newStatus) => {
    try {
      await apiService.updateTask(projectId, taskId, { status: newStatus })
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)))
    } catch (err) {
      console.error("Failed to move task:", err)
    }
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)))
  }

  if (loading) {
    return (
      <div className="flex gap-3 p-4 overflow-x-auto">
        {["todo", "in-progress", "under-review", "completed"].map((status) => (
          <div
            key={status}
            className="w-[300px] flex-shrink-0 h-64 bg-light-bg-hover dark:bg-dark-bg-hover rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  const columns = ["todo", "in-progress", "under-review", "completed"]

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 overflow-x-auto p-4" role="region" aria-label="Sprint board">
        <div className="flex gap-3 h-full">
          {columns.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
              onTaskClick={handleTaskClick}
              onDropTask={handleDropTask}
            />
          ))}
        </div>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          members={selectedTask.assignedTo?.map((u) => ({ user: u })) || []}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </DndProvider>
  )
}

export default SprintBoard
