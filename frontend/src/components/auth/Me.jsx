import { motion } from "framer-motion";
import { useState } from "react";
import { FiAward, FiCalendar, FiChevronRight, FiEdit, FiLock, FiMail, FiUser } from "react-icons/fi";
import { useAuth } from "../context/customHook.js";
import EditProfileModal from "./EditProfileModal.jsx";
import apiService from "../../../service/apiService.js";
import toast from "react-hot-toast";

const Me = () => {
  const { user, updateUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const displayName = user?.fullname || "User";
  const displayEmail = user?.email || "user@example.com";
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Member";
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "N/A";

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
  };

  const editProfileHandler = () => {
    setIsEditModalOpen(true);
  };
  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append('avatars', file);

      const updateAvatar = await apiService.updateAvatar(formData);
      console.log(`updatedUser: ${JSON.stringify(updateAvatar)}`);
      updateUser({ avatar: updateAvatar.data.avatar });
      toast.success("Avatar updated successfully!");
    } else {
      toast.error("No file selected!");

    }
  };


  const handleProfileUpdate = () => {

    setIsEditModalOpen(false);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full text-light-text-secondary dark:text-dark-text-secondary">
        Loading user profile...
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 space-y-8 max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border"
      >
        <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">My Profile</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={editProfileHandler}
          className="btn-primary flex items-center px-4 py-2 rounded-md shadow-lg"
        >
          <FiEdit className="mr-2" /> Edit Profile
        </motion.button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="card p-8 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8"
      >
        <div className="flex-shrink-0">
          <div className="relative w-28 h-28 rounded-full shadow-lg">

            {/* 1. The <label> is the clickable element.
          - It's styled to be the full circle.
          - 'htmlFor="profile"' links it to the input.
      */}
            <label
              htmlFor="profile"
              className="block w-full h-full rounded-full cursor-pointer"
            >
              {/* --- This is the visual part --- */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-primary to-accent-success flex items-center justify-center text-4xl font-bold text-white overflow-hidden">

                {user?.avatar?.url ? (
                  <img
                    alt="Profile Avatar"
                    className="w-full h-full object-cover " // Fills the circle
                    src={user.avatar.url}
                  />
                ) : (
                  // Fallback to initials
                  <span className="select-none">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* --- Optional: "Edit" overlay on hover --- */}
              <div className="absolute inset-0 w-full h-full bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full">
                <span className="text-white text-sm">Change</span>
              </div>
            </label>

            {/* 2. The actual file input
          - It's 'hidden' so it doesn't appear.
          - 'id="profile"' is what the label links to.
          - 'onChange' is the most important part!
      */}
            <input
              type="file"
              name="profile"
              id="profile"
              className="hidden"
              accept="image/png, image/jpeg" // Restrict to image files
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div className="text-center md:text-left flex-grow">
          <h2 className="text-light-text-primary dark:text-dark-text-primary text-4xl font-extrabold mb-2">{displayName}</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg flex items-center justify-center md:justify-start">
            <FiMail className="mr-2 text-accent-primary" /> {displayEmail}
          </p>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg mt-1 flex items-center justify-center md:justify-start">
            <FiAward className="mr-2 text-accent-success" /> {displayRole}
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="card group p-6 flex items-center space-x-4"
        >
          <FiCalendar className="w-8 h-8 text-accent-primary group-hover:text-accent-primary transition-colors" />
          <div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">Joined On</p>
            <p className="text-light-text-primary dark:text-dark-text-primary text-xl font-semibold">{joinDate}</p>
          </div>
          <FiChevronRight className="ml-auto w-6 h-6 text-light-text-tertiary dark:text-dark-text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="card group p-6 flex items-center space-x-4"
        >
          <FiUser className="w-8 h-8 text-accent-success group-hover:text-accent-success transition-colors" />
          <div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">Account Settings</p>
            <p className="text-light-text-primary dark:text-dark-text-primary text-xl font-semibold">Manage your preferences</p>
          </div>
          <FiChevronRight className="ml-auto w-6 h-6 text-light-text-tertiary dark:text-dark-text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="card group p-6 flex items-center space-x-4"
        >
          <FiLock className="w-8 h-8 text-accent-warning group-hover:text-accent-warning transition-colors" />
          <div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">Security</p>
            <p className="text-light-text-primary dark:text-dark-text-primary text-xl font-semibold">Change password & MFA</p>
          </div>
          <FiChevronRight className="ml-auto w-6 h-6 text-light-text-tertiary dark:text-dark-text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </motion.div>
      </motion.div>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleProfileUpdate}
      />
    </motion.div>
  );
};

export default Me;
