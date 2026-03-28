import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiEdit,
  FiFolder,
  FiGrid,
  FiLock,
  FiMail,
  FiMoon,
  FiBell,
  FiUser,
  FiLogOut,
  FiTrash2,
  FiStar,
  FiZap,
  FiMapPin,
  FiBriefcase,
  FiGlobe,
  FiLinkedin,
  FiGithub
} from "react-icons/fi"
import { useAuth } from "../context/customHook.js"
import EditProfileModal from "./EditProfileModal.jsx"
import apiService from "../../../service/apiService.js"
import toast from "react-hot-toast"

const Me = () => {
  const { user, logout, fetchUser } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksInProgress: 0,
    projectsCount: 0,
    sprintsCount: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      try {
        const tasksRes = await apiService.getAllTaskOfUser()
        if (tasksRes.success) {
          const tasks = tasksRes.data || []
          setStats({
            tasksCompleted: tasks.filter(t => t.status === "completed").length,
            tasksInProgress: tasks.filter(t => t.status === "in-progress" || t.status === "under-review").length,
            tasksCount: tasks.length,
            projectsCount: 0,
            sprintsCount: 0
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

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append("avatars", file)
      const updateAvatar = await apiService.updateAvatar(formData)
      updateUser({ avatar: updateAvatar.data.avatar })
      toast.success("Avatar updated successfully!")
    } else {
      toast.error("No file selected!")
    }
  }

  const handleProfileUpdate = async (updatedUser) => {
    setIsEditModalOpen(false)
    await fetchUser()
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full text-light-text-secondary dark:text-dark-text-secondary">
        Loading user profile...
      </div>
    )
  }

  const menuItems = [
    {
      icon: FiUser,
      title: "Personal Info",
      subtitle: "Name, email, phone",
      color: "text-accent-primary",
      onClick: () => setIsEditModalOpen(true)
    },
    {
      icon: FiBell,
      title: "Notifications",
      subtitle: "Email & push notifications",
      color: "text-accent-warning",
      onClick: () => {}
    },
    {
      icon: FiMoon,
      title: "Appearance",
      subtitle: "Theme & display settings",
      color: "text-accent-info",
      onClick: () => {}
    },
    {
      icon: FiLock,
      title: "Security",
      subtitle: "Password & authentication",
      color: "text-accent-danger",
      onClick: () => {}
    },
    {
      icon: FiLogOut,
      title: "Sign Out",
      subtitle: "Log out of your account",
      color: "text-light-text-tertiary",
      onClick: () => logout()
    },
  ]

  return (
    <motion.div
      className="h-full flex flex-col"
      style={{ boxShadow: "0px 0px 1px 0.1px #000000" }}
    >
      <motion.div
        className="p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary shrink-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border"
        >
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
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Profile Card */}
          <motion.div
            variants={itemVariants}
            className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border p-6 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="flex-shrink-0">
              <div className="relative w-28 h-28 rounded-full">
                <label htmlFor="profile" className="block w-full h-full rounded-full cursor-pointer">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-primary to-accent-success flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                    {user?.avatar?.url ? (
                      <img alt="Profile Avatar" className="w-full h-full object-cover" src={user.avatar.url} />
                    ) : (
                      <span className="select-none">{displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 w-full h-full bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full">
                    <span className="text-white text-sm">Change</span>
                  </div>
                </label>
                <input type="file" name="profile" id="profile" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
              </div>
            </div>
            <div className="text-center md:text-left flex-grow">
              <h2 className="text-light-text-primary dark:text-dark-text-primary text-3xl font-bold mb-1">{displayName}</h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary flex items-center justify-center md:justify-start gap-2">
                <FiMail className="w-4 h-4" /> {displayEmail}
              </p>
              <p className="text-light-text-secondary dark:text-dark-text-secondary flex items-center justify-center md:justify-start gap-2">
                <FiAward className="w-4 h-4" /> {displayRole}
              </p>
              {user?.bio && (
                <p className="text-light-text-tertiary dark:text-dark-text-tertiary mt-2 text-sm">{user.bio}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-3">
                {user?.jobTitle && (
                  <span className="flex items-center gap-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    <FiBriefcase className="w-3 h-3" /> {user.jobTitle}
                  </span>
                )}
                {user?.company && (
                  <span className="flex items-center gap-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    <FiBriefcase className="w-3 h-3" /> {user.company}
                  </span>
                )}
                {user?.location && (
                  <span className="flex items-center gap-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    <FiMapPin className="w-3 h-3" /> {user.location}
                  </span>
                )}
                {user?.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent-primary hover:underline">
                    <FiGlobe className="w-3 h-3" /> Website
                  </a>
                )}
                {user?.linkedin && (
                  <a href={user.linkedin.startsWith("http") ? user.linkedin : `https://${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent-primary hover:underline">
                    <FiLinkedin className="w-3 h-3" /> LinkedIn
                  </a>
                )}
                {user?.github && (
                  <a href={user.github.startsWith("http") ? user.github : `https://${user.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent-primary hover:underline">
                    <FiGithub className="w-3 h-3" /> GitHub
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
              <FiCalendar className="w-4 h-4" />
              <span>Joined {joinDate}</span>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent-success/20">
                  <FiCheckCircle className="w-5 h-5 text-accent-success" />
                </div>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">Completed</span>
              </div>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{stats.tasksCompleted}</p>
            </div>
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent-primary/20">
                  <FiClock className="w-5 h-5 text-accent-primary" />
                </div>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">In Progress</span>
              </div>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{stats.tasksInProgress}</p>
            </div>
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent-warning/20">
                  <FiFolder className="w-5 h-5 text-accent-warning" />
                </div>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">Projects</span>
              </div>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{stats.projectsCount}</p>
            </div>
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent-info/20">
                  <FiGrid className="w-5 h-5 text-accent-info" />
                </div>
                <span className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">Sprints</span>
              </div>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{stats.sprintsCount}</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border hover:border-accent-primary/50 transition-colors text-left">
                <div className="p-2 rounded-lg bg-accent-primary/20">
                  <FiZap className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <p className="font-medium text-light-text-primary dark:text-dark-text-primary">My Tasks</p>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">View all assigned tasks</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border hover:border-accent-primary/50 transition-colors text-left">
                <div className="p-2 rounded-lg bg-accent-success/20">
                  <FiStar className="w-5 h-5 text-accent-success" />
                </div>
                <div>
                  <p className="font-medium text-light-text-primary dark:text-dark-text-primary">Starred Tasks</p>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Quick access to important tasks</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border hover:border-accent-primary/50 transition-colors text-left">
                <div className="p-2 rounded-lg bg-accent-warning/20">
                  <FiClock className="w-5 h-5 text-accent-warning" />
                </div>
                <div>
                  <p className="font-medium text-light-text-primary dark:text-dark-text-primary">Due Soon</p>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Tasks due in next 7 days</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Settings Menu */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Account Settings</h3>
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-4 p-4 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors border-b border-light-border dark:border-dark-border last:border-b-0"
                >
                  <div className={`p-2 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">{item.title}</p>
                    <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">{item.subtitle}</p>
                  </div>
                  <FiChevronRight className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-accent-danger mb-4">Danger Zone</h3>
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border border-accent-danger/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-light-text-primary dark:text-dark-text-primary">Delete Account</p>
                  <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Permanently delete your account and all data</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-danger text-accent-danger hover:bg-accent-danger hover:text-white transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>

          {/* App Info */}
          <motion.div variants={itemVariants} className="text-center py-6">
            <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
              TaskFlow v1.0.0 • Built with React + Express
            </p>
            <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs mt-1">
              © 2026 TaskFlow. All rights reserved.
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
    </motion.div>
  )
}

export default Me