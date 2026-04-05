import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { FiCalendar, FiCheckCircle, FiPlus } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import TaskDetailPanel from "../task/TaskDetailPanel.jsx"

const BacklogView = ({ projectId, onCreateSprint, onSelectSprint }) => {
  const reduceMotion = useReducedMotion()
  const [backlogTasks, setBacklogTasks] = useState([])
  const [sprints, setSprints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)

  const fetchBacklogData = useCallback(async () => {
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
  }, [projectId])

  useEffect(() => {
    fetchBacklogData()
  }, [fetchBacklogData])

  const handleTaskClick = (task) => {
    setSelectedTask(task)
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

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-light-bg-hover dark:bg-dark-bg-hover rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary">
        <div>
          <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
            Backlog
          </h2>
          <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
            {backlogTasks.length} {backlogTasks.length === 1 ? "task" : "tasks"} not in any sprint
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateSprint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary text-white font-medium hover:bg-accent-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary min-h-[44px]"
          aria-label="Create new sprint"
        >
          <FiPlus className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">New Sprint</span>
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary">
        {backlogTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-light-text-tertiary dark:text-dark-text-tertiary py-16">
            <div className="w-16 h-16 rounded-full bg-light-bg-hover dark:bg-dark-bg-hover flex items-center justify-center mb-4">
              <FiCheckCircle className="w-8 h-8 opacity-40" aria-hidden="true" />
            </div>
            <p className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
              Backlog is empty
            </p>
            <p className="text-sm">All tasks are assigned to sprints</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl mx-auto">
            <AnimatePresence>
              {backlogTasks.map((task) => (
                <motion.div
                  key={task._id}
                  layout={reduceMotion ? false : true}
                  initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? {} : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: reduceMotion ? 0 : 0.15 }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleTaskClick(task)
                    }
                  }}
                  className="task-card p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-tertiary hover:border-accent-primary/40 dark:hover:border-accent-primary/40 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group"
                  onClick={() => handleTaskClick(task)}
                  aria-label={`Task: ${task.title}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`${getStatusClass(task.status)}`}>
                          {task.status?.replace("-", " ")}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityClass(task.priority)} bg-light-bg-hover dark:bg-dark-bg-hover`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1 group-hover:text-accent-primary transition-colors duration-200">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-light-text-tertiary dark:text-dark-text-tertiary flex-wrap">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" aria-hidden="true" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.project?.name && <span>{task.project.name}</span>}
                      </div>
                    </div>
                    {/* Sprint Assignment Dropdown */}
                    {sprints.length > 0 && (
                      <select
                        aria-label="Assign to sprint"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignToSprint(task._id, e.target.value)
                          }
                        }}
                        className="px-3 py-2 rounded-lg text-sm bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary transition-colors duration-200 min-h-[44px] cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                        defaultValue=""
                      >
                        <option value="">Add to Sprint...</option>
                        {sprints
                          .filter((s) => s.status !== "completed")
                          .map((sprint) => (
                            <option key={sprint._id} value={sprint._id}>
                              {sprint.name}{" "}
                              {sprint.status === "active"
                                ? "(Active)"
                                : sprint.status === "planned"
                                  ? "(Planned)"
                                  : ""}
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
