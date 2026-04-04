import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { FiCheck, FiChevronDown, FiTrash2 } from "react-icons/fi"
import apiService from "../../../service/apiService"
import Modal from "../Modal"

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

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, projectId, members, selectedDate }) => {
  const getInitialFormState = () => ({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: [],
    dueDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
    labels: "",
  })

  const [formData, setFormData] = useState(getInitialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [subtasks, setSubtasks] = useState([])

  // Reset form when modal opens with a new selectedDate
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignedTo: [],
        dueDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
        labels: "",
      })
      setSubtasks([])
    }
  }, [isOpen, selectedDate])

  const assigneeOptions = useMemo(() => {
    if (!members || !Array.isArray(members)) return []
    return members.map((member) => {
      const userObj = member.user || member
      return {
        id: userObj?._id || member._id || Math.random().toString(),
        name: userObj?.fullname || member.fullname || "Unknown",
        email: userObj?.email || member.email || "Unknown",
      }
    })
  }, [members])

  // Find full objects for display names in Listbox buttons
  const selectedPriorityObject = priorityOptions.find((p) => p.id === formData.priority)
  const selectedStatusObject = statusOptions.find((s) => s.id === formData.status)

  // Helper text for the multi-select Assignee button
  const getAssigneeButtonText = () => {
    const count = formData.assignedTo.length
    if (count === 0) return "Select members"
    if (count === 1) {
      return assigneeOptions.find((a) => a.id === formData.assignedTo[0])?.name || "1 selected"
    }
    return `${count} members selected`
  }

  // Generic change handler for simple inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Specific handler for Headless UI Listbox (works for single and multi-select)
  const handleListboxChange = (name, value) => {
    // console.log(`Name: ${name}, Value: ${value}`)
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSubtask = () => {
    const trimmedTitle = newSubtaskTitle.trim()
    if (trimmedTitle) {
      setSubtasks((prev) => [...prev, { id: crypto.randomUUID(), title: trimmedTitle }])
      setNewSubtaskTitle("")
    }
  }

  const handleRemoveSubtask = (id) => {
    setSubtasks((prev) => prev.filter((sub) => sub.id !== id))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const toastId = toast.loading("Creating task...")
    try {
      const taskDataWithSubtasks = {
        ...formData,
        subtasks: subtasks.map((sub) => ({ title: sub.title })), // Send only titles to backend
      }
      const response = await apiService.createTask(projectId, taskDataWithSubtasks)

      if (response.success) {
        onTaskCreated(response.data)
        toast.success("Task created!", { id: toastId })
        onClose()
        setFormData(getInitialFormState())
        setSubtasks([])
      } else {
        toast.error(response.message || "Failed to create task", {
          id: toastId,
        })
      }
    } catch (error) {
      toast.error("An error occurred.", { id: toastId })
      console.error("Failed to create task", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="input-label">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="input-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Listbox */}
          <div>
            <Listbox
              value={formData.status}
              onChange={(value) => handleListboxChange("status", value)}
            >
              <Listbox.Label className="input-label">Status</Listbox.Label>
              <div className="relative">
                <ListboxButton className="input-field w-full text-left flex items-center justify-between">
                  <span className="truncate capitalize">{selectedStatusObject?.name}</span>
                  <FiChevronDown className="w-4 h-4 text-light-text-secondary" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {statusOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 px-4 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                      }
                    >
                      {({ selected }) => (
                        <span
                          className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
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

          {/* Priority Listbox */}
          <div>
            <Listbox
              value={formData.priority}
              onChange={(value) => handleListboxChange("priority", value)}
            >
              <Listbox.Label className="input-label">Priority</Listbox.Label>
              <div className="relative">
                <ListboxButton className="input-field w-full text-left flex items-center justify-between">
                  <span className="truncate capitalize">{selectedPriorityObject?.name}</span>
                  <FiChevronDown className="w-4 h-4 text-light-text-secondary" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {priorityOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 px-4 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                      }
                    >
                      {({ selected }) => (
                        <span
                          className={`block truncate ${selected ? "font-bold text-accent-primary" : "font-normal"}`}
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

          {/* Assignees (Multi-select Listbox) */}
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
                  <FiChevronDown className="w-4 h-4 text-light-text-secondary" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {assigneeOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-10 pr-4 transition-colors duration-150 ${active ? "bg-accent-primary/10 text-accent-primary" : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"}`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? "font-semibold text-accent-primary" : "font-normal"}`}
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
          <div>
            <label htmlFor="dueDate" className="input-label">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Labels */}
          <div>
            <label htmlFor="labels" className="input-label">
              Labels
            </label>
            <input
              type="text"
              id="labels"
              name="labels"
              value={formData.labels}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. frontend, bug, docs"
            />
            <p className="text-sm text-light-text-tertiary mt-1">
              Separate labels with a space (e.g., frontend backend api)
            </p>
          </div>
        </div>

        {/* Subtasks Input and List */}
        <div className="space-y-3">
          <label htmlFor="newSubtaskTitle" className="input-label">
            Subtasks
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="newSubtaskTitle"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddSubtask()
                }
              }}
              placeholder="Add a subtask title"
              className="input-field flex-grow"
            />
            <button type="button" onClick={handleAddSubtask} className="btn-primary px-4 py-2">
              Add
            </button>
          </div>
          {subtasks.length > 0 && (
            <ul className="space-y-2 max-h-32 overflow-y-auto">
              {subtasks.map((sub) => (
                <li
                  key={sub.id}
                  className="flex items-center justify-between p-2 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-lg shadow-sm"
                >
                  <span className="text-light-text-primary dark:text-dark-text-primary break-all">
                    {sub.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    aria-label={`Remove subtask: ${sub.title}`}
                    className="text-accent-danger hover:text-accent-danger/80 dark:hover:text-accent-danger/80 ml-2 p-1 rounded-full hover:bg-accent-danger/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-danger/20"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateTaskModal
