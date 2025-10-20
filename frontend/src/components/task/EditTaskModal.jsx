import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import apiService from "../../../service/apiService"
import Modal from "../Modal"

const EditTaskModal = ({ isOpen, onClose, onTaskUpdated, task, members }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "Medium",
    dueDate: "",
    assignedTo: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "Medium",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        assignedTo: task.assignedTo || [],
      })
    }
  }, [task])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
    setFormData((prev) => ({ ...prev, assignedTo: selectedOptions }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const toastId = toast.loading("Updating task...")
    try {
      const response = await apiService.updateTask(task.project, task._id, formData)
      if (response.success) {
        onTaskUpdated(response.data)
        toast.success("Task updated!", { id: toastId })
        onClose()
      } else {
        toast.error(response.message || "Failed to update task", {
          id: toastId,
        })
      }
    } catch (error) {
      toast.error("An error occurred.", { id: toastId })
      console.error("Failed to update task", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!task) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title " className="input-label">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            className="input-field"
            required
          />
        </div>
        <div>
          <label htmlFor="description " className="input-label">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            rows="3"
          />
        </div>
        <div>
          <label htmlFor="status " className="input-label">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="select-field"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="under-review">Under Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="input-label">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="select-field"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label htmlFor="Assign To" className="input-label">
            Assign To
          </label>
          <select
            multiple
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleMultiSelectChange}
            className="input-field h-32"
          >
            {members?.map((member) => (
              <option key={member.user._id} value={member.user._id}>
                {member.user.email}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-muted mt-1">
            Hold Ctrl or Cmd to select multiple members.
          </p>
        </div>
        <div>
          <label htmlFor="Due Date" className="input-label">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditTaskModal
