import { motion } from "framer-motion"
import { useState } from "react"
import { FiAward, FiCalendar, FiChevronRight, FiEdit, FiLock, FiMail, FiUser } from "react-icons/fi"
import { useAuth } from "../context/customHook.js" // Adjust path as needed
import EditProfileModal from "./EditProfileModal.jsx"

const Me = () => {
  const { user } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Placeholder data if user is not fully loaded or for default display
  const displayName = user?.fullname || "User"
  const displayEmail = user?.email || "user@example.com"
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Member"
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"

  // Simple variant for framer-motion animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  }

  const editProfileHandler = () => {
    setIsEditModalOpen(true)
  }

  const handleProfileUpdate = (updatedData) => {
    // Here you would typically make an API call to update the user profile
    // For this example, we'll just log the updated data and close the modal
    console.log("Updated Profile Data:", updatedData)
    setIsEditModalOpen(false)
    // Optionally, you might want to refresh the user data from the server here
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (!user) {
    // You might want a skeleton loader or a redirect here if the user object is null
    // However, with ProtectedRoute, this state should ideally not be reached if properly logged in
    return (
      <div className="flex justify-center items-center h-full text-bento-text-secondary">
        Loading user profile...
      </div>
    )
  }

  return (
    <motion.div
      className="p-6 space-y-8 max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between pb-4 border-b border-borders-dividers"
      >
        <h1 className="text-3xl font-bold text-highlight-text">My Profile</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={editProfileHandler}
          className="btn-primary flex items-center px-4 py-2 rounded-md shadow-lg"
        >
          <FiEdit className="mr-2" /> Edit Profile
        </motion.button>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        variants={itemVariants}
        className="card p-8 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8"
      >
        <div className="flex-shrink-0">
          {/* Placeholder for Avatar - you can replace this with an actual image */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent-blue to-accent-green flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="text-center md:text-left flex-grow">
          <h2 className="text-highlight-text text-4xl font-extrabold mb-2">{displayName}</h2>
          <p className="text-secondary-text text-lg flex items-center justify-center md:justify-start">
            <FiMail className="mr-2 text-accent-blue" /> {displayEmail}
          </p>
          <p className="text-secondary-text text-lg mt-1 flex items-center justify-center md:justify-start">
            <FiAward className="mr-2 text-accent-green" /> {displayRole}
          </p>
        </div>
      </motion.div>

      {/* Additional Details Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Joined Date Card */}
        <motion.div
          variants={itemVariants}
          className="card group p-6 flex items-center space-x-4"
        >
          <FiCalendar className="w-8 h-8 text-accent-blue group-hover:text-accent-blue transition-colors" />
          <div>
            <p className="text-secondary-text text-sm">Joined On</p>
            <p className="text-highlight-text text-xl font-semibold">{joinDate}</p>
          </div>
          <FiChevronRight className="ml-auto w-6 h-6 text-subtle-text opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </motion.div>

        {/* Other Settings/Info Card (Example) */}
        <motion.div
          variants={itemVariants}
          className="card group p-6 flex items-center space-x-4"
        >
          <FiUser className="w-8 h-8 text-accent-green group-hover:text-accent-green transition-colors" />
          <div>
            <p className="text-secondary-text text-sm">Account Settings</p>
            <p className="text-highlight-text text-xl font-semibold">Manage your preferences</p>
          </div>
          <FiChevronRight className="ml-auto w-6 h-6 text-subtle-text opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </motion.div>

        {/* You can add more cards here for other user details or actions */}
        {/* For instance: Security Settings Card */}
        <motion.div
          variants={itemVariants}
          className="card group p-6 flex items-center space-x-4"
        >
          <FiLock className="w-8 h-8  text-accent-amber group-hover:text-accent-amber transition-colors" />
          <div>
            <p className="text-secondary-text text-sm">Security</p>
            <p className="text-highlight-text text-xl font-semibold">Change password & MFA</p>
          </div>
          <FiChevronRight className="ml-auto w-6 h-6 text-subtle-text opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </motion.div>
      </motion.div>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleProfileUpdate}
      />
    </motion.div>
  )
}

export default Me
