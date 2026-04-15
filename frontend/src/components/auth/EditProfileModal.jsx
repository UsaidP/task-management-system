import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useId, useState } from "react"
import toast from "react-hot-toast"
import {
  FiBriefcase,
  FiGithub,
  FiGlobe,
  FiLinkedin,
  FiMapPin,
  FiPhone,
  FiUser,
  FiX,
} from "react-icons/fi"
import apiService from "../../../service/apiService.js"

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  const formId = useId()
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    bio: "",
    location: "",
    company: "",
    jobTitle: "",
    website: "",
    linkedin: "",
    github: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || "",
        company: user.company || "",
        jobTitle: user.jobTitle || "",
        website: user.website || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading("Updating profile...")
    try {
      const response = await apiService.updateProfile(formData)
      if (response.success) {
        toast.success("Profile updated successfully!", { id: toastId })
        onSave(response.data)
        onClose()
      } else {
        toast.error(response.message || "Failed to update profile", { id: toastId })
      }
    } catch (_error) {
      toast.error("Failed to update profile", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 50, scale: 0.9 },
  }

  const inputFields = [
    { name: "fullname", label: "Full Name", icon: FiUser, type: "text", placeholder: "John Doe" },
    {
      name: "phone",
      label: "Phone Number",
      icon: FiPhone,
      type: "tel",
      placeholder: "+1 234 567 8900",
    },
    {
      name: "company",
      label: "Company",
      icon: FiBriefcase,
      type: "text",
      placeholder: "Acme Inc.",
    },
    {
      name: "jobTitle",
      label: "Job Title",
      icon: FiBriefcase,
      type: "text",
      placeholder: "Software Engineer",
    },
    {
      name: "location",
      label: "Location",
      icon: FiMapPin,
      type: "text",
      placeholder: "San Francisco, CA",
    },
    {
      name: "website",
      label: "Website",
      icon: FiGlobe,
      type: "url",
      placeholder: "https://example.com",
    },
    {
      name: "linkedin",
      label: "LinkedIn",
      icon: FiLinkedin,
      type: "text",
      placeholder: "linkedin.com/in/username",
    },
    {
      name: "github",
      label: "GitHub",
      icon: FiGithub,
      type: "text",
      placeholder: "github.com/username",
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-utility-overlay dark:bg-utility-overlay-dark backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-light-bg-secondary dark:bg-dark-bg-tertiary w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-xl border border-light-border dark:border-dark-border"
            variants={modalVariants}
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border sticky top-0 bg-light-bg-secondary dark:bg-dark-bg-tertiary z-10">
              <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                Edit Your Profile
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              >
                <FiX size={24} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor={`${formId}-fullname`}
                  className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
                  <input
                    type="text"
                    name="fullname"
                    id={`${formId}-fullname`}
                    value={formData.fullname}
                    onChange={handleChange}
                    className="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-4 py-2 pl-12 text-sm focus:outline-none focus:border-accent-primary text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`${formId}-bio`}
                  className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1"
                >
                  Bio
                </label>
                <textarea
                  name="bio"
                  id={`${formId}-bio`}
                  aria-label="Bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent-primary text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputFields.slice(1).map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={`${formId}-${field.name}`}
                      className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-1"
                    >
                      {field.label}
                    </label>
                    <div className="relative">
                      <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-5 h-5" />
                      <input
                        type={field.type}
                        name={field.name}
                        id={`${formId}-${field.name}`}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-lg px-4 py-2 pl-12 text-sm focus:outline-none focus:border-accent-primary text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary"
                        placeholder={field.placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="px-4 py-2 rounded-lg bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EditProfileModal
