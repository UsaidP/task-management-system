import {
  AlertCircle,
  AlignLeft,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Flag,
  Hash,
  ListChecks,
  Paperclip,
  Plus,
  Tag,
  Trash2,
  Type,
  Upload,
  User,
  X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import apiService from "../../../service/apiService"
import Modal from "../Modal"
import SubtaskView from "./SubtaskView"

// ─── Option Data ──────────────────────────────────
const priorityOptions = [
  {
    value: "urgent",
    label: "Urgent",
    color:
      "bg-accent-danger/10 text-accent-danger border-accent-danger/30 dark:bg-accent-danger/20 dark:text-accent-danger-light dark:border-accent-danger/40",
    dot: "bg-accent-danger",
  },
  {
    value: "high",
    label: "High",
    color:
      "bg-accent-danger-light/10 text-accent-danger-light border-accent-danger-light/30 dark:bg-accent-danger-light/20 dark:text-accent-danger-light dark:border-accent-danger-light/40",
    dot: "bg-accent-danger-light",
  },
  {
    value: "medium",
    label: "Medium",
    color:
      "bg-accent-warning/10 text-accent-warning border-accent-warning/30 dark:bg-accent-warning/20 dark:text-accent-warning-light dark:border-accent-warning/40",
    dot: "bg-accent-warning",
  },
  {
    value: "low",
    label: "Low",
    color:
      "bg-accent-info/10 text-accent-info border-accent-info/30 dark:bg-accent-info/20 dark:text-accent-info-light dark:border-accent-info/40",
    dot: "bg-accent-info",
  },
]

const statusOptions = [
  {
    value: "todo",
    label: "To Do",
    color: "bg-task-status-todo/10 text-task-status-todo dark:bg-task-status-todo/20",
    dot: "bg-task-status-todo",
  },
  {
    value: "in-progress",
    label: "In Progress",
    color: "bg-task-status-progress/10 text-task-status-progress dark:bg-task-status-progress/20",
    dot: "bg-task-status-progress",
  },
  {
    value: "under-review",
    label: "Under Review",
    color: "bg-task-status-review/10 text-task-status-review dark:bg-task-status-review/20",
    dot: "bg-task-status-review",
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-task-status-done/10 text-task-status-done dark:bg-task-status-done/20",
    dot: "bg-task-status-done",
  },
]

const tagPresets = [
  { label: "Frontend", color: "bg-accent-primary/15 text-accent-primary border-accent-primary/25" },
  { label: "Backend", color: "bg-accent-info/15 text-accent-info border-accent-info/25" },
  { label: "Design", color: "bg-accent-purple/15 text-accent-purple border-accent-purple/25" },
  { label: "Bug", color: "bg-accent-danger/15 text-accent-danger border-accent-danger/25" },
  { label: "Feature", color: "bg-accent-success/15 text-accent-success border-accent-success/25" },
  {
    label: "Documentation",
    color: "bg-accent-warning/15 text-accent-warning border-accent-warning/25",
  },
  {
    label: "Testing",
    color: "bg-accent-secondary/30 text-accent-primary-dark border-accent-secondary/40",
  },
  {
    label: "DevOps",
    color: "bg-accent-info-dark/15 text-accent-info-dark border-accent-info-dark/25",
  },
  {
    label: "UX",
    color: "bg-accent-secondary-dark/15 text-accent-secondary-dark border-accent-secondary-dark/25",
  },
  {
    label: "Performance",
    color: "bg-accent-danger-light/15 text-accent-danger-light border-accent-danger-light/25",
  },
]

// ─── Sub-Components ─────────────────────────────────
const FormField = ({ label, icon: Icon, required, error, children, helpText, id }) => (
  <div>
    {label && id && (
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
      >
        {Icon && <Icon size={14} className="text-accent-primary dark:text-accent-primary-light" />}
        {label}
        {required && <span className="text-accent-danger">*</span>}
      </label>
    )}
    {children}
    {error && (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-accent-danger animate-slide-up">
        <AlertCircle size={12} />
        {error}
      </p>
    )}
    {helpText && !error && (
      <p className="mt-1.5 text-[11px] text-light-text-tertiary dark:text-dark-text-tertiary">
        {helpText}
      </p>
    )}
  </div>
)

// Input base styles
const inputBase =
  "w-full rounded-xl border px-4 py-3 text-sm text-light-text-primary dark:text-dark-text-primary bg-light-bg-primary dark:bg-dark-bg-tertiary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary outline-none transition-all duration-200"
const inputNormal =
  "border-light-border dark:border-dark-border hover:border-light-border-strong dark:hover:border-dark-border-strong focus:border-accent-primary dark:focus:border-accent-primary-light focus:ring-2 focus:ring-accent-primary/20 dark:focus:ring-accent-primary-light/20"
const inputError =
  "border-accent-danger shadow-[0_0_0_3px_rgba(196,74,74,0.15)] dark:shadow-[0_0_0_3px_rgba(196,74,74,0.25)]"

const EditTaskModal = ({ isOpen, onClose, onTaskUpdated, task, members }) => {
  const titleRef = useRef(null)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: [],
    dueDate: "",
    labels: "",
    estimatedHours: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prevTaskId, setPrevTaskId] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState("")
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)
  const [subtasks, setSubtasks] = useState([])
  const [newSubtask, setNewSubtask] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)

  const assigneeRef = useRef(null)
  const tagRef = useRef(null)

  // Map members to selection options
  const assigneeOptions = Array.isArray(members)
    ? members.map((member) => {
        const u = typeof member.user === "object" && member.user !== null ? member.user : member
        return {
          value: u?._id || member?._id || "",
          label: u?.fullname || member?.fullname || u?.email || member?.email || "Unknown",
          email: u?.email || member?.email || "",
          initials: (u?.fullname || member?.fullname || "?").charAt(0).toUpperCase(),
          color: "bg-accent-primary",
        }
      })
    : []

  // Populate the form when a task is provided - only when task ID changes
  useEffect(() => {
    if (task?._id && task._id !== prevTaskId) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        assignedTo: task.assignedTo?.map((a) => (typeof a === "object" ? a._id : a)) || [],
        labels: task.labels || "",
        estimatedHours: task.estimatedHours || "",
      })
      setPrevTaskId(task._id)

      // Set existing attachments
      if (task.attachments && Array.isArray(task.attachments)) {
        setAttachments(
          task.attachments.map((att) => ({
            filename: att.filename,
            size: att.size || 0,
            url: att.url,
            isLocal: false,
          }))
        )
      }

      // Parse labels into tags
      if (task.labels) {
        const parsedTags = task.labels.split(",").map((label, i) => {
          const trimmed = label.trim()
          const colors = [
            "bg-accent-primary/15 text-accent-primary border-accent-primary/25",
            "bg-accent-info/15 text-accent-info border-accent-info/25",
            "bg-accent-purple/15 text-accent-purple border-accent-purple/25",
            "bg-accent-success/15 text-accent-success border-accent-success/25",
          ]
          return {
            id: `tag-${i}`,
            label: trimmed,
            color: colors[i % colors.length],
          }
        })
        setTags(parsedTags)
      }
    }

    // Reset form when modal closes
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignedTo: [],
        dueDate: "",
        labels: "",
        estimatedHours: "",
      })
      setPrevTaskId(null)
      setErrors({})
      setAttachments([])
      setUploading(false)
      setTags([])
      setNewTag("")
      setShowTagSuggestions(false)
      setShowAssigneeDropdown(false)
    }
  }, [task, isOpen, prevTaskId])

  // Focus title on open
  useEffect(() => {
    if (isOpen && titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (assigneeRef.current && !assigneeRef.current.contains(e.target)) {
        setShowAssigneeDropdown(false)
      }
      if (tagRef.current && !tagRef.current.contains(e.target)) {
        setShowTagSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!isOpen || !task) return null

  // ─── Handlers ───────────────────────────────────
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = "Task title is required"
    if (formData.title.length > 200) newErrors.title = "Task title must be less than 200 characters"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    if (!task?._id) {
      toast.error("Task ID is missing")
      return
    }

    const projectId = typeof task.project === "object" ? task.project._id : task.project
    if (!projectId) {
      toast.error("Project ID is missing")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Updating task...")

    const payload = {
      title: formData.title?.trim(),
      description: formData.description?.trim() || "",
      status: formData.status,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate || null,
      labels: tags.map((t) => t.label).join(", ") || formData.labels.trim(),
      estimatedHours: formData.estimatedHours
        ? Number.parseFloat(formData.estimatedHours)
        : undefined,
    }

    try {
      const response = await apiService.updateTask(projectId, task._id, payload)

      if (response.success) {
        // Upload new attachments
        const newAttachments = attachments.filter((a) => a.isLocal)
        if (newAttachments.length > 0) {
          setUploading(true)
          toast.loading("Uploading attachments...", { id: toastId })
          for (const attachment of newAttachments) {
            if (attachment.file) {
              const formDataUpload = new FormData()
              formDataUpload.append("file", attachment.file)
              try {
                await apiService.uploadAttachment(projectId, task._id, formDataUpload)
              } catch (err) {
                console.error("Failed to upload attachment:", attachment.filename, err)
                toast.error(`Failed to upload ${attachment.filename}`)
              }
            }
          }
        }

        onTaskUpdated(response.data)
        toast.success("Task updated!", { id: toastId })
        onClose()
      } else {
        toast.error(response.message || "Failed to update task", { id: toastId })
      }
    } catch (error) {
      toast.error(error.message || "Failed to update task. Please try again.", { id: toastId })
      console.error("Failed to update task", error)
    } finally {
      setIsSubmitting(false)
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assignedTo: [],
      dueDate: "",
      labels: "",
      estimatedHours: "",
    })
    setPrevTaskId(null)
    setErrors({})
    setAttachments([])
    setUploading(false)
    setTags([])
    setNewTag("")
    setShowTagSuggestions(false)
    setShowAssigneeDropdown(false)
    onClose()
  }

  const addTag = (label, color) => {
    if (tags.some((t) => t.label === label)) return
    setTags((prev) => [...prev, { id: Date.now().toString(), label, color }])
    setNewTag("")
    setShowTagSuggestions(false)
  }

  const removeTag = (id) => {
    setTags((prev) => prev.filter((t) => t.id !== id))
  }

  const addCustomTag = () => {
    if (!newTag.trim()) return
    const colors = [
      "bg-accent-primary/15 text-accent-primary border-accent-primary/25",
      "bg-accent-info/15 text-accent-info border-accent-info/25",
      "bg-accent-purple/15 text-accent-purple border-accent-purple/25",
      "bg-accent-success/15 text-accent-success border-accent-success/25",
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    addTag(newTag.trim(), randomColor)
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    setSubtasks((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newSubtask.trim(), completed: false },
    ])
    setNewSubtask("")
  }

  const removeSubtask = (id) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  const toggleSubtask = (id) => {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)))
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newAttachments = files.map((file) => ({
      filename: file.name,
      size: file.size,
      file,
      url: URL.createObjectURL(file),
      isLocal: true,
    }))

    setAttachments((prev) => [...prev, ...newAttachments])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length === 0) return

    const newAttachments = files.map((file) => ({
      filename: file.name,
      size: file.size,
      file,
      url: URL.createObjectURL(file),
      isLocal: true,
    }))

    setAttachments((prev) => [...prev, ...newAttachments])
  }

  const removeAttachment = async (index) => {
    const attachment = attachments[index]

    // If it's an existing attachment on the server, delete it
    if (!attachment.isLocal && task?._id) {
      const projectId = typeof task.project === "object" ? task.project._id : task.project
      if (projectId) {
        const toastId = toast.loading("Removing attachment...")
        try {
          await apiService.deleteAttachment(projectId, task._id, index)
          setAttachments((prev) => prev.filter((_, i) => i !== index))
          toast.success("Attachment removed", { id: toastId })
        } catch (err) {
          toast.error("Failed to remove attachment", { id: toastId })
          console.error("Failed to remove attachment", err)
        }
      }
    } else {
      // Local attachment - just remove from state
      if (attachment.url) {
        URL.revokeObjectURL(attachment.url)
      }
      setAttachments((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes < 1024) return `${bytes || 0} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isImageFile = (filename) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename || "")

  const selectedPriority = priorityOptions.find((p) => p.value === formData.priority)
  const selectedStatus = statusOptions.find((s) => s.value === formData.status)
  const completedSubtasks = subtasks.filter((s) => s.completed).length
  const selectedAssignees = formData.assignedTo
    .map((id) => assigneeOptions.find((a) => a.value === id))
    .filter(Boolean)

  const isDragOverClass = isDragOver
    ? "border-accent-primary bg-accent-primary/5"
    : "border-light-border-strong bg-light-bg-primary"

  // ─── Render ─────────────────────────────────────
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Task" size="lg">
      <form onSubmit={handleSubmit} className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 -mx-6">
          {/* ─── Left Column: Main Details ───────── */}
          <div className="lg:col-span-2 px-6 py-6 space-y-6 border-r border-light-border dark:border-dark-border">
            {/* Title */}
            {/* biome-ignore lint/correctness/useUniqueElementIds: modal is singleton */}
            <FormField label="Task Title" icon={Type} required error={errors.title} id="edit-title">
              {/* biome-ignore lint/correctness/useUniqueElementIds: modal is singleton */}
              <input
                id="edit-title"
                ref={titleRef}
                type="text"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g., Implement user authentication flow"
                aria-required="true"
                aria-invalid={!!errors.title}
                className={`${inputBase} ${errors.title ? inputError : inputNormal}`}
              />
            </FormField>

            {/* Description */}
            {/* biome-ignore lint/correctness/useUniqueElementIds: modal is singleton */}
            <FormField label="Description" icon={AlignLeft} id="edit-description">
              {/* biome-ignore lint/correctness/useUniqueElementIds: modal is singleton */}
              <textarea
                id="edit-description"
                rows={4}
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the task in detail. Include acceptance criteria, context, and any relevant links..."
                className={`${inputBase} ${inputNormal} resize-none`}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-[11px] text-light-text-tertiary dark:text-dark-text-tertiary">
                  Supports markdown formatting
                </p>
                <p className="text-[11px] text-light-text-tertiary dark:text-dark-text-tertiary">
                  {formData.description.length}/2000
                </p>
              </div>
            </FormField>

            {/* Subtasks / Checklist */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ListChecks
                  size={14}
                  className="text-accent-primary dark:text-accent-primary-light"
                />
                <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Subtasks
                </span>
                {subtasks.length > 0 && (
                  <span className="text-[11px] text-light-text-tertiary dark:text-dark-text-tertiary font-normal">
                    ({completedSubtasks}/{subtasks.length} completed)
                  </span>
                )}
              </div>

              {/* Subtask List */}
              {subtasks.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="group flex items-center gap-3 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-tertiary px-3 py-2.5 transition-all hover:border-light-border-strong dark:hover:border-dark-border-strong"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSubtask(subtask.id)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer ${
                          subtask.completed
                            ? "bg-accent-success border-accent-success text-light-text-inverse"
                            : "border-light-border-strong dark:border-dark-border-strong hover:border-accent-primary dark:hover:border-accent-primary-light"
                        }`}
                        aria-label={subtask.completed ? "Mark as incomplete" : "Mark as complete"}
                      >
                        {subtask.completed && <Check size={12} />}
                      </button>
                      <span
                        className={`flex-1 text-sm transition-all ${
                          subtask.completed
                            ? "text-light-text-tertiary dark:text-dark-text-tertiary line-through"
                            : "text-light-text-secondary dark:text-dark-text-secondary"
                        }`}
                      >
                        {subtask.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSubtask(subtask.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-light-text-tertiary dark:text-dark-text-tertiary opacity-0 group-hover:opacity-100 hover:bg-accent-danger/10 hover:text-accent-danger transition-all cursor-pointer"
                        aria-label="Remove subtask"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Subtask Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSubtask()
                    }
                  }}
                  placeholder="Add a subtask and press Enter..."
                  className="flex-1 rounded-xl border border-dashed border-light-border-strong dark:border-dark-border-strong bg-light-bg-primary dark:bg-dark-bg-tertiary px-4 py-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary outline-none transition-all focus:border-accent-primary dark:focus:border-accent-primary-light focus:ring-2 focus:ring-accent-primary/20 dark:focus:ring-accent-primary-light/20"
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  disabled={!newSubtask.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-tertiary dark:text-dark-text-tertiary hover:bg-accent-primary hover:text-light-text-inverse dark:hover:text-dark-text-inverse disabled:opacity-40 disabled:hover:bg-light-bg-tertiary disabled:hover:text-light-text-tertiary transition-all cursor-pointer"
                  aria-label="Add subtask"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Progress bar for subtasks */}
              {subtasks.length > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent-success transition-all duration-500 ease-out"
                      style={{
                        width: `${subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div ref={tagRef}>
              <div className="flex items-center gap-2 mb-2">
                <Tag size={14} className="text-accent-primary dark:text-accent-primary-light" />
                <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Tags
                </span>
              </div>

              {/* Selected Tags */}
              {tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${tag.color}`}
                    >
                      {tag.label}
                      <button
                        type="button"
                        onClick={() => removeTag(tag.id)}
                        className="ml-0.5 hover:opacity-70 transition-opacity cursor-pointer"
                        aria-label={`Remove ${tag.label} tag`}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Hash
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary pointer-events-none"
                    />
                    {/* biome-ignore lint/correctness/useUniqueElementIds: Accessibility form IDs need stable identifiers */}
                    <input
                      id="edit-tags"
                      type="text"
                      value={newTag}
                      onChange={(e) => {
                        setNewTag(e.target.value)
                        setShowTagSuggestions(true)
                      }}
                      onFocus={() => setShowTagSuggestions(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          const match = tagPresets.find((t) =>
                            t.label.toLowerCase().includes(newTag.toLowerCase())
                          )
                          if (match) addTag(match.label, match.color)
                          else addCustomTag()
                        }
                      }}
                      placeholder="Type to search or create tags..."
                      className="w-full rounded-xl border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-tertiary py-2.5 pl-9 pr-4 text-sm text-light-text-secondary dark:text-dark-text-secondary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary outline-none transition-all hover:border-light-border-strong dark:hover:border-dark-border-strong focus:border-accent-primary dark:focus:border-accent-primary-light focus:ring-2 focus:ring-accent-primary/20 dark:focus:ring-accent-primary-light/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addCustomTag}
                    disabled={!newTag.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-tertiary dark:text-dark-text-tertiary hover:bg-accent-primary hover:text-light-text-inverse dark:hover:text-dark-text-inverse disabled:opacity-40 disabled:hover:bg-light-bg-tertiary disabled:hover:text-light-text-tertiary transition-all cursor-pointer"
                    aria-label="Add custom tag"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Tag Suggestions Dropdown */}
                {showTagSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-10 rounded-xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary shadow-lg overflow-hidden">
                    <div className="px-3 py-2 border-b border-light-border dark:border-dark-border">
                      <p className="text-[11px] font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                        Suggested Tags
                      </p>
                    </div>
                    <div className="p-2 max-h-40 overflow-y-auto">
                      {tagPresets
                        .filter((t) => t.label.toLowerCase().includes(newTag.toLowerCase()))
                        .map((tag) => {
                          const isSelected = tags.some((existing) => existing.label === tag.label)
                          return (
                            <button
                              key={tag.label}
                              type="button"
                              onClick={() => addTag(tag.label, tag.color)}
                              disabled={isSelected}
                              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-tertiary dark:text-dark-text-tertiary cursor-not-allowed"
                                  : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                              }`}
                            >
                              <span
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] ${tag.color}`}
                              >
                                <Tag size={10} />
                              </span>
                              {tag.label}
                              {isSelected && (
                                <Check size={13} className="ml-auto text-accent-success" />
                              )}
                            </button>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label
                htmlFor="edit-attachments"
                className="flex items-center gap-2 text-sm font-medium text-light-text-primary mb-2"
              >
                <Paperclip size={14} className="text-accent-primary" />
                Attachments
              </label>

              {/* File Input */}
              {/* biome-ignore lint/a11y/useSemanticElements: Dropzone requires div for drag-and-drop styling */}
              <div
                role="button"
                tabIndex={0}
                className="rounded-xl border-2 border-dashed border-light-border-strong bg-light-bg-primary px-6 py-8 text-center transition-colors hover:border-accent-primary/40 hover:bg-accent-primary/5 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Image size={20} className="text-light-text-tertiary" />
                  <FileText size={20} className="text-light-text-tertiary" />
                </div>
                <p className="text-sm font-medium text-light-text-secondary">
                  Drag & drop files here, or{" "}
                  <span className="text-accent-primary cursor-pointer hover:underline">browse</span>
                </p>
                <p className="mt-1 text-[11px] text-light-text-tertiary">
                  Supports PNG, JPG, PDF, DOC up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                />
              </div>

              {/* Selected Files */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={`${attachment.filename}-${index}`}
                      className="group flex items-center gap-3 p-3 rounded-lg border border-light-border bg-light-bg-primary hover:border-accent-primary/30 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {isImageFile(attachment.filename) ? (
                          <img
                            src={attachment.url}
                            alt={attachment.filename}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-light-bg-tertiary">
                            <Paperclip size={16} className="text-light-text-tertiary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-light-text-primary truncate">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-light-text-tertiary">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-light-text-tertiary hover:bg-accent-danger/10 hover:text-accent-danger opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploading && (
                <p className="text-xs text-light-text-tertiary mt-2">Uploading attachments...</p>
              )}
            </div>
          </div>

          {/* ─── Right Column: Settings ──────────── */}
          <div className="p-6 space-y-5 bg-light-bg-primary/50">
            <h3 className="text-xs font-semibold text-light-text-tertiary uppercase tracking-wider">
              Task Settings
            </h3>

            {/* Assignee */}
            <div ref={assigneeRef}>
              <label
                htmlFor="edit-assignee"
                className="flex items-center gap-2 text-sm font-medium text-light-text-primary mb-2"
              >
                <User size={14} className="text-accent-primary" />
                Assignee
              </label>
              <div className="relative">
                {/* biome-ignore lint/correctness/useUniqueElementIds: Accessibility form IDs need stable identifiers */}
                <button
                  type="button"
                  id="edit-assignee"
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  className="w-full flex items-center justify-between rounded-xl border border-light-border bg-light-bg-primary px-3 py-2.5 text-sm hover:border-light-border-strong transition-all"
                >
                  <span className="flex items-center gap-2">
                    {formData.assignedTo.length > 0 ? (
                      <div className="flex -space-x-2">
                        {selectedAssignees.slice(0, 3).map((a) => (
                          <div
                            key={a.value}
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${a.color} text-[10px] font-bold text-white border-2 border-light-bg-primary`}
                          >
                            {a.initials}
                          </div>
                        ))}
                        {selectedAssignees.length > 3 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-light-bg-tertiary text-[10px] text-light-text-tertiary border-2 border-light-bg-primary">
                            +{selectedAssignees.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-light-text-tertiary">Assign to...</span>
                    )}
                    {formData.assignedTo.length > 0 && (
                      <span className="text-light-text-primary">
                        {formData.assignedTo.length} selected
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-light-text-tertiary transition-transform ${showAssigneeDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {showAssigneeDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-10 rounded-xl border border-light-border bg-light-bg-secondary shadow-lg overflow-hidden">
                    <div className="p-1.5 max-h-52 overflow-y-auto">
                      {assigneeOptions.length === 0 ? (
                        <p className="px-3 py-4 text-center text-sm text-light-text-tertiary">
                          No members available
                        </p>
                      ) : (
                        assigneeOptions.map((assignee) => {
                          const isSelected = formData.assignedTo.includes(assignee.value)
                          return (
                            <button
                              key={assignee.value}
                              type="button"
                              onClick={() => {
                                updateField(
                                  "assignedTo",
                                  isSelected
                                    ? formData.assignedTo.filter((id) => id !== assignee.value)
                                    : [...formData.assignedTo, assignee.value]
                                )
                              }}
                              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isSelected
                                  ? "bg-accent-primary/10 text-accent-primary font-medium"
                                  : "text-light-text-secondary hover:bg-light-bg-hover"
                              }`}
                            >
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full ${assignee.color} text-[10px] font-bold text-white`}
                              >
                                {assignee.initials}
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <p className="text-light-text-primary leading-tight truncate">
                                  {assignee.label}
                                </p>
                                <p className="text-[10px] text-light-text-tertiary leading-tight truncate">
                                  {assignee.email}
                                </p>
                              </div>
                              {isSelected && (
                                <Check size={14} className="text-accent-primary shrink-0" />
                              )}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="edit-priority"
                className="flex items-center gap-2 text-sm font-medium text-light-text-primary mb-2"
              >
                <Flag size={14} className="text-accent-primary" />
                Priority
              </label>
              {/* biome-ignore lint/correctness/useUniqueElementIds: Accessibility form IDs need stable identifiers */}
              <div className="flex flex-wrap gap-2" id="edit-priority">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("priority", option.value)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      formData.priority === option.value
                        ? `${option.color} ring-1 ring-current/20 scale-105`
                        : "border-light-border text-light-text-tertiary hover:border-light-border-strong hover:text-light-text-secondary"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${formData.priority === option.value ? option.dot : "bg-light-text-tertiary/40"}`}
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="edit-status"
                className="flex items-center gap-2 text-sm font-medium text-light-text-primary mb-2"
              >
                <Clock size={14} className="text-accent-primary" />
                Status
              </label>
              {/* biome-ignore lint/correctness/useUniqueElementIds: Accessibility form IDs need stable identifiers */}
              <div className="flex flex-wrap gap-2" id="edit-status">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("status", option.value)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      formData.status === option.value
                        ? `${option.color} border-transparent ring-1 ring-current/20 scale-105`
                        : "border-light-border text-light-text-tertiary hover:border-light-border-strong hover:text-light-text-secondary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="edit-due-date"
                className="flex items-center gap-2 text-sm font-medium text-light-text-primary mb-2"
              >
                <Calendar size={14} className="text-accent-primary" />
                Due Date
              </label>
              {/* biome-ignore lint/correctness/useUniqueElementIds: Accessibility form IDs need stable identifiers */}
              <input
                id="edit-due-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => updateField("dueDate", e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm bg-light-bg-primary text-light-text-primary outline-none transition-all ${
                  errors.dueDate
                    ? "border-accent-danger shadow-[0_0_0_3px_rgba(196,74,74,0.15)]"
                    : "border-light-border hover:border-light-border-strong focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-accent-danger">
                  <AlertCircle size={12} />
                  {errors.dueDate}
                </p>
              )}
            </div>

            {/* Estimated Hours */}
            <div>
              <label
                htmlFor="edit-estimated-hours"
                className="flex items-center gap-2 text-sm font-medium text-light-text-primary mb-2"
              >
                <Clock size={14} className="text-accent-primary" />
                Estimated Hours
              </label>
              {/* biome-ignore lint/correctness/useUniqueElementIds: Accessibility form IDs need stable identifiers */}
              <input
                id="edit-estimated-hours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => updateField("estimatedHours", e.target.value)}
                placeholder="e.g., 4.5"
                className="w-full rounded-xl border border-light-border bg-light-bg-primary px-3 py-2.5 text-sm text-light-text-primary placeholder-light-text-tertiary outline-none transition-all hover:border-light-border-strong focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
              />
            </div>

            {/* Summary Card */}
            <div className="rounded-xl border border-light-border bg-light-bg-secondary p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-light-text-tertiary uppercase tracking-wider">
                Summary
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-light-text-tertiary">Priority</span>
                  <span className="text-light-text-secondary font-medium flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${selectedPriority?.dot}`} />
                    {selectedPriority?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-light-text-tertiary">Status</span>
                  <span className="text-light-text-secondary font-medium">
                    {selectedStatus?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-light-text-tertiary">Due</span>
                  <span className="text-light-text-secondary font-medium">
                    {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-light-text-tertiary">Assignees</span>
                  <span className="text-light-text-secondary font-medium">
                    {selectedAssignees.length > 0 ? selectedAssignees.length : "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-light-text-tertiary">Tags</span>
                  <span className="text-light-text-secondary font-medium">
                    {tags.length > 0 ? tags.map((t) => t.label).join(", ") : "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-light-text-tertiary">Files</span>
                  <span className="text-light-text-secondary font-medium">
                    {attachments.length > 0 ? attachments.length : "None"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Footer ─────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-light-border">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-light-border px-5 py-2.5 text-sm font-medium text-light-text-secondary hover:bg-light-bg-hover hover:text-light-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="rounded-xl bg-accent-primary px-6 py-2.5 text-sm font-medium text-white shadow-md hover:bg-accent-primary-dark hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </>
            ) : (
              <>
                <Check size={16} />
                Update Task
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditTaskModal
