import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
// --- FIX: Corrected typo 'useState }m' to 'useState }' ---
import { useMemo, useState } from "react"
import toast from "react-hot-toast"
// Import FiCheck for the multi-select UI
import { FiCheck, FiChevronDown, FiTrash2 } from "react-icons/fi" // Added FiTrash2 for remove button
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
  // console.log(`Members: ${JSON.stringify(members)}`)
  // console.log(`Project Members: ${JSON.stringify(projectId)}`)
  const initialFormState = {
    title: "",
    description: "",
    status: "todo", // Default status
    priority: "medium", // Default priority 
    assignedTo: [],
    dueDate: "",
    labels: "",
  }

  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [subtasks, setSubtasks] = useState([])

  const assigneeOptions = useMemo(() => {
    if (!members) return []
    // console.log(`Members: ${JSON.stringify(members)}`)
    return members.map((member) => ({
      id: member.user._id,
      name: member.user?.fullname || member.fullname || "Unknown",
      email: member.user?.email || member.email || "Unknown",
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
  const handleAssigneeChange = (e) => {
    const { name, value } = e.target
    console.log(`Name: ${name}, Value: ${value}`)
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      console.log(`Create Task Response: ${JSON.stringify(response)}`)

      // --- FIX: Added if/else block to handle response.success ---
      if (response.success) {
        onTaskCreated(response.task)
        toast.success("Task created!", { id: toastId })
        onClose()
        setFormData(initialFormState)
        setSubtasks([]) // Reset subtasks after successful creation
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
            id="title" // --- FIX: Added id for label association ---
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
            id="description" // --- FIX: Added id for label association ---
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
                  <FiChevronDown className="w-4 h-4 text-slate-700" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {statusOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      // --- FIX: Cleaned up className template literal ---
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
                  <FiChevronDown className="w-4 h-4 text-slate-700" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {priorityOptions.map((option) => (
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      // --- FIX: Cleaned up className template literal ---
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

          {/* Assignees (Multi-select Listbox) */}
          <div className="md:col-span-2">
            {/* --- FIX: Use Listbox.Label and consistent className --- */}
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
                <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {assigneeOptions.map((option) => (
                    console.log(`Option: ${JSON.stringify(option)}`),
                    <ListboxOption
                      key={option.id}
                      value={option.id}
                      // --- FIX: Cleaned up className template literal ---
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? "bg-slate-200 text-slate-900" : "text-slate-700"}`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            // --- FIX: Cleaned up className template literal ---
                            className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}
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
              id="dueDate" // --- FIX: Added id for label association ---
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
              id="labels" // --- FIX: Added id for label association ---
              name="labels"
              value={formData.labels}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. frontend, bug, docs" // --- FIX: Added placeholder ---
            />
            {/* --- FIX: Styled helper text --- */}
            <p className="text-sm text-gray-500 mt-1">
              Separate labels with a space (e.g., frontend backend api)
            </p>
          </div>
        </div>

        {/* Subtasks Input and List */}
        <div className="md:col-span-2 space-y-3">
          {/* --- FIX: Linked label to input --- */}
          <label htmlFor="newSubtaskTitle" className="input-label">
            Subtasks
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="newSubtaskTitle" // --- FIX: Added id ---
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault() // Prevent form submission
                  handleAddSubtask()
                }
              }}
              placeholder="Add a subtask title"
              className="input-field flex-grow"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="btn-primary px-4 py-2"
            >
              Add
            </button>
          </div>
          {subtasks.length > 0 && (
            <ul className="space-y-2 max-h-32 overflow-y-auto">
              {subtasks.map((sub) => (
                <li
                  key={sub.id}
                  className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm"
                >
                  <span className="text-gray-800 dark:text-gray-200 break-all">{sub.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    aria-label={`Remove subtask: ${sub.title}`}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-2 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
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
