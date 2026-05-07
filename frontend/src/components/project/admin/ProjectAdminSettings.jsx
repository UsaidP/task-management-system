import { useState } from "react"
import toast from "react-hot-toast"
import {
  TriangleAlertIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
  XIcon,
} from "@animateicons/react/lucide"
import { Archive, Save } from "lucide-react"
import apiService from "../../../../service/apiService.js"

const ProjectAdminSettings = ({ project, setProject, projectId }) => {
  const [name, setName] = useState(project?.name || "")
  const [description, setDescription] = useState(project?.description || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Project name is required")
      return
    }
    setIsSaving(true)
    const toastId = toast.loading("Saving changes...")
    try {
      const response = await apiService.updateProject(projectId, {
        name: name.trim(),
        description: description.trim(),
      })
      if (response.success) {
        setProject((prev) => ({ ...prev, name: name.trim(), description: description.trim() }))
        toast.success("Project updated successfully", { id: toastId })
        setIsEditing(false)
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update project"
      toast.error(message, { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setName(project?.name || "")
    setDescription(project?.description || "")
    setIsEditing(false)
  }

  const handleToggleVisibility = async () => {
    const newVisibility = project?.isActive !== false
    const toastId = toast.loading("Updating visibility...")
    try {
      await apiService.updateProject(projectId, {
        name: project?.name || "",
        description: project?.description || "",
        isActive: newVisibility,
      })
      setProject((prev) => ({ ...prev, isActive: newVisibility }))
      toast.success(`Project is now ${newVisibility ? "private" : "public"}`, { id: toastId })
    } catch {
      toast.error("Failed to update visibility", { id: toastId })
    }
  }

  const handleArchive = async () => {
    const toastId = toast.loading("Archiving project...")
    try {
      await apiService.updateProject(projectId, {
        name: project?.name || "",
        description: project?.description || "",
        isActive: false,
      })
      setProject((prev) => ({ ...prev, isActive: false }))
      toast.success("Project archived successfully", { id: toastId })
      setShowArchiveConfirm(false)
    } catch {
      toast.error("Failed to archive project", { id: toastId })
    }
  }

  const handleDelete = async () => {
    if (deleteConfirmText !== project?.name) {
      toast.error("Project name does not match")
      return
    }
    const toastId = toast.loading("Deleting project...")
    try {
      const response = await apiService.customFetch(`/projects/delete/${projectId}`, {
        method: "POST",
      })
      if (response.success) {
        toast.success("Project deleted successfully", { id: toastId })
        window.location.href = "/overview"
      } else {
        toast.error(response.message || "Failed to delete project", { id: toastId })
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete project", { id: toastId })
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Project Details */}
      <div className="rounded-xl border border-light-border bg-light-bg-secondary shadow-sm dark:border-dark-border dark:bg-dark-bg-tertiary">
        <div className="flex items-center justify-between border-b border-light-border px-6 py-4 dark:border-dark-border">
          <div>
            <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
              Project Details
            </h3>
            <p className="mt-0.5 text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Basic information about your project
            </p>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="cursor-pointer rounded-lg border border-light-border px-3 py-1.5 text-xs font-medium text-light-text-secondary transition-all duration-200 hover:bg-light-bg-hover hover:text-light-text-primary dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg-hover dark:hover:text-dark-text-primary"
            >
              Edit
            </button>
          )}
        </div>
        <div className="space-y-5 p-6">
          <div>
            <label
              htmlFor="project-name"
              className="mb-1.5 block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary"
            >
              Project Name <span className="text-accent-danger">*</span>
            </label>
            {isEditing ? (
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="w-full rounded-lg border border-light-border bg-light-bg-primary px-4 py-2.5 text-sm text-light-text-primary placeholder:text-light-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 dark:border-dark-border dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:placeholder:text-dark-text-tertiary"
              />
            ) : (
              <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                {project?.name}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="project-desc"
              className="mb-1.5 block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary"
            >
              Description
            </label>
            {isEditing ? (
              <textarea
                id="project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this project is about..."
                rows={3}
                className="w-full resize-none rounded-lg border border-light-border bg-light-bg-primary px-4 py-2.5 text-sm text-light-text-primary placeholder:text-light-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 dark:border-dark-border dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:placeholder:text-dark-text-tertiary"
              />
            ) : (
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {project?.description || (
                  <span className="italic text-light-text-tertiary dark:text-dark-text-tertiary">
                    No description provided
                  </span>
                )}
              </p>
            )}
          </div>
          {isEditing && (
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-accent-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-2 rounded-lg border border-light-border px-4 py-2 text-sm font-medium text-light-text-secondary transition-all duration-200 hover:bg-light-bg-hover dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg-hover"
              >
                <XIcon className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visibility */}
      <div className="rounded-xl border border-light-border bg-light-bg-secondary shadow-sm dark:border-dark-border dark:bg-dark-bg-tertiary">
        <div className="border-b border-light-border px-6 py-4 dark:border-dark-border">
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            Visibility
          </h3>
          <p className="mt-0.5 text-xs text-light-text-secondary dark:text-dark-text-secondary">
            Control who can see this project
          </p>
        </div>
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                project?.isActive !== false
                  ? "bg-accent-success/10"
                  : "bg-light-text-tertiary/10 dark:bg-dark-text-tertiary/10"
              }`}
            >
              {project?.isActive !== false ? (
                <EyeIcon className="h-5 w-5 text-accent-success" />
              ) : (
                <EyeOffIcon className="h-5 w-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                {project?.isActive !== false ? "Public" : "Private"}
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {project?.isActive !== false
                  ? "Visible to all organization members"
                  : "Only visible to project members"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleVisibility}
            className="cursor-pointer rounded-lg border border-light-border px-4 py-2 text-xs font-medium text-light-text-secondary transition-all duration-200 hover:bg-light-bg-hover hover:text-light-text-primary dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg-hover dark:hover:text-dark-text-primary"
          >
            {project?.isActive !== false ? "Make Private" : "Make Public"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border-2 border-accent-danger/30 bg-accent-danger/5">
        <div className="border-b border-accent-danger/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <TriangleAlertIcon className="h-4 w-4 text-accent-danger" />
            <h3 className="text-sm font-semibold text-accent-danger">Danger Zone</h3>
          </div>
          <p className="mt-0.5 text-xs text-light-text-secondary dark:text-dark-text-secondary">
            Irreversible and destructive actions
          </p>
        </div>
        <div className="space-y-3 p-6">
          {/* Archive */}
          <div className="flex flex-col gap-4 rounded-lg border border-accent-danger/20 bg-light-bg-primary p-4 dark:border-accent-danger/30 dark:bg-dark-bg-tertiary sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                Archive Project
              </p>
              <p className="mt-0.5 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Hide this project from the main list. Can be restored later.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowArchiveConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent-warning px-4 py-2 text-xs font-medium text-accent-warning transition-all duration-200 hover:bg-accent-warning/10 sm:w-auto"
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </button>
          </div>

          {/* Delete */}
          <div className="flex flex-col gap-4 rounded-lg border border-accent-danger/20 bg-light-bg-primary p-4 dark:border-accent-danger/30 dark:bg-dark-bg-tertiary sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-accent-danger">Delete Project Permanently</p>
              <p className="mt-0.5 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                This cannot be undone. All data will be lost.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-danger px-4 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-accent-danger-dark sm:w-auto"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-light-border bg-light-bg-primary shadow-xl dark:border-dark-border dark:bg-dark-bg-primary">
            <div className="border-b border-light-border p-6 dark:border-dark-border">
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Archive Project
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Are you sure you want to archive{" "}
                <strong className="text-light-text-primary dark:text-dark-text-primary">
                  {project?.name}
                </strong>
                ? The project will be hidden from the main list but can be restored later.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowArchiveConfirm(false)}
                  className="rounded-lg border border-light-border px-4 py-2 text-sm font-medium text-light-text-secondary transition-colors hover:bg-light-bg-hover dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  className="rounded-lg bg-accent-warning px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-warning-dark"
                >
                  Archive Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-accent-danger/30 bg-light-bg-primary shadow-xl dark:bg-dark-bg-primary">
            <div className="border-b border-accent-danger/30 p-6">
              <h3 className="text-lg font-semibold text-accent-danger">
                Delete Project Permanently
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                This action <strong className="text-accent-danger">cannot be undone</strong>. This
                will permanently delete:
              </p>
              <ul className="list-inside list-disc space-y-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                <li>All tasks and subtasks</li>
                <li>All sprints and notes</li>
                <li>All member associations</li>
                <li>Project settings and configuration</li>
              </ul>
              <div>
                <label
                  htmlFor="delete-confirm"
                  className="mb-1.5 block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
                >
                  Type <strong className="text-accent-danger">{project?.name}</strong> to confirm
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full rounded-lg border border-accent-danger/30 bg-light-bg-secondary px-4 py-2.5 text-sm text-light-text-primary placeholder:text-light-text-tertiary focus:border-accent-danger focus:outline-none focus:ring-2 focus:ring-accent-danger/20 dark:border-accent-danger/30 dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText("")
                  }}
                  className="rounded-lg border border-light-border px-4 py-2 text-sm font-medium text-light-text-secondary transition-colors hover:bg-light-bg-hover dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== project?.name}
                  className="rounded-lg bg-accent-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-danger-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectAdminSettings
