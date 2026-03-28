import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { FiCalendar, FiCheckCircle, FiClock, FiPlus } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

const BacklogView = ({ projectId, onCreateSprint, onSelectSprint }) => {
  const [backlogTasks, setBacklogTasks] = useState([])
  const [sprints, setSprints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)

  const fetchBacklogData = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const [backlogRes, sprintsRes] = await Promise.all([
        apiService.getBacklog(projectId),
        apiService.getSprintsByProject(projectId),
      ])
      if (backlogRes.success) {
        setBacklogTasks(backlogRes.data)
      }
      if (sprintsRes.success) {
        setSprints(sprintsRes.data)
      }
    } catch (err) {
      console.error("Failed to load backlog:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBacklogData()
  }, [projectId])

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  const handleRemoveFromSprint = async (taskId) => {
    try {
      await apiService.removeTaskFromSprint(taskId)
      setBacklogTasks((prev) => prev.filter((t) => t._id !== taskId))
    } catch (err) {
      console.error("Failed to remove task from sprint:", err)
    }
  }

  const handleAssignToSprint = async (taskId, sprintId) => {
    try {
      await apiService.assignTaskToSprint(sprintId, taskId)
      setBacklogTasks((prev) => prev.filter((t) => t._id !== taskId))
    } catch (err) {
      console.error("Failed to assign task to sprint:", err)
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "under-review":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
    }
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-500"
      case "high":
        return "text-orange-500"
      case "medium":
        return "text-amber-500"
      case "low":
        return "text-blue-500"
      default:
        return "text-slate-500"
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-light-bg-hover dark:bg-dark-bg-hover rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ boxShadow: "0px 0px 1px 0.1px #000000" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
            Backlog
          </h2>
          <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
            {backlogTasks.length} tasks not in any sprint
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateSprint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          New Sprint
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        {backlogTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-light-text-tertiary dark:text-dark-text-tertiary">
            <FiCheckCircle className="w-12 h-12 mb-4 opacity-50" />
            <p>No tasks in backlog</p>
            <p className="text-sm">All tasks are assigned to sprints</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {backlogTasks.map((task) => (
                <motion.div
                  key={task._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary hover:border-accent-primary/50 transition-all cursor-pointer"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(task.status)}`}
                        >
                          {task.status?.replace("-", " ")}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityClass(task.priority)} bg-light-bg-hover dark:bg-dark-bg-hover`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.project?.name && <span>{task.project.name}</span>}
                      </div>
                    </div>
                    {/* Sprint Assignment Dropdown */}
                    {sprints.length > 0 && (
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignToSprint(task._id, e.target.value)
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm bg-light-bg-primary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border"
                        defaultValue=""
                      >
                        <option value="">Add to Sprint...</option>
                        {sprints
                          .filter((s) => s.status !== "completed")
                          .map((sprint) => (
                            <option key={sprint._id} value={sprint._id}>
                              {sprint.name} {sprint.status === "active" ? "(Active)" : ""}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          members={selectedTask.assignedTo?.map((u) => ({ user: u })) || []}
          onTaskUpdated={(updated) => {
            setBacklogTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
          }}
        />
      )}
    </div>
  )
}

export default BacklogView
