import { useState } from "react"
import toast from "react-hot-toast"
import { FiArchive, FiEye, FiEyeOff, FiSave, FiTrash2 } from "react-icons/fi"
import apiService from "../../../../service/apiService.js"

const ProjectAdminSettings = ({ project, setProject, projectId }) => {
  const [name, setName] = useState(project?.name || "")
  const [description, setDescription] = useState(project?.description || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
        toast.success("Project updated!", { id: toastId })
        setIsEditing(false)
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update project"
      toast.error(message, { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleVisibility = async () => {
    const newVisibility = project?.isActive === false
    const toastId = toast.loading("Updating visibility...")
    try {
      await apiService.updateProject(projectId, {
        name: project.name,
        description: project.description,
        isActive: newVisibility,
      })
      setProject((prev) => ({ ...prev, isActive: newVisibility }))
      toast.success(`Project is now ${newVisibility ? "public" : "private"}`, { id: toastId })
    } catch {
      toast.error("Failed to update visibility", { id: toastId })
    }
  }

  const handleArchive = async () => {
    if (!confirm("Archive this project? It will be hidden from the main list.")) return
    const toastId = toast.loading("Archiving project...")
    try {
      await apiService.updateProject(projectId, {
        name: project.name,
        description: project.description,
        isActive: false,
      })
      setProject((prev) => ({ ...prev, isActive: false }))
      toast.success("Project archived", { id: toastId })
    } catch {
      toast.error("Failed to archive project", { id: toastId })
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        "⚠️ This will permanently delete this project and all its data. This cannot be undone. Are you sure?"
      )
    )
      return
    const toastId = toast.loading("Deleting project...")
    try {
      await apiService.customFetch(`/projects/delete/${projectId}`, { method: "POST" })
      toast.success("Project deleted", { id: toastId })
      window.location.href = "/overview"
    } catch {
      toast.error("Failed to delete project", { id: toastId })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Project Info */}
      <div className="rounded-xl border border-light-border bg-light-bg-secondary dark:border-dark-border dark:bg-dark-bg-tertiary">
        <div className="flex items-center justify-between border-b border-light-border px-5 py-4 dark:border-dark-border">
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            Project Details
          </h3>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm font-medium text-accent-primary hover:text-accent-primary-dark"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label
              htmlFor="project-name"
              className="mb-1 block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary"
            >
              Project Name
            </label>
            {isEditing ? (
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-light-border bg-light-bg-primary px-4 py-2.5 text-sm text-light-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 dark:border-dark-border dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
              />
            ) : (
              <p className="text-sm text-light-text-primary dark:text-dark-text-primary">
                {project?.name}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="project-desc"
              className="mb-1 block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary"
            >
              Description
            </label>
            {isEditing ? (
              <textarea
                id="project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-light-border bg-light-bg-primary px-4 py-2.5 text-sm text-light-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 dark:border-dark-border dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
              />
            ) : (
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {project?.description || "No description"}
              </p>
            )}
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-primary-dark disabled:opacity-50"
            >
              <FiSave className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      {/* Visibility */}
      <div className="rounded-xl border border-light-border bg-light-bg-secondary dark:border-dark-border dark:bg-dark-bg-tertiary">
        <div className="border-b border-light-border px-5 py-4 dark:border-dark-border">
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            Visibility
          </h3>
        </div>
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            {project?.isActive !== false ? (
              <FiEye className="h-5 w-5 text-accent-success" />
            ) : (
              <FiEyeOff className="h-5 w-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
            )}
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
            className="rounded-lg border border-light-border px-3 py-1.5 text-xs font-medium text-light-text-secondary transition-colors hover:bg-light-bg-hover dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg-hover"
          >
            Toggle
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-accent-danger/20 bg-accent-danger/5">
        <div className="border-b border-accent-danger/20 px-5 py-4">
          <h3 className="text-sm font-semibold text-accent-danger">Danger Zone</h3>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between rounded-lg border border-accent-danger/20 bg-light-bg-primary p-4 dark:border-accent-danger/30 dark:bg-dark-bg-tertiary">
            <div>
              <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                Archive Project
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Hide this project from the main list. Can be restored later.
              </p>
            </div>
            <button
              type="button"
              onClick={handleArchive}
              className="flex items-center gap-2 rounded-lg border border-accent-warning px-3 py-2 text-xs font-medium text-accent-warning transition-colors hover:bg-accent-warning/10"
            >
              <FiArchive className="h-3.5 w-3.5" />
              Archive
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-accent-danger/20 bg-light-bg-primary p-4 dark:border-accent-danger/30 dark:bg-dark-bg-tertiary">
            <div>
              <p className="text-sm font-medium text-accent-danger">Delete Project</p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Permanently delete this project and all its data. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg bg-accent-danger px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-danger-dark"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectAdminSettings
