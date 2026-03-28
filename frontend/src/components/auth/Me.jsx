import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import {
  FiAward,
  FiBell,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiEdit,
  FiFolder,
  FiGithub,
  FiGlobe,
  FiGrid,
  FiLinkedin,
  FiLock,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiMoon,
  FiPhone,
  FiTrash2,
  FiUser,
} from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import EditProfileModal from "./EditProfileModal.jsx"

const InfoItem = ({ icon: Icon, label, value, href }) => {
  if (!value) return null

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
      <Icon className="w-5 h-5 text-accent-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide">
          {label}
        </p>
        {href ? (
          <a
            href={href.startsWith("http") ? href : `https://${href}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent-primary hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  )
}

const Me = () => {
  const { user, logout, fetchUser } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksInProgress: 0,
    projectsCount: 0,
    sprintsCount: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      try {
        const tasksRes = await apiService.getAllTaskOfUser()
        if (tasksRes.success) {
          const tasks = tasksRes.data || []
          setStats({
            tasksCompleted: tasks.filter((t) => t.status === "completed").length,
            tasksInProgress: tasks.filter(
              (t) => t.status === "in-progress" || t.status === "under-review"
            ).length,
            tasksCount: tasks.length,
            projectsCount: 0,
            sprintsCount: 0,
          })
        }
      } catch (err) {
        console.error("Failed to fetch user stats:", err)
      }
    }
    fetchStats()
  }, [user])

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delayChildren: 0.2, staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const editProfileHandler = () => setIsEditModalOpen(true)

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append("avatars", file)
      const updateAvatar = await apiService.updateAvatar(formData)
      await fetchUser()
      toast.success("Avatar updated successfully!")
    }
  }

  const handleProfileUpdate = async () => {
    setIsEditModalOpen(false)
    await fetchUser()
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await apiService.deleteAccount()
      toast.success("Account deleted successfully")
      await logout()
    } catch (err) {
      toast.error("Failed to delete account")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full text-light-text-secondary">
        Loading...
      </div>
    )
  }

  const settingsMenu = [
    {
      icon: FiUser,
      title: "Personal Info",
      subtitle: "Name, phone, bio, location",
      color: "text-accent-primary",
      onClick: () => setIsEditModalOpen(true),
    },
    {
      icon: FiBell,
      title: "Notifications",
      subtitle: "Email & push notifications",
      color: "text-accent-warning",
      onClick: () => toast.success("Notification settings coming soon!"),
    },
    {
      icon: FiMoon,
      title: "Appearance",
      subtitle: "Theme & display",
      color: "text-accent-info",
      onClick: () => toast.success("Appearance settings coming soon!"),
    },
    {
      icon: FiLock,
      title: "Security",
      subtitle: "Password & authentication",
      color: "text-accent-danger",
      onClick: () => toast.success("Security settings coming soon!"),
    },
    {
      icon: FiLogOut,
      title: "Sign Out",
      subtitle: "Log out of your account",
      color: "text-light-text-tertiary",
      onClick: () => logout(),
    },
  ]

  return (
    <motion.div className="h-full flex flex-col" style={{ boxShadow: "0px 0px 1px 0.1px #000000" }}>
      <motion.div
        className="p-6 bg-light-bg-secondary dark:bg-dark-bg-tertiary shrink-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary">
            My Profile
          </h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={editProfileHandler}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors"
          >
            <FiEdit className="w-4 h-4" /> Edit Profile
          </motion.button>
        </motion.div>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-6 bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <motion.div
            variants={itemVariants}
            className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border p-6 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="relative w-28 h-28 flex-shrink-0">
              <label htmlFor="profile" className="block w-full h-full rounded-full cursor-pointer">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-primary to-accent-success flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                  {user?.avatar?.url ? (
                    <img
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      src={user.avatar.url}
                    />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute inset-0 w-full h-full bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full">
                  <span className="text-white text-sm">Change</span>
                </div>
              </label>
              <input
                type="file"
                name="profile"
                id="profile"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
              />
            </div>
            <div className="text-center md:text-left flex-grow">
              <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {displayName}
              </h2>
              <p className="text-light-text-secondary flex items-center justify-center md:justify-start gap-2 mt-1">
                <FiMail className="w-4 h-4" /> {displayEmail}
              </p>
              <p className="text-light-text-secondary flex items-center justify-center md:justify-start gap-2">
                <FiAward className="w-4 h-4" /> {displayRole}
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border p-4 text-center">
              <FiCheckCircle className="w-6 h-6 text-accent-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {stats.tasksCompleted}
              </p>
              <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                Completed
              </p>
            </div>
            <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border p-4 text-center">
              <FiClock className="w-6 h-6 text-accent-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {stats.tasksInProgress}
              </p>
              <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                In Progress
              </p>
            </div>
            <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border p-4 text-center">
              <FiFolder className="w-6 h-6 text-accent-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {stats.tasksCount}
              </p>
              <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                Total Tasks
              </p>
            </div>
            <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border p-4 text-center">
              <FiCalendar className="w-6 h-6 text-accent-info mx-auto mb-2" />
              <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                {joinDate}
              </p>
              <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                Joined
              </p>
            </div>
          </motion.div>

          {/* User Info Grid */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
              Profile Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoItem icon={FiPhone} label="Phone" value={user?.phone} />
              <InfoItem icon={FiBriefcase} label="Company" value={user?.company} />
              <InfoItem icon={FiBriefcase} label="Job Title" value={user?.jobTitle} />
              <InfoItem icon={FiMapPin} label="Location" value={user?.location} />
              <InfoItem icon={FiGlobe} label="Website" value={user?.website} href={user?.website} />
              <InfoItem
                icon={FiLinkedin}
                label="LinkedIn"
                value={user?.linkedin}
                href={user?.linkedin}
              />
              <InfoItem icon={FiGithub} label="GitHub" value={user?.github} href={user?.github} />
              {user?.bio && (
                <div className="md:col-span-2 p-3 rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
                  <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide mb-1">
                    Bio
                  </p>
                  <p className="text-sm text-light-text-primary dark:text-dark-text-primary">
                    {user.bio}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Settings Menu */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
              Account Settings
            </h3>
            <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
              {settingsMenu.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-4 p-4 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors border-b border-light-border dark:border-dark-border last:border-b-0"
                >
                  <div className="p-2 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      {item.title}
                    </p>
                    <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                      {item.subtitle}
                    </p>
                  </div>
                  <FiChevronRight className="w-5 h-5 text-light-text-tertiary" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-accent-danger mb-4">Danger Zone</h3>
            <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-accent-danger/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                    Delete Account
                  </p>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    Permanently delete your account
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-danger text-accent-danger hover:bg-accent-danger hover:text-white transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </motion.div>

          {/* App Info */}
          <motion.div variants={itemVariants} className="text-center py-6">
            <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
              TaskFlow v1.0.0
            </p>
          </motion.div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleProfileUpdate}
      />

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-accent-danger p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              Delete Account?
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-accent-danger text-white font-medium hover:bg-accent-danger/90 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Me
