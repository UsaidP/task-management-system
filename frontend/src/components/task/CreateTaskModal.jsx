import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"
// Import FiCheck for the multi-select UI
import { FiCheck, FiChevronDown } from "react-icons/fi"
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

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, projectId, members }) => {
  const initialFormState = {
    title: "",
    description: "",
    status: "todo", // Default status
    priority: "medium", // Default priority (matches option ID)
    assignedTo: [],
    dueDate: "",
  }

  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const assigneeOptions = useMemo(() => {
    if (!members) return []
    return members.map((member) => ({
      id: member._id,
      name: member.user?.fullname || member.fullname || member.email || "Unknown",
    }))
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
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const toastId = toast.loading("Creating task...")
    try {

      const response = await apiService.createTask(projectId, formData)
      // console.log(`Create Task Response: ${JSON.stringify(response)}`);
      if (response.success) {
        onTaskCreated(response.task)
        toast.success("Task created!", { id: toastId })
        onClose()
        setFormData(initialFormState)
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
            <label htmlFor="status" className="input-label">
              Status
            </label>
            <Listbox
              value={formData.status}
              onChange={(value) => handleListboxChange("status", value)}
            >
              <div className="relative">
                <ListboxButton className="w-full px-3 py-2 bg-primary border border-border rounded-lg text-text-primary text-left flex items-center justify-between">
                  <span className="truncate capitalize">{selectedStatusObject?.name}</span>
                  <FiChevronDown className="w-4 h-4 text-text-muted" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-primary border border-border rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {statusOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 px-4 ${active ? "bg-primary-dark text-white" : "text-text-primary"
                        }`
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

          {/* Priority Listbox */}
          <div>
            <label htmlFor="priority" className="input-label">
              Priority
            </label>
            <Listbox
              value={formData.priority}
              onChange={(value) => handleListboxChange("priority", value)}
            >
              <div className="relative">
                <ListboxButton className="w-full px-3 py-2 bg-primary border border-border rounded-lg text-text-primary text-left flex items-center justify-between">
                  <span className="truncate capitalize">{selectedPriorityObject?.name}</span>
                  <FiChevronDown className="w-4 h-4 text-text-muted" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-primary border border-border rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {priorityOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 px-4 ${active ? "bg-primary-dark text-white" : "text-text-primary"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span
                          className={`block truncate ${selected ? "font-bold" : "font-normal"}`}
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
            <label htmlFor="assignedTo" className="input-label">
              Assign To
            </label>
            <Listbox
              value={formData.assignedTo}
              onChange={(value) => handleListboxChange("assignedTo", value)}
              multiple
            >
              <div className="relative">
                <ListboxButton className="w-full px-3 py-2 bg-primary border border-border rounded-lg text-text-primary text-left flex items-center justify-between">
                  <span className="truncate">{getAssigneeButtonText()}</span>
                  <FiChevronDown className="w-4 h-4 text-text-muted" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-primary border border-border rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {assigneeOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? "bg-primary-dark text-white" : "text-text-primary"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? "font-semibold" : "font-normal"
                              }`}
                          >
                            {option.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <FiCheck className="w-5 h-5" aria-hidden="true" />
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
            <label htmlFor="dueDate" className="input-label">
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
