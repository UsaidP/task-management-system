import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { FiCheckCircle, FiClock, FiEye, FiPlus } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

const TaskCard = ({ task, onTaskClick }) => {
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`task-card p-3 rounded-xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary hover:border-accent-primary/50 transition-colors cursor-pointer shadow-sm ${isDragging ? "opacity-50" : ""}`}
      onClick={() => onTaskClick(task)}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`${getStatusClass(task.status)} text-xs`}>
          {task.status?.replace("-", " ")}
        </span>
        <span
          className={`px-2 py-0.5 rounded-lg text-xs font-medium ${getPriorityClass(task.priority)} bg-light-bg-hover dark:bg-dark-bg-hover`}
        >
          {task.priority}
        </span>
      </div>
      <h4 className="font-medium text-sm text-light-text-primary dark:text-dark-text-primary mb-1">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary line-clamp-2">
          {task.description}
        </p>
      )}
      {task.assignedTo?.length > 0 && (
        <div className="flex items-center gap-1 mt-2">
          {task.assignedTo.slice(0, 3).map((user) => (
            <div
              key={user._id}
              className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary text-xs flex items-center justify-center font-medium"
              title={user.fullname || user.email}
            >
              {(user.fullname || user.email).charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

const Column = ({ status, tasks, onTaskClick, onDropTask }) => {
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
      className={`w-[300px] flex-shrink-0 flex flex-col rounded-xl border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-secondary transition-colors ${isOver ? "border-accent-primary border-dashed" : ""}`}
    >
      {/* Column Header */}
      <div className={`p-3 rounded-t-xl ${config.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-white" />
            <h4 className="font-semibold text-white text-sm uppercase">{config.title}</h4>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-white/20 text-white text-xs font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-light-text-tertiary dark:text-dark-text-tertiary">
            <p className="text-sm">No tasks</p>
            <p className="text-xs">Drop tasks here</p>
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
      <div className="flex gap-4 p-4">
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
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full">
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
