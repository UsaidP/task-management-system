import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react" // ListboxLabel is used as Listbox.Label
import { useEffect, useId, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { FiCheck, FiChevronDown } from "react-icons/fi"
import apiService from "../../../service/apiService"
import Modal from "../Modal"
import SubtaskView from "./SubtaskView"

// Moved options outside the component as they are static
const priorityOptions = [
  { id: "low", name: "Low" },
  { id: "medium", name: "Medium" },
  { id: "high", name: "High" },
  { id: "urgent", name: "Urgent" },
]

const statusOptions = [
  { id: "todo", name: "To Do" },
  { id: "in-progress", name: "In Progress" },
  { id: "under-review", name: "Under Review" },
  { id: "completed", name: "Completed" },
]

const EditTaskModal = ({ isOpen, onClose, onTaskUpdated, task, members }) => {
  const uid = useId()
  const ids = {
    title: `${uid}-title`,
    description: `${uid}-description`,
    dueDate: `${uid}-dueDate`,
    labels: `${uid}-labels`,
  }

  const initialFormState = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: [],
    dueDate: "",
    labels: "",
  }

  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prevTaskId, setPrevTaskId] = useState(null)

  // Map members to selection options - memoized
  const assigneeOptions = useMemo(() => {
    if (!members || members.length === 0) return []
    return members.map((member) => ({
      id: member._id || member.user?._id,
      name: member.user?.fullname || member.fullname || member.email || "Unknown",
    }))
  }, [members])

  // Populate the form when a task is provided - only when task ID changes
  useEffect(() => {
    if (task && task._id && task._id !== prevTaskId) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        assignedTo: task.assignedTo?.map(a => typeof a === "object" ? a._id : a) || [],
        labels: task.labels || "",
      })
      setPrevTaskId(task._id)
    }
    
    // Reset form when modal closes
    if (!isOpen) {
      setFormData(initialFormState)
      setPrevTaskId(null)
    }
  }, [task, isOpen])

  // Helpers for selected option display
  const selectedPriorityObject = useMemo(() => 
    priorityOptions.find((p) => p.id === formData.priority),
    [formData.priority]
  )
  
  const selectedStatusObject = useMemo(() => 
    statusOptions.find((s) => s.id === formData.status),
    [formData.status]
  )

  // Helper text for Assignee multi-select
  const getAssigneeButtonText = useMemo(() => {
    const count = formData.assignedTo.length
    if (count === 0) return "Select members"
    if (count === 1) {
      return assigneeOptions.find((a) => a.id === formData.assignedTo[0])?.name || "1 selected"
    }
    return `${count} members selected`
  }, [formData.assignedTo, assigneeOptions])

  // Generic change handler - NO auto-save
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Specific handler for Listbox - NO auto-save
  const handleListboxChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Validation
  const validateForm = () => {
    if (!formData.title || formData.title.trim().length === 0) {
      toast.error("Task title is required")
      return false
    }
    if (formData.title.length > 200) {
      toast.error("Task title must be less than 200 characters")
      return false
    }
    if (formData.description && formData.description.length > 2000) {
      toast.error("Description must be less than 2000 characters")
      return false
    }
    return true
  }

  // Submit handler - update on button click
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (!task?._id) {
      toast.error("Task ID is missing")
      return
    }

    // Extract projectId - handle both object and string cases
    const projectId = typeof task.project === "object" ? task.project._id : task.project
    
    if (!projectId) {
      toast.error("Project ID is missing")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Updating task...")

    // Prepare payload - only send fields that exist
    const payload = {
      title: formData.title?.trim(),
      description: formData.description?.trim() || "",
      status: formData.status,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate || null,
      labels: formData.labels?.trim() || "",
    }

    try {
      const response = await apiService.updateTask(projectId, task._id, payload)
      if (response.success) {
        onTaskUpdated(response.data)
        toast.success("Task updated!", { id: toastId })
        onClose()
      } else {
        toast.error(response.message || "Failed to update task", { id: toastId })
      }
    } catch (error) {
      toast.error(error.message || "An error occurred.", { id: toastId })
      console.error("Failed to update task", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !task) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor={ids.title} className="input-label">
            Title
          </label>
          <input
            type="text"
            id={ids.title}
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor={ids.description} className="input-label">
            Description
          </label>
          <textarea
            id={ids.description}
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <Listbox
              value={formData.status}
              onChange={(value) => handleListboxChange("status", value)}
            >
              <Listbox.Label className="input-label">Status</Listbox.Label>
              <div className="relative">
                <ListboxButton className="input-field w-full text-left flex items-center justify-between">
                  <span className="truncate capitalize">{selectedStatusObject?.name}</span>
                  <FiChevronDown className="w-4 h-4 text-slate-700" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-white dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {statusOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 px-4 transition-colors ${active ? "bg-light-bg-hover dark:bg-dark-bg-hover text-light-text-primary dark:text-dark-text-primary" : "text-light-text-secondary dark:text-dark-text-secondary"}`
                      }
                    >
                      {({ selected }) => (
                        <span
                          className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}
                        >
                          {option.name}
                        </span>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>

          {/* Priority */}
          <div>
            <Listbox
              value={formData.priority}
              onChange={(value) => handleListboxChange("priority", value)}
            >
              <Listbox.Label className="input-label">Priority</Listbox.Label>
              <div className="relative">
                <ListboxButton className="input-field w-full text-left flex items-center justify-between">
                  <span className="truncate capitalize">{selectedPriorityObject?.name}</span>
                  <FiChevronDown className="w-4 h-4 text-slate-700" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-white dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {priorityOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 px-4 transition-colors ${active ? "bg-light-bg-hover dark:bg-dark-bg-hover text-light-text-primary dark:text-dark-text-primary" : "text-light-text-secondary dark:text-dark-text-secondary"}`
                      }
                    >
                      {({ selected }) => (
                        <span
                          className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}
                        >
                          {option.name}
                        </span>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>

          {/* Assignees */}
          <div className="md:col-span-2">
            <Listbox
              value={formData.assignedTo}
              onChange={(value) => handleListboxChange("assignedTo", value)}
              multiple
            >
              <Listbox.Label className="input-label">Assign To</Listbox.Label>
              <div className="relative">
                <ListboxButton className="input-field w-full text-left flex items-center justify-between">
                  <span className="truncate">{getAssigneeButtonText()}</span>
                  <FiChevronDown className="w-4 h-4 text-slate-700" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-white dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {assigneeOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-10 pr-4 transition-colors ${active ? "bg-light-bg-hover dark:bg-dark-bg-hover" : ""}`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? "font-semibold" : "font-normal"} text-light-text-secondary dark:text-dark-text-secondary`}
                          >
                            {option.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <FiCheck className="w-5 h-5 text-accent-primary" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>

          {/* Due Date */}
          <div className="md:col-span-2">
            <label htmlFor={ids.dueDate} className="input-label">
              Due Date
            </label>
            <input
              type="date"
              id={ids.dueDate}
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Labels */}
          <div className="md:col-span-2">
            <label htmlFor={ids.labels} className="input-label">
              Labels
            </label>
            <input
              type="text"
              id={ids.labels}
              name="labels"
              value={formData.labels}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. frontend, bug, docs" // Added placeholder for clarity
            />
          </div>
        </div>

        {/* Subtasks */}
        <div className="md:col-span-2">
          <SubtaskView taskId={task._id} />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditTaskModal
