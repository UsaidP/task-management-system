import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { FiCheck, FiPlus, FiTrash2 } from "react-icons/fi"
import apiService from "../../../service/apiService.js"

const SubtaskView = ({ taskId }) => {
  const [subtasks, setSubtasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newSubtask, setNewSubtask] = useState("")

  useEffect(() => {
    if (taskId) {
      fetchSubtasks()
    }
  }, [taskId])

  const fetchSubtasks = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSubTasksForTask(taskId)
      setSubtasks(response.data || [])
    } catch (err) {
      toast.error("Failed to fetch subtasks")
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubtask = async (e) => {
    e.preventDefault()
    const trimmedTitle = newSubtask.trim()
    if (!trimmedTitle) return

    try {
      const response = await apiService.createSubTask(taskId, trimmedTitle)
      setSubtasks((prev) => [...prev, response.data])
      setNewSubtask("")
      toast.success("Subtask added!")
    } catch (err) {
      toast.error("Failed to add subtask")
    }
  }

  const handleToggleComplete = async (subtaskId, currentStatus) => {
    try {
      const response = await apiService.updateSubTask(subtaskId, { isCompleted: !currentStatus })
      setSubtasks((prev) => prev.map((sub) => (sub._id === subtaskId ? response.data : sub)))
    } catch (err) {
      toast.error("Failed to update subtask")
    }
  }

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await apiService.deleteSubTask(subtaskId)
      setSubtasks((prev) => prev.filter((sub) => sub._id !== subtaskId))
      toast.success("Subtask deleted!")
    } catch (err) {
      toast.error("Failed to delete subtask")
    }
  }

  const completedCount = subtasks.filter((s) => s.isCompleted).length

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 bg-light-bg-hover dark:bg-dark-bg-hover rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      {subtasks.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
              Progress
            </span>
            <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
              {completedCount}/{subtasks.length} completed
            </span>
          </div>
          <div className="w-full bg-light-bg-hover dark:bg-dark-bg-hover rounded-full h-2">
            <div
              className="bg-accent-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / subtasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Subtask Form */}
      <form onSubmit={handleAddSubtask} className="flex gap-2">
        <input
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-1 px-4 py-2.5 bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-xl text-sm text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary focus:outline-none focus:border-accent-primary transition-colors"
        />
        <button
          type="submit"
          disabled={!newSubtask.trim()}
          className="btn-primary px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus className="w-5 h-5" />
        </button>
      </form>

      {/* Subtasks List */}
      {subtasks.length === 0 ? (
        <div className="text-center py-8 text-light-text-tertiary dark:text-dark-text-tertiary">
          <p className="text-sm">No subtasks yet</p>
          <p className="text-xs mt-1">Add subtasks to track progress</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {subtasks.map((subtask) => (
            <li
              key={subtask._id}
              className="flex items-center justify-between p-3 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border hover:border-accent-primary/30 transition-colors group"
            >
              <button
                type="button"
                onClick={() => handleToggleComplete(subtask._id, subtask.isCompleted)}
                className={`flex items-center gap-3 flex-1 text-left ${
                  subtask.isCompleted ? "opacity-60" : ""
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    subtask.isCompleted
                      ? "bg-accent-primary border-accent-primary"
                      : "border-light-text-tertiary dark:border-dark-text-tertiary"
                  }`}
                >
                  {subtask.isCompleted && <FiCheck className="w-3 h-3 text-white" />}
                </div>
                <span
                  className={`text-sm font-medium transition-all ${
                    subtask.isCompleted
                      ? "text-light-text-tertiary dark:text-dark-text-tertiary line-through"
                      : "text-light-text-primary dark:text-dark-text-primary"
                  }`}
                >
                  {subtask.title}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSubtask(subtask._id)}
                className="p-2 text-light-text-tertiary hover:text-error hover:bg-error/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SubtaskView
