import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import {
  FiActivity,
  FiAlertTriangle,
  FiAward,
  FiBell,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiCircle,
  FiClock,
  FiEdit,
  FiEye,
  FiFolder,
  FiGithub,
  FiGlobe,
  FiLinkedin,
  FiLock,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiMoon,
  FiPhone,
  FiSettings,
  FiShare,
  FiStar,
  FiTrash2,
  FiTrendingUp,
  FiUser,
  FiX,
} from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../../contexts/customHook.js"
import EditProfileModal from "./EditProfileModal.jsx"

const InfoItem = ({ icon: Icon, label, value, href }) => {
  if (!value) return null

  return (
    <div className="group flex items-center gap-3 p-3 rounded-lg bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors duration-200">
      <div className="p-2 rounded-lg bg-accent-primary/10 group-hover:bg-accent-primary/20 transition-colors duration-200">
        <Icon className="w-4 h-4 text-accent-primary flex-shrink-0" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide font-medium">
          {label}
        </p>
        {href ? (
          <a
            href={href.startsWith("http") ? href : `https://${href}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent-primary hover:text-accent-primary-dark dark:hover:text-accent-primary-light transition-colors truncate block"
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

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.02 }}
    className="group relative overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border border-light-border dark:border-dark-border p-5 transition-all duration-200 hover:shadow-md dark:hover:shadow-dark-md"
  >
    <div
      className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-10 rounded-bl-full transition-opacity group-hover:opacity-20`}
    />
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${color} bg-opacity-10`}>
          <Icon
            className={`w-5 h-5 ${color.replace("bg-", "text-").replace("from-", "").replace("to-", "")}`}
          />
        </div>
        {subtext && (
          <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary px-2 py-1 rounded-full bg-light-bg-hover dark:bg-dark-bg-hover">
            {subtext}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
        {value}
      </p>
      <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary font-medium uppercase tracking-wide">
        {label}
      </p>
    </div>
  </motion.div>
)

const SettingsItem = ({ icon: Icon, title, subtitle, color, onClick, danger }) => (
  <motion.button
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all duration-200 border-b border-light-border dark:border-dark-border last:border-b-0 group ${danger ? "hover:bg-accent-danger/5 dark:hover:bg-accent-danger/10" : ""}`}
  >
    <div
      className={`p-2.5 rounded-xl ${danger ? "bg-accent-danger/10 group-hover:bg-accent-danger/20" : "bg-light-bg-hover dark:bg-dark-bg-hover group-hover:scale-110"} transition-all duration-200`}
    >
      <Icon className={`w-5 h-5 ${danger ? "text-accent-danger" : color}`} />
    </div>
    <div className="flex-1 text-left">
      <p
        className={`font-semibold ${danger ? "text-accent-danger" : "text-light-text-primary dark:text-dark-text-primary"}`}
      >
        {title}
      </p>
      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">{subtitle}</p>
    </div>
    <FiChevronRight className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary group-hover:text-accent-primary transition-colors" />
  </motion.button>
)

const Me = () => {
  const { user, logout, updateUser } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeSetting, setActiveSetting] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [showPersonalInfo, setShowPersonalInfo] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "system"
    }
    return "system"
  })
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksInProgress: 0,
    tasksCount: 0,
    projectsCount: 0,
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
          })
          // Generate recent activity from tasks
          const activity = tasks
            .filter((t) => t.updatedAt)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5)
            .map((task) => ({
              id: task._id,
              type: task.status === "completed" ? "completed" : "updated",
              title: task.title,
              status: task.status,
              date: task.updatedAt,
            }))
          setRecentActivity(activity)
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
      })
    : "N/A"

  // Capitalize first letter of display name for avatar fallback
  const avatarInitial = displayName.trim().charAt(0).toUpperCase()

  // Cache-busting for avatar image to prevent stale browser cache
  const avatarSrc = user?.avatar?.url
    ? `${user.avatar.url}?t=${Date.now()}`
    : null

  const editProfileHandler = () => setIsEditModalOpen(true)

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file")
        return
      }

      const formData = new FormData()
      formData.append("avatars", file)

      const toastId = toast.loading("Uploading avatar...")
      try {
        const updateAvatar = await apiService.updateAvatar(formData)
        if (updateAvatar.success && updateAvatar.data) {
          // Update user context with new avatar data
          const updatedUser = updateAvatar.data
          updateUser(updatedUser)
          toast.success("Avatar updated successfully!", { id: toastId })
        } else {
          toast.error(updateAvatar.message || "Failed to upload avatar", { id: toastId })
        }
      } catch (err) {
        toast.error("Failed to upload avatar. Please try again.", { id: toastId })
        console.error("Avatar upload error:", err)
      } finally {
        // Reset file input so same file can be re-selected
        event.target.value = ""
      }
    }
  }

  const handleProfileUpdate = async (updatedUser) => {
    setIsEditModalOpen(false)
    if (updatedUser) {
      updateUser(updatedUser)
    }
  }

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme)
    localStorage.setItem("theme", theme)

    if (theme === "light") {
      document.documentElement.classList.remove("dark")
    } else if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      // System preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", prefersDark)
    }
    toast.success(`Theme changed to ${theme === "system" ? "System" : theme} mode`)
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

  const handleSettingClick = (setting) => {
    if (setting.title === "Personal Info") {
      setShowPersonalInfo(true)
    } else {
      setActiveSetting(setting)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="w-4 h-4 text-accent-success" />
      case "in-progress":
        return <FiClock className="w-4 h-4 text-accent-primary" />
      case "under-review":
        return <FiEye className="w-4 h-4 text-accent-warning" />
      default:
        return <FiCircle className="w-4 h-4 text-light-text-tertiary" />
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  const settingsMenu = [
    {
      icon: FiUser,
      title: "Personal Info",
      subtitle: "Name, phone, bio, location",
      color: "text-accent-primary",
      onClick: () => setShowPersonalInfo(true),
    },
    {
      icon: FiBell,
      title: "Notifications",
      subtitle: "Email & push notifications",
      color: "text-accent-warning",
      onClick: () =>
        handleSettingClick({
          icon: FiBell,
          title: "Notifications",
          subtitle: "Email & push notifications",
        }),
    },
    {
      icon: FiMoon,
      title: "Appearance",
      subtitle: "Theme & display settings",
      color: "text-accent-info",
      onClick: () =>
        handleSettingClick({
          icon: FiMoon,
          title: "Appearance",
          subtitle: "Theme & display settings",
        }),
    },
    {
      icon: FiLock,
      title: "Security",
      subtitle: "Password & authentication",
      color: "text-accent-danger",
      onClick: () =>
        handleSettingClick({
          icon: FiLock,
          title: "Security",
          subtitle: "Password & authentication",
        }),
    },
    {
      icon: FiSettings,
      title: "Preferences",
      subtitle: "Language, timezone, defaults",
      color: "text-accent-purple",
      onClick: () =>
        handleSettingClick({
          icon: FiSettings,
          title: "Preferences",
          subtitle: "Language, timezone, defaults",
        }),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
          {/* Profile Header Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border border-light-border dark:border-dark-border p-6 md:p-8"
          >
            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent-primary/5 to-accent-success/5 rounded-bl-full" />

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                <label
                  htmlFor="profile"
                  className="block w-32 h-32 rounded-2xl cursor-pointer overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow"
                >
                  <div className="w-full h-full bg-gradient-to-br from-accent-primary via-accent-success to-accent-warning flex items-center justify-center text-5xl font-bold text-white relative overflow-hidden">
                    {user?.avatar?.url && user.avatar.url !== "https://placehold.co/400" ? (
                      <img
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        src={avatarSrc}
                        key={avatarSrc}
                      />
                    ) : (
                      <span>{avatarInitial}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Change</span>
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
                {/* Online Status */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-success rounded-full border-4 border-light-bg-secondary dark:border-dark-bg-tertiary" />
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    {displayName}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-semibold uppercase tracking-wide w-fit mx-auto md:mx-0">
                    <FiAward className="w-3.5 h-3.5" />
                    {displayRole}
                  </span>
                </div>
                <p className="text-light-text-secondary flex items-center justify-center md:justify-start gap-2 mt-2">
                  <FiMail className="w-4 h-4 text-accent-primary" />
                  <span className="font-medium">{displayEmail}</span>
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    <FiCalendar className="w-4 h-4" />
                    Joined {joinDate}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    <FiStar className="w-4 h-4 text-accent-warning" />
                    Member since {new Date(user.createdAt).getFullYear()}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toast.success("Share profile coming soon!")}
                  className="p-3 rounded-xl border border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
                >
                  <FiShare className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={editProfileHandler}
                  className="p-3 rounded-xl bg-accent-primary text-white hover:bg-accent-primary-dark transition-colors shadow-md"
                >
                  <FiEdit className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              icon={FiCheckCircle}
              label="Completed"
              value={stats.tasksCompleted}
              color="bg-accent-success"
              subtext={`${stats.tasksCount > 0 ? Math.round((stats.tasksCompleted / stats.tasksCount) * 100) : 0}%`}
            />
            <StatCard
              icon={FiClock}
              label="In Progress"
              value={stats.tasksInProgress}
              color="bg-accent-primary"
            />
            <StatCard
              icon={FiFolder}
              label="Total Tasks"
              value={stats.tasksCount}
              color="bg-accent-warning"
            />
            <StatCard
              icon={FiTrendingUp}
              label="Productivity"
              value={
                stats.tasksCompleted > 0
                  ? `${Math.round((stats.tasksCompleted / Math.max(stats.tasksCount, 1)) * 100)}%`
                  : "0%"
              }
              color="bg-accent-info"
            />
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Profile Information */}
              <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border border-light-border dark:border-dark-border overflow-hidden">
                <div className="p-5 border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-primary/10">
                      <FiUser className="w-5 h-5 text-accent-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                      Profile Information
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <InfoItem icon={FiPhone} label="Phone" value={user?.phone} />
                    <InfoItem icon={FiBriefcase} label="Company" value={user?.company} />
                    <InfoItem icon={FiBriefcase} label="Job Title" value={user?.jobTitle} />
                    <InfoItem icon={FiMapPin} label="Location" value={user?.location} />
                    <InfoItem
                      icon={FiGlobe}
                      label="Website"
                      value={user?.website}
                      href={user?.website}
                    />
                    <InfoItem
                      icon={FiLinkedin}
                      label="LinkedIn"
                      value={user?.linkedin}
                      href={user?.linkedin}
                    />
                    <InfoItem
                      icon={FiGithub}
                      label="GitHub"
                      value={user?.github}
                      href={user?.github}
                    />
                  </div>
                  {user?.bio && (
                    <div className="mt-4 p-4 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 border border-light-border dark:border-dark-border">
                      <div className="flex items-center gap-2 mb-2">
                        <FiAward className="w-4 h-4 text-accent-primary" />
                        <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide font-semibold">
                          Bio
                        </p>
                      </div>
                      <p className="text-sm text-light-text-primary dark:text-dark-text-primary leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Overview */}
              <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border border-light-border dark:border-dark-border overflow-hidden">
                <div className="p-5 border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-success/10">
                      <FiActivity className="w-5 h-5 text-accent-success" />
                    </div>
                    <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                      Recent Activity
                    </h3>
                  </div>
                </div>
                <div className="divide-y divide-light-border dark:divide-dark-border">
                  {recentActivity.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <FiActivity className="w-12 h-12 text-light-text-tertiary dark:text-dark-text-tertiary mx-auto mb-3 opacity-40" />
                        <p className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
                          No recent activity
                        </p>
                        <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                          Your task updates will appear here
                        </p>
                      </div>
                    </div>
                  ) : (
                    recentActivity.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 p-4 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-secondary flex-shrink-0">
                          {getStatusIcon(activity.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                            {activity.type === "completed" ? "Completed" : "Updated"} task:{" "}
                            <span className="text-accent-primary">{activity.title}</span>
                          </p>
                          <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                            {new Date(activity.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Settings */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Account Settings */}
              <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border border-light-border dark:border-dark-border overflow-hidden">
                <div className="p-5 border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-warning/10">
                      <FiSettings className="w-5 h-5 text-accent-warning" />
                    </div>
                    <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                      Account Settings
                    </h3>
                  </div>
                </div>
                <div className="divide-y divide-light-border dark:divide-dark-border">
                  {settingsMenu.map((item, index) => (
                    <SettingsItem
                      key={index}
                      icon={item.icon}
                      title={item.title}
                      subtitle={item.subtitle}
                      color={item.color}
                      onClick={item.onClick}
                    />
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border border-accent-danger/30 overflow-hidden">
                <div className="p-5 border-b border-accent-danger/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-danger/10">
                      <FiTrash2 className="w-5 h-5 text-accent-danger" />
                    </div>
                    <h3 className="text-lg font-bold text-accent-danger">Danger Zone</h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                        Delete Account
                      </p>
                      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                        Permanently delete your account
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-accent-danger text-accent-danger font-semibold hover:bg-accent-danger hover:text-white transition-all duration-200"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-6 border-t border-light-border dark:border-dark-border"
          >
            <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm font-medium">
              TaskFlow v1.0.0
            </p>
            <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs mt-1">
              Work that feels human
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

      {/* Personal Info Modal */}
      {showPersonalInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPersonalInfo(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border border-light-border dark:border-dark-border p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-accent-primary/10">
                  <FiUser className="w-6 h-6 text-accent-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                    Personal Information
                  </h3>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    Your profile details
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
                  title="Edit Profile"
                >
                  <FiEdit className="w-5 h-5 text-accent-primary" />
                </button>
                <button
                  onClick={() => setShowPersonalInfo(false)}
                  className="p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
                >
                  <FiX className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-primary via-accent-success to-accent-warning flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    user?.fullname?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div>
                  <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {user?.fullname}
                  </p>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    {user?.email}
                  </p>
                  <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoItem icon={FiPhone} label="Phone" value={user?.phone || "Not set"} />
                <InfoItem icon={FiBriefcase} label="Company" value={user?.company || "Not set"} />
                <InfoItem
                  icon={FiBriefcase}
                  label="Job Title"
                  value={user?.jobTitle || "Not set"}
                />
                <InfoItem icon={FiMapPin} label="Location" value={user?.location || "Not set"} />
              </div>

              {user?.bio && (
                <div className="p-4 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FiAward className="w-4 h-4 text-accent-primary" />
                    <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wide font-semibold">
                      Bio
                    </p>
                  </div>
                  <p className="text-sm text-light-text-primary dark:text-dark-text-primary leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {user?.website && (
                  <a
                    href={
                      user.website.startsWith("http") ? user.website : `https://${user.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
                  >
                    <FiGlobe className="w-5 h-5 text-accent-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                      {user.website}
                    </span>
                  </a>
                )}
                {user?.linkedin && (
                  <a
                    href={
                      user.linkedin.startsWith("http") ? user.linkedin : `https://${user.linkedin}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
                  >
                    <FiLinkedin className="w-5 h-5 text-accent-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                      LinkedIn
                    </span>
                  </a>
                )}
                {user?.github && (
                  <a
                    href={user.github.startsWith("http") ? user.github : `https://${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
                  >
                    <FiGithub className="w-5 h-5 text-accent-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                      GitHub
                    </span>
                  </a>
                )}
              </div>

              <div className="pt-4 border-t border-light-border dark:border-dark-border">
                <div className="flex items-center gap-2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                  <FiCalendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Settings Modal */}
      {activeSetting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setActiveSetting(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border border-light-border dark:border-dark-border p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={"p-3 rounded-xl bg-light-bg-hover dark:bg-dark-bg-hover"}>
                  <activeSetting.icon className={`w-6 h-6 ${activeSetting.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                    {activeSetting.title}
                  </h3>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                    {activeSetting.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSetting(null)}
                className="p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
              >
                <FiX className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
              </button>
            </div>

            <div className="space-y-4">
              {activeSetting.title === "Notifications" && (
                <>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
                    <div>
                      <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                        Email Notifications
                      </p>
                      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                        Receive task updates via email
                      </p>
                    </div>
                    <div className="w-12 h-6 bg-accent-primary rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
                    <div>
                      <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                        Push Notifications
                      </p>
                      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                        Get instant alerts
                      </p>
                    </div>
                    <div className="w-12 h-6 bg-light-border dark:bg-dark-border rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                    </div>
                  </div>
                </>
              )}

              {activeSetting.title === "Appearance" && (
                <>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
                    Choose your preferred theme
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-4 rounded-xl border-2 border-accent-primary bg-light-bg-primary dark:bg-dark-bg-primary">
                      <div className="w-full h-12 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary mb-2" />
                      <p className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary text-center">
                        Light
                      </p>
                    </button>
                    <button className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-dark-bg-primary">
                      <div className="w-full h-12 rounded-lg bg-dark-bg-tertiary mb-2" />
                      <p className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary text-center">
                        Dark
                      </p>
                    </button>
                    <button className="p-4 rounded-xl border border-light-border dark:border-dark-border">
                      <div className="w-full h-12 rounded-lg bg-gradient-to-r from-light-bg-secondary to-dark-bg-tertiary mb-2" />
                      <p className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary text-center">
                        System
                      </p>
                    </button>
                  </div>
                </>
              )}

              {activeSetting.title === "Security" && (
                <>
                  <div className="p-4 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary mb-1">
                      Password
                    </p>
                    <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                      Last changed 30 days ago
                    </p>
                  </div>
                  <button className="w-full p-4 rounded-xl border border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors text-left">
                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      Change Password
                    </p>
                    <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                      Update your password
                    </p>
                  </button>
                  <button className="w-full p-4 rounded-xl border border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors text-left">
                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                      Add an extra layer of security
                    </p>
                  </button>
                </>
              )}

              {activeSetting.title === "Preferences" && (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 block">
                        Language
                      </label>
                      <select className="w-full p-3 rounded-xl bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary focus:border-accent-primary focus:outline-none">
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 block">
                        Timezone
                      </label>
                      <select className="w-full p-3 rounded-xl bg-light-bg-primary dark:bg-dark-bg-primary border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary focus:border-accent-primary focus:outline-none">
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC-8 (Pacific Time)</option>
                        <option>UTC+0 (London)</option>
                        <option>UTC+1 (Berlin)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-light-border dark:border-dark-border">
              <button
                onClick={() => {
                  toast.success(`${activeSetting.title} settings saved!`)
                  setActiveSetting(null)
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-dark transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setActiveSetting(null)}
                className="px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border border-accent-danger p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-accent-danger/10">
                <FiAlertTriangle className="w-6 h-6 text-accent-danger" />
              </div>
              <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                Delete Account?
              </h3>
            </div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-6 leading-relaxed">
              This action cannot be undone. All your data, tasks, and projects will be permanently
              deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-accent-danger text-white font-semibold hover:bg-accent-danger-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Me
