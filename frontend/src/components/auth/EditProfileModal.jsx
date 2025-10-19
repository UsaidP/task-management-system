import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { FiUser, FiX } from "react-icons/fi"

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  // State to manage the form data, initialized with the current user's info.
  const [formData, setFormData] = useState({
    fullname: "",
  })

  // When the user prop changes (e.g., on modal open), update the form data.
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
      })
    }
  }, [user])

  // Handles changes to the input field.
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handles the form submission.
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData) // Pass the updated data back to the parent component.
  }

  // Animation variants for the modal backdrop and card.
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 50, scale: 0.9 },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose} // Close modal on backdrop click
        >
          <motion.div
            className="bento-card w-full max-w-lg p-8 rounded-lg shadow-xl"
            variants={modalVariants}
            exit="exit"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-bento-text-primary">Edit Your Profile</h2>
              <button onClick={onClose} className="text-text-muted hover:text-bento-text-primary">
                <FiX size={24} />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullname"
                    className="block text-sm font-medium text-bento-text-primary mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                    <input
                      type="text"
                      name="fullname"
                      id="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      className="input-field pl-12"
                      required
                    />
                  </div>
                </div>
                {/* You can add more fields here (e.g., username, bio) */}
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex justify-end space-x-4">
                <button type="button" onClick={onClose} className="btn-secondary px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="btn-new-primary px-4 py-2">
                  Save Changes
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
