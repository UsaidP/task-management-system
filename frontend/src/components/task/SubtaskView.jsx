import React, { useState, useEffect } from "react"
import apiService from "../../../service/apiService.js"
import toast from "react-hot-toast"
import { FaTrash, FaCheckCircle, FaRegCircle } from "react-icons/fa"
import AddSubtask from "./AddSubtask"

const SubtaskView = ({ taskId }) => {
  const [subtasks, setSubtasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSubtasks()
  }, [taskId])

  const fetchSubtasks = async () => {
    try {
      setLoading(true)
      const response = await apiService.getSubTasksForTask(taskId)
      setSubtasks(response.data)
    } catch (err) {
      setError(err)
      toast.error("Failed to fetch subtasks.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubtask = async (title) => {
    try {
      const response = await apiService.createSubTask(taskId, title)
      setSubtasks((prev) => [...prev, response.data])
      toast.success("Subtask added successfully!")
    } catch (err) {
      toast.error("Failed to add subtask.")
    }
  }

  const handleToggleComplete = async (subtaskId, currentStatus) => {
    try {
      const response = await apiService.updateSubTask(subtaskId, { completed: !currentStatus })
      setSubtasks((prev) => prev.map((sub) => (sub._id === subtaskId ? response.data : sub)))
      toast.success("Subtask updated successfully!")
    } catch (err) {
      toast.error("Failed to update subtask.")
    }
  }

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await apiService.deleteSubTask(subtaskId)
      setSubtasks((prev) => prev.filter((sub) => sub._id !== subtaskId))
      toast.success("Subtask deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete subtask.")
    }
  }

  if (loading) return <div className="text-center py-4">Loading subtasks...</div>
  if (error) return <div className="text-center py-4 text-red-500">Error: {error.message}</div>

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Subtasks</h3>
      <AddSubtask onAddSubtask={handleAddSubtask} />
      {subtasks.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No subtasks yet. Add one above!</p>
      ) : (
        <ul className="space-y-2">
          {subtasks.map((subtask) => (
            <li
              key={subtask._id}
              className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleComplete(subtask._id, subtask.completed)}
                  className="text-xl focus:outline-none"
                >
                  {subtask.completed ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaRegCircle className="text-gray-400 dark:text-gray-500" />
                  )}
                </button>
                <span
                  className={`text-gray-800 dark:text-gray-200 ${
                    subtask.completed ? "line-through text-gray-500 dark:text-gray-400" : ""
                  }`}
                >
                  {subtask.title}
                </span>
              </div>
              <button
                onClick={() => handleDeleteSubtask(subtask._id)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 focus:outline-none"
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SubtaskView
