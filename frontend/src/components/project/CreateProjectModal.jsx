import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useId, useState } from "react"
import toast from "react-hot-toast"
import apiService from "../../../service/apiService.js"

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [_showError, _setShowError] = useState(false)
  const _id = useId()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const toastId = toast.loading("Creating project...")

    try {
      const response = await apiService.createProject(name, description)
      if (response.success) {
        toast.success("Project created successfully!", { id: toastId })
        onProjectCreated(response.data.project)
        setName("")
        setDescription("")
        onClose()
        // Notify other components (e.g. Sidebar) to refetch projects
        window.dispatchEvent(new CustomEvent("project:created", { detail: response.data.project }))
      }
    } catch (err) {
      const errorMessage = err.data?.message || "Failed to create project"
      toast.error(errorMessage, { id: toastId })
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-utility-overlay dark:bg-utility-overlay-dark backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg p-8 bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border dark:border-dark-border rounded-2xl shadow-xl dark:shadow-dark-lg"
          >
            <h2 className="mb-6 text-2xl font-bold text-center text-light-text-primary dark:text-dark-text-primary">
              Create New Project
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  required
                  className="input-field"
                />
              </div>
              {error && <p className="text-sm text-accent-danger">{error}</p>}
              <div className="flex items-center justify-end space-x-4">
                <button type="button" onClick={onClose} className="btn-secondary text-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CreateProjectModal
