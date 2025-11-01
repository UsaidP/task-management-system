import { Listbox, ListboxButton, ListboxOption, ListboxOptions, ListboxLabel } from "@headlessui/react" // ListboxLabel is used as Listbox.Label
import { useEffect, useMemo, useState } from "react"
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

  // Map members to selection options
  const assigneeOptions = useMemo(() => {
    if (!members) return []
    return members.map((member) => ({
      id: member._id,
      name: member.user?.fullname || member.fullname || member.email || "Unknown",
    }))
  }, [members])

  // Populate the form when a task is provided
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        assignedTo: task.assignedTo || [],
        labels: task.labels || "",
      })
    }
  }, [task])

  // Helpers for selected option display
  const selectedPriorityObject = priorityOptions.find((p) => p.id === formData.priority)
  const selectedStatusObject = statusOptions.find((s) => s.id === formData.status)

  // Helper text for Assignee multi-select
  const getAssigneeButtonText = () => {
    const count = formData.assignedTo.length
    if (count === 0) return "Select members"
    if (count === 1) {
      return assigneeOptions.find((a) => a.id === formData.assignedTo[0])?.name || "1 selected"
    }
    return `${count} members selected`
  }

  // Generic change handler
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Specific handler for Listbox
  const handleListboxChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Submit handler
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
        toast.error(response.message || "Failed to update task", { id: toastId })
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
        {/* Title */}
        <div>
          <label htmlFor="title" className="input-label">
            Title
          </label>
          <input
            type="text"
            id="title" // Added id for label association
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
            id="description" // Added id for label association
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
              {/* --- FIX: Used Listbox.Label for accessibility and consistent class --- */}
              <Listbox.Label className="input-label">Status</Listbox.Label>
              <div className="relative">
                <ListboxButton className="input-field w-full text-left flex items-center justify-between">
                  <span className="truncate capitalize">{selectedStatusObject?.name}</span>
                  <FiChevronDown className="w-4 h-4 text-slate-700" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {statusOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 px-4 ${active ? "bg-slate-200 text-slate-900" : "text-slate-700"}`
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
              {/* --- FIX: Used Listbox.Label for accessibility and consistent class --- */}
              <Listbox.Label className="input-label">Priority</Listbox.Label>
              <div className="relative">
                <ListboxButton className="input-field w-full text-left flex items-center justify-between">
                  <span className="truncate capitalize">{selectedPriorityObject?.name}</span>
                  <FiChevronDown className="w-4 h-4 text-slate-700" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {priorityOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 px-4 ${active ? "bg-slate-200 text-slate-900" : "text-slate-700"}`
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

          {/* Assignees */}
          <div className="md:col-span-2">
            <Listbox
              value={formData.assignedTo}
              onChange={(value) => handleListboxChange("assignedTo", value)}
              multiple
            >
              {/* --- FIX: Used Listbox.Label for accessibility and consistent class --- */}
              <Listbox.Label className="input-label">Assign To</Listbox.Label>
              <div className="relative">
                <ListboxButton className="input-field w-full text-left flex items-center justify-between">
                  <span className="truncate">{getAssigneeButtonText()}</span>
                  <FiChevronDown className="w-4 h-4 text-slate-700" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {assigneeOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? "bg-slate-200 text-slate-900" : "text-slate-7C00"}`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}>
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
              id="dueDate" // Added id for label association
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Labels */}
          <div className="md:col-span-2">
            <label htmlFor="labels" className="input-label">
              Labels
            </label>
            <input
              type="text"
              id="labels" // Added id for label association
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
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isSubmitting}
          >
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