import { useState } from "react"
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { FiX, FiCalendar } from "react-icons/fi"
import apiService from "../../../service/apiService"
import toast from "react-hot-toast"

const CreateSprintDialog = ({ isOpen, onClose, projectId, onSprintCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: ""
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await apiService.createSprint({
        ...formData,
        projectId
      })
      if (response.success) {
        toast.success("Sprint created successfully")
        onSprintCreated(response.data)
        onClose()
        setFormData({ name: "", goal: "", startDate: "", endDate: "" })
      }
    } catch (err) {
      toast.error(err.message || "Failed to create sprint")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-2xl bg-light-bg-primary dark:bg-dark-bg-secondary p-6 shadow-xl border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
              Create New Sprint
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Sprint Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Sprint 1"
                className="w-full px-4 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border focus:outline-none focus:border-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Sprint Goal
              </label>
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                placeholder="What do you want to achieve this sprint?"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border focus:outline-none focus:border-accent-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  Start Date *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full pl-10 px-4 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border focus:outline-none focus:border-accent-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                  End Date *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-tertiary" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full pl-10 px-4 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border focus:outline-none focus:border-accent-primary"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-light-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Sprint"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default CreateSprintDialog