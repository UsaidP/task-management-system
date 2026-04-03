import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
import dayjs from "dayjs"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiDownload,
  FiFileText,
  FiPlus,
  FiSave,
  FiTag,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi"
import apiService from "../../../service/apiService"
import { useAuth } from "../../contexts/customHook"
import SubtaskView from "./SubtaskView"

const priorityOptions = [
  {
    id: "low",
    name: "Low",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  {
    id: "medium",
    name: "Medium",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  {
    id: "high",
    name: "High",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  {
    id: "urgent",
    name: "Urgent",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    dot: "bg-red-500",
  },
]

const statusOptions = [
  {
    id: "todo",
    name: "To Do",
    bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    id: "in-progress",
    name: "In Progress",
    bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    id: "under-review",
    name: "In Review",
    bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    id: "completed",
    name: "Done",
    bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
]

const TaskDetailPanel = ({ isOpen, onClose, task, members, onTaskUpdated }) => {
  const { user: currentUser } = useAuth()
  const [formData, setFormData] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState("subtasks")
  const [prevTaskId, setPrevTaskId] = useState(null)

  // Map members to selection options - memoized to prevent re-creation
  const assigneeOptions = useMemo(() => {
    if (!members || members.length === 0) return []
    return members.map((member) => {
      const u = member.user || member
      return {
        id: u._id,
        name: u.fullname || u.email || "Unknown",
        avatar: u.avatar?.url || `https://i.pravatar.cc/150?u=${u._id}`,
      }
    })
  }, [members])

  // Compute assignedToIds from formData - memoized
  const assignedToIds = useMemo(() => {
    if (!formData?.assignedTo) return []
    return formData.assignedTo.map((a) => (typeof a === "object" ? a._id : a))
  }, [formData?.assignedTo])

  // Only update formData when task actually changes (by ID) or panel opens
  useEffect(() => {
    if (task && isOpen && task._id !== prevTaskId) {
      // Normalize assignedTo to only contain IDs
      const normalizedAssignedTo =
        task.assignedTo?.map((a) => (typeof a === "object" ? a._id : a)) || []

      setFormData({
        ...task,
        assignedTo: normalizedAssignedTo,
      })
      setPrevTaskId(task._id)
    }

    // Reset when panel closes
    if (!isOpen) {
      setFormData(null)
      setPrevTaskId(null)
    }
  }, [task, isOpen, prevTaskId])

  // Early return AFTER all hooks
  if (!isOpen || !formData) return null

  // Fallback projectId lookup since global tasks might have a populated project object
  const projectId = typeof formData.project === "object" ? formData.project._id : formData.project

  // Field change handlers - NO auto-save, just update local state
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleUpdate = async () => {
    console.log("=== handleUpdate CLICKED ===")
    console.log("projectId:", projectId)
    console.log("formData._id:", formData?._id)

    if (!projectId || !formData?._id) {
      console.error("handleUpdate - Missing IDs:", { projectId, taskId: formData?._id })
      toast.error("Missing task or project ID")
      return
    }

    console.log("handleUpdate - payload:", {
      title: formData.title?.trim(),
      description: formData.description?.trim() || "",
      status: formData.status,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate || null,
      labels: Array.isArray(formData.labels) ? formData.labels : formData.labels?.trim() || "",
    })

    setIsUpdating(true)
    const toastId = toast.loading("Updating task...")
    try {
      const response = await apiService.updateTask(projectId, formData._id, {
        title: formData.title?.trim(),
        description: formData.description?.trim() || "",
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate || null,
        labels: Array.isArray(formData.labels) ? formData.labels : formData.labels?.trim() || "",
      })
      console.log("handleUpdate - response:", response)
      if (response.success) {
        onTaskUpdated(response.data || formData)
        toast.success("Task updated!", { id: toastId })
      } else {
        toast.error(response.message || "Failed to update task", { id: toastId })
      }
    } catch (err) {
      console.error("handleUpdate - error:", err)
      toast.error(err.message || "An error occurred.", { id: toastId })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setIsSubmitting(true)

    const newCommentObj = { content: newComment, user: currentUser._id }
    const updatedComments = [...(formData.comments || []), newCommentObj]

    // Add locally for instant feedback
    setFormData((prev) => ({ ...prev, comments: updatedComments }))
    setNewComment("")

    try {
      const response = await apiService.updateTask(projectId, formData._id, {
        comments: updatedComments,
      })
      if (response.success) {
        onTaskUpdated(response.data || response.task) // Sync up
      }
    } catch (_err) {
      toast.error("Failed to add comment")
      // Revert optimism if needed by refetching or stripping
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await apiService.deleteComment(projectId, formData._id, commentId)
      if (response.success) {
        const updatedComments = (formData.comments || []).filter((c) => c._id !== commentId)
        setFormData((prev) => ({ ...prev, comments: updatedComments }))
        onTaskUpdated(response.data)
        toast.success("Comment deleted")
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete comment")
    }
  }

  const isCommentOwner = (comment) => {
    return (
      currentUser &&
      comment.user &&
      (comment.user._id === currentUser._id || comment.user === currentUser._id)
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-light-bg-primary/20 dark:bg-dark-bg-primary/40 backdrop-blur-sm z-40 transition-opacity"
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
            animate={{ x: 0, boxShadow: "-10px 0 30px rgba(0,0,0,0.1)" }}
            exit={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[500px] bg-light-bg-primary dark:bg-dark-bg-tertiary z-50 flex flex-col border-l border-light-border dark:border-dark-border overflow-hidden"
          >
            {/* Header / Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Badge */}
                <Listbox
                  value={formData.status}
                  onChange={(val) => handleFieldChange("status", val)}
                >
                  <div className="relative">
                    <ListboxButton
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80 border border-transparent hover:border-light-border dark:hover:border-dark-border ${statusOptions.find((s) => s.id === formData.status)?.bg || "bg-light-bg-secondary dark:bg-dark-bg-tertiary"}`}
                    >
                      {statusOptions.find((o) => o.id === formData.status)?.name || "Status"}
                    </ListboxButton>
                    <ListboxOptions className="absolute left-0 mt-1 w-36 bg-white dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                      {statusOptions.map((option) => (
                        <ListboxOption
                          key={option.id}
                          value={option.id}
                          className={({ active }) =>
                            `px-4 py-2 text-sm cursor-pointer transition-colors ${active ? "bg-light-bg-hover dark:bg-dark-bg-hover" : ""}`
                          }
                        >
                          {option.name}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>

                {/* Priority Badge */}
                <Listbox
                  value={formData.priority}
                  onChange={(val) => handleFieldChange("priority", val)}
                >
                  <div className="relative">
                    <ListboxButton
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border border-transparent hover:border-light-border dark:hover:border-dark-border ${priorityOptions.find((p) => p.id === formData.priority)?.color || "bg-slate-100 text-slate-700"}`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {priorityOptions.find((p) => p.id === formData.priority)?.name ||
                          "Priority"}
                      </span>
                    </ListboxButton>
                    <ListboxOptions className="absolute left-0 mt-1 w-40 bg-white dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                      {priorityOptions.map((option) => (
                        <ListboxOption
                          key={option.id}
                          value={option.id}
                          className={({ active }) =>
                            `px-4 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors ${active ? "bg-light-bg-hover dark:bg-dark-bg-hover" : ""}`
                          }
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${option.dot}`} />
                          <span className="text-xs font-semibold uppercase tracking-wider">
                            {option.name}
                          </span>
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1.5"
                >
                  <FiSave className="w-3.5 h-3.5" />
                  {isUpdating ? "Saving..." : "Update"}
                </button>
                <button
                  onClick={async () => {
                    const confirm = window.confirm("Delete this task?")
                    if (confirm) {
                      await apiService.deleteTask(projectId, formData._id)
                      toast.success("Task deleted")
                      onClose()
                      // Ideally trigger a refresh in the parent view.
                    }
                  }}
                  className="p-2 text-light-text-tertiary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-light-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
              <div className="p-6 space-y-8">
                {/* Title & Description */}
                <div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="w-full text-2xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border hover:border-accent-primary dark:hover:border-accent-primary focus:border-accent-primary rounded-xl px-4 py-3 mb-3 placeholder:text-light-text-tertiary transition-colors"
                    placeholder="Task Title"
                  />
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    className="w-full text-sm text-light-text-secondary dark:text-dark-text-secondary bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border hover:border-accent-primary dark:hover:border-accent-primary focus:border-accent-primary rounded-xl px-4 py-3 resize-none min-h-[100px] placeholder:text-light-text-tertiary selection:bg-accent-primary/20 transition-colors"
                    placeholder="Add a description..."
                  />
                </div>

                {/* Meta Attributes Grid */}
                <div className="grid grid-cols-[120px_1fr] gap-y-4 text-sm items-center">
                  {/* Assignees */}
                  <div className="text-light-text-tertiary dark:text-dark-text-tertiary flex items-center gap-2">
                    <FiUser className="w-4 h-4" /> Assignees
                  </div>
                  <div>
                    <Listbox
                      value={assignedToIds}
                      onChange={(val) => handleFieldChange("assignedTo", val)}
                      multiple
                    >
                      <div className="relative inline-block w-full">
                        <ListboxButton className="flex items-center gap-2 min-h-[40px] bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border hover:border-accent-primary dark:hover:border-accent-primary px-3 py-2 rounded-xl transition-colors w-full text-left">
                          {assignedToIds.length === 0 ? (
                            <span className="text-light-text-tertiary italic text-sm pl-1">
                              Click to add assignees...
                            </span>
                          ) : (
                            <div className="flex -space-x-2">
                              {assignedToIds.map((id) => {
                                const opt = assigneeOptions.find((a) => a.id === id)
                                if (!opt) return null
                                return (
                                  <img
                                    key={opt.id}
                                    src={opt.avatar}
                                    alt={opt.name}
                                    title={opt.name}
                                    className="w-6 h-6 rounded-full border-2 border-white dark:border-dark-bg-secondary ring-2 ring-accent-primary/20"
                                  />
                                )
                              })}
                            </div>
                          )}
                        </ListboxButton>
                        <ListboxOptions className="absolute left-0 mt-1 w-64 max-h-48 overflow-y-auto bg-white dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-xl shadow-lg z-50 py-1">
                          {assigneeOptions.map((option) => {
                            const selected = assignedToIds.includes(option.id)
                            return (
                              <ListboxOption
                                key={option.id}
                                value={option.id}
                                className={({ active }) =>
                                  `flex items-center gap-3 px-4 py-2 text-sm cursor-pointer transition-colors ${active ? "bg-light-bg-hover dark:bg-dark-bg-hover" : ""}`
                                }
                              >
                                <div className="flex-1 flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary">
                                  <img
                                    src={option.avatar}
                                    alt=""
                                    className="w-5 h-5 rounded-full"
                                  />
                                  <span className="truncate">{option.name}</span>
                                </div>
                                {selected && <FiCheck className="text-accent-primary w-4 h-4" />}
                              </ListboxOption>
                            )
                          })}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>

                  {/* Due Date */}
                  <div className="text-light-text-tertiary dark:text-dark-text-tertiary flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" /> Due Date
                  </div>
                  <div>
                    <input
                      type="date"
                      value={formData.dueDate ? dayjs(formData.dueDate).format("YYYY-MM-DD") : ""}
                      onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                      className="text-sm bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border hover:border-accent-primary dark:hover:border-accent-primary focus:border-accent-primary rounded-xl px-3 py-2 text-light-text-secondary dark:text-dark-text-secondary cursor-pointer transition-colors w-full"
                    />
                  </div>

                  {/* Priority */}
                  <div className="text-light-text-tertiary dark:text-dark-text-tertiary flex items-center gap-2">
                    <FiTag className="w-4 h-4" /> Priority
                  </div>
                  <div>
                    <Listbox
                      value={formData.priority}
                      onChange={(val) => handleFieldChange("priority", val)}
                    >
                      <div className="relative inline-block w-full">
                        <ListboxButton className="flex items-center gap-2 min-h-[40px] bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border hover:border-accent-primary dark:hover:border-accent-primary px-3 py-2 rounded-xl transition-colors w-full text-left">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${priorityOptions.find((p) => p.id === formData.priority)?.color || "bg-slate-100 text-slate-700"}`}
                          >
                            {priorityOptions.find((p) => p.id === formData.priority)?.name ||
                              "Set Priority"}
                          </span>
                        </ListboxButton>
                        <ListboxOptions className="absolute left-0 mt-1 w-40 bg-white dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                          {priorityOptions.map((option) => (
                            <ListboxOption
                              key={option.id}
                              value={option.id}
                              className={({ active }) =>
                                `flex items-center gap-2 px-4 py-2 text-sm cursor-pointer transition-colors ${active ? "bg-light-bg-hover dark:bg-dark-bg-hover" : "text-light-text-secondary dark:text-dark-text-secondary"}`
                              }
                            >
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${option.color}`}
                              >
                                {option.name}
                              </span>
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                </div>

                {/* Tabs for Subtasks / Comments */}
                <div className="border-t border-light-border dark:border-dark-border pt-6 mt-6 !mb-0" />

                <div className="flex border-b border-light-border dark:border-dark-border">
                  <button
                    onClick={() => setActiveTab("subtasks")}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "subtasks" ? "border-accent-primary text-accent-primary" : "border-transparent text-light-text-tertiary hover:text-light-text-secondary"}`}
                  >
                    Subtasks
                  </button>
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "comments" ? "border-accent-primary text-accent-primary" : "border-transparent text-light-text-tertiary hover:text-light-text-secondary"}`}
                  >
                    Activity{" "}
                    <span className="text-[10px] bg-light-bg-hover dark:bg-dark-bg-hover px-1.5 py-0.5 rounded-full text-light-text-secondary">
                      {formData.comments?.length || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("attachments")}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "attachments" ? "border-accent-primary text-accent-primary" : "border-transparent text-light-text-tertiary hover:text-light-text-secondary"}`}
                  >
                    Attachments{" "}
                    <span className="text-[10px] bg-light-bg-hover dark:bg-dark-bg-hover px-1.5 py-0.5 rounded-full text-light-text-secondary">
                      {formData.attachments?.length || 0}
                    </span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[200px] !mt-4">
                  {activeTab === "subtasks" && <SubtaskView taskId={formData._id} />}

                  {activeTab === "comments" && (
                    <div className="flex flex-col h-full gap-4">
                      {/* Comments Feed */}
                      <div className="flex-1 space-y-4">
                        {formData.comments?.map((comment, i) => {
                          const author = assigneeOptions.find((a) => a.id === comment.user) || {
                            name: "User",
                            avatar: "https://i.pravatar.cc/150",
                          }
                          return (
                            <div key={i} className="flex gap-3 items-start group">
                              <img
                                src={author.avatar}
                                alt=""
                                className="w-8 h-8 rounded-full flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-medium text-sm text-light-text-primary dark:text-dark-text-primary">
                                    {author.name}
                                  </span>
                                  {isCommentOwner(comment) && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(comment._id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-light-text-tertiary hover:text-error transition-opacity"
                                    >
                                      <FiTrash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary bg-light-bg-secondary dark:bg-dark-bg-tertiary p-3 rounded-tr-xl rounded-b-xl rounded-bl-sm">
                                  {comment.content}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {(!formData.comments || formData.comments.length === 0) && (
                          <div className="text-sm text-light-text-tertiary text-center py-8">
                            No comments yet. Start the conversation!
                          </div>
                        )}
                      </div>

                      {/* Add Comment Input */}
                      <div className="relative mt-auto border-t border-light-border dark:border-dark-border pt-4">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-primary resize-none min-h-[80px]"
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || isSubmitting}
                          className="absolute right-3 bottom-5 btn-primary py-1.5 px-3 text-xs"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "attachments" && (
                    <div className="flex flex-col h-full gap-4">
                      <div className="flex-1">
                        {formData.attachments && formData.attachments.length > 0 ? (
                          <AttachmentGrid
                            attachments={formData.attachments}
                            projectId={projectId}
                            taskId={formData._id}
                            onDelete={(index) => {
                              const updatedAttachments = formData.attachments.filter(
                                (_, idx) => idx !== index
                              )
                              setFormData((prev) => ({
                                ...prev,
                                attachments: updatedAttachments,
                              }))
                            }}
                          />
                        ) : (
                          <div className="text-center py-8">
                            <FiFileText className="w-12 h-12 mx-auto mb-2 text-light-text-tertiary opacity-50" />
                            <p className="text-sm text-light-text-tertiary">No attachments yet.</p>
                            <p className="text-xs text-light-text-tertiary mt-1">
                              Upload files to attach to this task
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Upload Button */}
                      <div className="border-t border-light-border dark:border-dark-border pt-4">
                        <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-light-border dark:border-dark-border rounded-xl cursor-pointer hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors">
                          <FiPlus className="w-5 h-5 text-light-text-tertiary" />
                          <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            Add Attachment
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return

                              console.log("Uploading attachment:", file.name, file.size, file.type)
                              console.log("Project ID:", projectId)
                              console.log("Task ID:", formData._id)

                              try {
                                const formDataAttach = new FormData()
                                formDataAttach.append("file", file)

                                const response = await apiService.uploadAttachment(
                                  projectId,
                                  formData._id,
                                  formDataAttach
                                )

                                console.log("Upload response:", response)

                                if (response.success) {
                                  let imageUrl =
                                    response.data?.url || response.data?.data?.url || response.data

                                  // Ensure ImageKit URL has proper format
                                  if (imageUrl && imageUrl.includes("ik.imagekit.io")) {
                                    // Add cache-busting parameter
                                    imageUrl =
                                      imageUrl +
                                      (imageUrl.includes("?") ? "&" : "?") +
                                      "t=" +
                                      Date.now()
                                  }

                                  const newAttachment = {
                                    filename: file.name,
                                    url: imageUrl,
                                  }
                                  console.log("New attachment:", newAttachment)

                                  const updatedAttachments = [
                                    ...(formData.attachments || []),
                                    newAttachment,
                                  ]
                                  setFormData((prev) => ({
                                    ...prev,
                                    attachments: updatedAttachments,
                                  }))
                                  toast.success("Attachment uploaded: " + file.name)
                                } else {
                                  toast.error(
                                    "Upload failed: " + (response.message || "Unknown error")
                                  )
                                }
                              } catch (err) {
                                console.error("Upload error:", err)
                                toast.error(err.message || "Failed to upload attachment")
                              }

                              // Reset file input
                              e.target.value = ""
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TaskDetailPanel

// Attachment Grid Component
const AttachmentGrid = ({ attachments, projectId, taskId, onDelete }) => {
  const [imgErrors, setImgErrors] = useState({})

  const handleImageError = (index) => {
    const imgUrl = attachments[index].url
    console.error("Failed to load image:", imgUrl)

    // Fetch the image to see what's being returned
    fetch(imgUrl, { method: "HEAD" })
      .then((res) => {
        console.error(`Image status: ${res.status} ${res.statusText}`)
        console.error(`Content-Type: ${res.headers.get("content-type")}`)
      })
      .catch((err) => console.error("Fetch error:", err))

    setImgErrors((prev) => ({ ...prev, [index]: true }))
  }

  // Get ImageKit URL - return as-is or with query params preserved
  const getProxyUrl = (url) => {
    if (!url) return ""
    return url
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {attachments.map((attachment, i) => {
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.filename || attachment.url)
        const hasError = imgErrors[i]

        if (isImage && !hasError) {
          const proxyUrl = getProxyUrl(attachment.url)
          return (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden border border-light-border dark:border-dark-border hover:border-accent-primary transition-colors group bg-light-bg-secondary dark:bg-dark-bg-tertiary"
            >
              <img
                src={proxyUrl}
                alt={attachment.filename || "Attachment"}
                className="w-full h-full object-cover"
                onError={() => handleImageError(i)}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a
                  href={proxyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                  title="Download"
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(proxyUrl, "_blank")
                  }}
                >
                  <FiDownload className="w-4 h-4 text-white" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      apiService.deleteAttachment(projectId, taskId, i)
                      onDelete(i)
                      toast.success("Attachment removed")
                    } catch (_err) {
                      toast.error("Failed to remove attachment")
                    }
                  }}
                  className="p-2 bg-white/20 rounded-full hover:bg-red-500"
                  title="Delete"
                >
                  <FiTrash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )
        }

        return (
          <div
            key={i}
            className="flex flex-col items-center gap-2 p-4 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border hover:border-accent-primary transition-colors group relative"
          >
            {isImage && hasError ? (
              <FiAlertCircle className="w-8 h-8 text-accent-warning" />
            ) : (
              <FiFileText className="w-8 h-8 text-light-text-tertiary" />
            )}
            <span
              className="text-xs text-light-text-secondary dark:text-dark-text-secondary text-center truncate w-full"
              title={attachment.filename}
            >
              {attachment.filename || "Attachment"}
            </span>
            {isImage && hasError && (
              <span className="text-[10px] text-accent-warning text-center">
                Image not accessible
              </span>
            )}
            <div className="flex gap-2 mt-2">
              <a
                href={getProxyUrl(attachment.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs bg-accent-primary text-white rounded-lg hover:bg-accent-primary/80 transition-colors flex items-center gap-1"
              >
                <FiDownload className="w-3.5 h-3.5" />
                {isImage && hasError ? "Open" : "Download"}
              </a>
              <a
                href={getProxyUrl(attachment.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs bg-light-bg-hover dark:bg-dark-bg-hover text-light-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
              >
                Preview
              </a>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  apiService.deleteAttachment(projectId, taskId, i)
                  onDelete(i)
                  toast.success("Attachment removed")
                } catch (_err) {
                  toast.error("Failed to remove attachment")
                }
              }}
              className="absolute top-2 right-2 p-1.5 bg-light-bg-hover dark:bg-dark-bg-hover rounded-lg opacity-0 group-hover:opacity-100 hover:bg-error/20"
              title="Delete"
            >
              <FiTrash2 className="w-3.5 h-3.5 text-error" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
