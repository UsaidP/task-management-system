import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import apiService from "../../../service/apiService.js"
import { ActivityIcon as Activity, BellIcon as Bell, CircleCheckIcon as CircleCheck, ChevronRightIcon as ChevronRight, EyeIcon as Eye, FolderIcon as Folder, GithubIcon as Github, GlobeIcon as Globe, LinkedinIcon as Linkedin, LockIcon as Lock, MailIcon as Mail, MapPinIcon as MapPin, MoonIcon as Moon, PhoneIcon as Phone, SettingsIcon as Settings, ShareIcon as Share, StarIcon as Star, TrashIcon as Trash, TrendingUpIcon as TrendingUp, TriangleAlertIcon as TriangleAlert, UserIcon as User, XIcon as X } from "@animateicons/react/lucide"
import { AwardIcon as Award, BriefcaseIcon as Briefcase, CalendarIcon as Calendar, CircleIcon as Circle, ClockIcon as Clock, PencilIcon as Pencil } from "lucide-react"
import { useAuth } from "../../contexts/customHook.js"
import { getOptimizedAvatarUrl } from "../../utils/imageHelpers.js"
import { Skeleton, SkeletonCircle, SkeletonText } from "../Skeleton.jsx"
import EditProfileModal from "./EditProfileModal.jsx"

const ProfileSkeleton = () => (
  <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <SkeletonText width="w-40" height="h-8" className="mb-2" />
        <SkeletonText width="w-56" height="h-5" />
      </div>
      <Skeleton className="h-10 w-28 rounded-xl" />
    </div>

    {/* Profile Header Card */}
    <div className="p-6 border bg-light-bg-primary dark:bg-dark-bg-tertiary rounded-2xl border-light-border dark:border-dark-border sm:p-8">
      <div className="flex flex-col items-center gap-6 mb-8 sm:flex-row">
        <SkeletonCircle size="w-24 h-24" className="!rounded-full" />
        <div className="text-center sm:text-left">
          <SkeletonText width="w-48" height="h-8" className="mb-2" />
          <SkeletonText width="w-64" height="h-5" className="mb-1" />
          <SkeletonText width="w-32" height="h-4" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-light-bg-secondary dark:bg-dark-bg-secondary">
            <SkeletonCircle size="w-8 h-8" className="mb-3" />
            <SkeletonText width="w-12" height="h-8" className="mb-1" />
            <SkeletonText width="w-20" height="h-4" />
          </div>
        ))}
      </div>
    </div>

    {/* Info Grid */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-4 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
          <SkeletonCircle size="w-6 h-6" className="mb-3" />
          <SkeletonText width="w-24" height="h-4" className="mb-2" />
          <SkeletonText width="w-32" height="h-5" />
        </div>
      ))}
    </div>

    {/* Settings Menu */}
    <div className="p-4 border bg-light-bg-primary dark:bg-dark-bg-tertiary rounded-2xl border-light-border dark:border-dark-border">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 border-b border-light-border dark:border-dark-border last:border-0"
        >
          <SkeletonCircle size="w-10 h-10" className="!rounded-xl" />
          <div className="flex-1">
            <SkeletonText width="w-32" height="h-5" className="mb-1" />
            <SkeletonText width="w-40" height="h-4" />
          </div>
          <SkeletonCircle size="w-5 h-5" />
        </div>
      ))}
    </div>
  </div>
)

const InfoItem = ({ icon: Icon, label, value, href }) => {
  if (!value) return null

  return (
    <div className="flex items-center gap-3 p-3 transition-colors duration-200 rounded-lg group bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
      <div className="p-2 transition-colors duration-200 rounded-lg bg-accent-primary/10 group-hover:bg-accent-primary/20">
        <Icon className="flex-shrink-0 w-4 h-4 text-accent-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium tracking-wide uppercase text-light-text-secondary dark:text-dark-text-secondary">
          {label}
        </p>
        {href ? (
          <a
            href={href.startsWith("http") ? href : `https://${href}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-medium truncate transition-colors text-accent-primary hover:text-accent-primary-dark dark:hover:text-accent-primary-light"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium truncate text-light-text-primary dark:text-dark-text-primary">
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
    className="relative p-5 overflow-hidden transition-shadow duration-200 border group bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-xl border-light-border dark:border-dark-border hover:shadow-md dark:hover:shadow-dark-md"
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
          <span className="px-2 py-1 text-xs font-medium rounded-full text-light-text-secondary dark:text-dark-text-secondary bg-light-bg-hover dark:bg-dark-bg-hover">
            {subtext}
          </span>
        )}
      </div>
      <p className="mb-1 text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
        {value}
      </p>
      <p className="text-xs font-medium tracking-wide uppercase text-light-text-secondary dark:text-dark-text-secondary">
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
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{subtitle}</p>
    </div>
    <ChevronRight className="w-5 h-5 transition-colors text-light-text-secondary dark:text-dark-text-secondary group-hover:text-accent-primary" />
  </motion.button>
)

const Me = () => {
  const { user, logout, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
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
    // Simulate brief loading for skeleton polish
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      try {
        const tasksRes = await apiService.getAllTaskOfUser()
        if (tasksRes.success) {
          const tasks = tasksRes.data?.tasks || []
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
  // Also apply ImageKit resize params for LCP optimization
  const avatarSrc = user?.avatar?.url
    ? `${getOptimizedAvatarUrl(user.avatar.url, 150)}${user.avatar.url.includes("?") ? "&" : "?"}t=${Date.now()}`
    : null

  const [avatarFailed, setAvatarFailed] = useState(false)

  const handleAvatarError = () => {
    setAvatarFailed(true)
  }

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
      formData.append("avatar", file)

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

  const handleProfileUpdate = (updatedUser) => {
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
    const toastId = toast.loading("Deleting account...")
    try {
      await apiService.deleteAccount()
      toast.success("Account deleted successfully", { id: toastId })
      await logout()
    } catch (_err) {
      toast.error("Failed to delete account", { id: toastId })
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
        return <CircleCheck className="w-4 h-4 text-accent-success" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-accent-primary" />
      case "under-review":
        return <Eye className="w-4 h-4 text-accent-warning" />
      default:
        return <Circle className="w-4 h-4 text-light-text-tertiary" />
    }
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 rounded-full border-accent-primary/30 border-t-accent-primary animate-spin" />
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  const settingsMenu = [
    {
      icon: User,
      title: "Personal Info",
      subtitle: "Name, phone, bio, location",
      color: "text-accent-primary",
      onClick: () => setShowPersonalInfo(true),
    },
    {
      icon: Bell,
      title: "Notifications",
      subtitle: "Email & push notifications",
      color: "text-accent-warning",
      onClick: () =>
        handleSettingClick({
          icon: Bell,
          title: "Notifications",
          subtitle: "Email & push notifications",
        }),
    },
    {
      icon: Moon,
      title: "Appearance",
      subtitle: "Theme & display settings",
      color: "text-accent-info",
      onClick: () =>
        handleSettingClick({
          icon: Moon,
          title: "Appearance",
          subtitle: "Theme & display settings",
        }),
    },
    {
      icon: Lock,
      title: "Security",
      subtitle: "Password & authentication",
      color: "text-accent-danger",
      onClick: () =>
        handleSettingClick({
          icon: Lock,
          title: "Security",
          subtitle: "Password & authentication",
        }),
    },
    {
      icon: Settings,
      title: "Preferences",
      subtitle: "Language, timezone, defaults",
      color: "text-accent-purple",
      onClick: () =>
        handleSettingClick({
          icon: Settings,
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
      className="flex flex-col h-full overflow-hidden"
    >
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl p-6 mx-auto space-y-6 md:p-8">
          {/* Profile Header Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative p-6 overflow-hidden border backdrop-blur-sm bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border-light-border dark:border-dark-border md:p-8"
          >
            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-bl-full bg-gradient-to-br from-accent-primary/5 to-accent-success/5" />

            <div className="relative flex flex-col items-center gap-6 md:flex-row">
              {/* Avatar */}
              <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                <label
                  htmlFor="profile"
                  className="block w-32 h-32 overflow-hidden transition-shadow shadow-lg cursor-pointer group-hover:shadow-xl"
                >
                  <div className="relative flex items-center justify-center w-full h-full overflow-hidden text-5xl font-bold bg-transparent rounded-2xl text-light-text-primary dark:text-dark-text-primary">
                    {user?.avatar?.url &&
                    !user.avatar.url.includes("placehold.co") &&
                    !user.avatar.url.includes("pravatar.cc") &&
                    !avatarFailed ? (
                      <img
                        alt="Avatar"
                        className="object-cover w-full h-full"
                        src={avatarSrc}
                        decoding="async"
                        onError={handleAvatarError}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full rounded-2xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
                        <User className="w-1/2 h-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 bg-utility-overlay group-hover:opacity-100">
                    <span className="text-sm font-medium text-light-text-inverse">Change</span>
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
                <div className="absolute w-6 h-6 border-4 rounded-full -bottom-1 -right-1 bg-accent-success border-light-bg-secondary dark:border-dark-bg-tertiary" />
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                  <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    {displayName}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-semibold uppercase tracking-wide w-fit mx-auto md:mx-0">
                    <Award className="w-3.5 h-3.5" />
                    {displayRole}
                  </span>
                </div>
                <p className="flex items-center justify-center gap-2 mt-2 text-light-text-secondary md:justify-start">
                  <Mail className="w-4 h-4 text-accent-primary" />
                  <span className="font-medium">{displayEmail}</span>
                </p>
                <div className="flex items-center justify-center gap-4 mt-3 md:justify-start">
                  <span className="flex items-center gap-1.5 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    <Calendar className="w-4 h-4" />
                    Joined {joinDate}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    <Star className="w-4 h-4 text-accent-warning" />
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
                  className="p-3 transition-colors border rounded-xl border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                >
                  <Share className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={editProfileHandler}
                  className="p-3 transition-colors shadow-md rounded-xl bg-accent-primary text-light-text-inverse hover:bg-accent-primary-dark"
                >
                  <Pencil className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            <StatCard
              icon={CircleCheck}
              label="Completed"
              value={stats.tasksCompleted}
              color="bg-accent-success"
              subtext={`${stats.tasksCount > 0 ? Math.round((stats.tasksCompleted / stats.tasksCount) * 100) : 0}%`}
            />
            <StatCard
              icon={Clock}
              label="In Progress"
              value={stats.tasksInProgress}
              color="bg-accent-primary"
            />
            <StatCard
              icon={Folder}
              label="Total Tasks"
              value={stats.tasksCount}
              color="bg-accent-warning"
            />
            <StatCard
              icon={TrendingUp}
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Profile Info */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6 lg:col-span-2"
            >
              {/* Profile Information */}
              <div className="overflow-hidden border bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border-light-border dark:border-dark-border">
                <div className="p-5 border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-primary/10">
                      <User className="w-5 h-5 text-accent-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                      Profile Information
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <InfoItem icon={Phone} label="Phone" value={user?.phone} />
                    <InfoItem icon={Briefcase} label="Company" value={user?.company} />
                    <InfoItem icon={Briefcase} label="Job Title" value={user?.jobTitle} />
                    <InfoItem icon={MapPin} label="Location" value={user?.location} />
                    <InfoItem
                      icon={Globe}
                      label="Website"
                      value={user?.website}
                      href={user?.website}
                    />
                    <InfoItem
                      icon={Linkedin}
                      label="LinkedIn"
                      value={user?.linkedin}
                      href={user?.linkedin}
                    />
                    <InfoItem
                      icon={Github}
                      label="GitHub"
                      value={user?.github}
                      href={user?.github}
                    />
                  </div>
                  {user?.bio && (
                    <div className="p-4 mt-4 border rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 border-light-border dark:border-dark-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-accent-primary" />
                        <p className="text-xs font-semibold tracking-wide uppercase text-light-text-tertiary dark:text-dark-text-tertiary">
                          Bio
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed text-light-text-primary dark:text-dark-text-primary">
                        {user.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Overview */}
              <div className="overflow-hidden border bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border-light-border dark:border-dark-border">
                <div className="p-5 border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-success/10">
                      <Activity className="w-5 h-5 text-accent-success" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                      Recent Activity
                    </h3>
                  </div>
                </div>
                <div className="divide-y divide-light-border dark:divide-dark-border">
                  {recentActivity.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-light-text-tertiary dark:text-dark-text-tertiary opacity-40" />
                        <p className="font-medium text-light-text-secondary dark:text-dark-text-secondary">
                          No recent activity
                        </p>
                        <p className="mt-1 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
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
                        className="flex items-start gap-3 p-4 transition-colors hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                      >
                        <div className="flex-shrink-0 p-2 rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-secondary">
                          {getStatusIcon(activity.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-light-text-primary dark:text-dark-text-primary">
                            {activity.type === "completed" ? "Completed" : "Updated"} task:{" "}
                            <span className="text-accent-primary">{activity.title}</span>
                          </p>
                          <p className="mt-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
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
              <div className="overflow-hidden border bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border-light-border dark:border-dark-border">
                <div className="p-5 border-b border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-warning/10">
                      <Settings className="w-5 h-5 text-accent-warning" />
                    </div>
                    <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                      Account Settings
                    </h3>
                  </div>
                </div>
                <div className="divide-y divide-light-border dark:divide-dark-border">
                  {settingsMenu.map((item) => (
                    <SettingsItem
                      key={item.title}
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
              <div className="overflow-hidden border bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border-accent-danger/30">
                <div className="p-5 border-b border-accent-danger/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-danger/10">
                      <Trash className="w-5 h-5 text-accent-danger" />
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
                      <p className="mt-1 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                        Permanently delete your account
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-accent-danger text-accent-danger font-semibold hover:bg-accent-danger hover:text-light-text-inverse transition-all duration-200"
                    >
                      <Trash className="w-4 h-4" />
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
            className="py-6 text-center border-t border-light-border dark:border-dark-border"
          >
            <p className="text-sm font-medium text-light-text-tertiary dark:text-dark-text-tertiary">
              TaskFlow v1.0.0
            </p>
            <p className="mt-1 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-utility-overlay dark:bg-utility-overlay-dark backdrop-blur-sm"
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
                  <User className="w-6 h-6 text-accent-primary" />
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
                  className="p-2 transition-colors rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover focus-visible-ring"
                  title="Edit Profile"
                >
                  <Pencil className="w-5 h-5 text-accent-primary" />
                </button>
                <button
                  onClick={() => setShowPersonalInfo(false)}
                  className="p-2 transition-colors rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover focus-visible-ring"
                >
                  <X className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
                <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 text-2xl font-bold rounded-xl bg-gradient-to-br from-accent-primary via-accent-success to-accent-warning text-light-text-inverse">
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt="Avatar"
                      className="object-cover w-full h-full rounded-xl"
                      loading="lazy"
                      decoding="async"
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
                  <p className="mt-1 text-xs capitalize text-light-text-tertiary dark:text-dark-text-tertiary">
                    {user?.role}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoItem icon={Phone} label="Phone" value={user?.phone || "Not set"} />
                <InfoItem icon={Briefcase} label="Company" value={user?.company || "Not set"} />
                <InfoItem
                  icon={Briefcase}
                  label="Job Title"
                  value={user?.jobTitle || "Not set"}
                />
                <InfoItem icon={MapPin} label="Location" value={user?.location || "Not set"} />
              </div>

              {user?.bio && (
                <div className="p-4 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-accent-primary" />
                    <p className="text-xs font-semibold tracking-wide uppercase text-light-text-tertiary dark:text-dark-text-tertiary">
                      Bio
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-light-text-primary dark:text-dark-text-primary">
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
                    className="flex items-center gap-3 p-3 transition-colors rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                  >
                    <Globe className="flex-shrink-0 w-5 h-5 text-accent-primary" />
                    <span className="text-sm font-medium truncate text-light-text-primary dark:text-dark-text-primary">
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
                    className="flex items-center gap-3 p-3 transition-colors rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                  >
                    <Linkedin className="flex-shrink-0 w-5 h-5 text-accent-primary" />
                    <span className="text-sm font-medium truncate text-light-text-primary dark:text-dark-text-primary">
                      LinkedIn
                    </span>
                  </a>
                )}
                {user?.github && (
                  <a
                    href={user.github.startsWith("http") ? user.github : `https://${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 transition-colors rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                  >
                    <Github className="flex-shrink-0 w-5 h-5 text-accent-primary" />
                    <span className="text-sm font-medium truncate text-light-text-primary dark:text-dark-text-primary">
                      GitHub
                    </span>
                  </a>
                )}
              </div>

              <div className="pt-4 border-t border-light-border dark:border-dark-border">
                <div className="flex items-center gap-2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                  <Calendar className="w-4 h-4" />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-utility-overlay dark:bg-utility-overlay-dark backdrop-blur-sm"
          onClick={() => setActiveSetting(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-md p-6 mx-4 border shadow-2xl bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border-light-border dark:border-dark-border"
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
                className="p-2 transition-colors rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover focus-visible-ring"
              >
                <X className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
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
                    <div className="relative w-12 h-6 rounded-full cursor-pointer bg-accent-primary">
                      <div className="absolute w-4 h-4 rounded-full shadow right-1 top-1 bg-light-text-inverse" />
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
                    <div className="relative w-12 h-6 rounded-full cursor-pointer bg-light-border dark:bg-dark-border">
                      <div className="absolute w-4 h-4 rounded-full shadow left-1 top-1 bg-light-text-inverse" />
                    </div>
                  </div>
                </>
              )}

              {activeSetting.title === "Appearance" && (
                <>
                  <p className="mb-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Choose your preferred theme
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleThemeChange("light")}
                      className={`p-4 rounded-xl border-2 ${selectedTheme === "light" ? "border-accent-primary bg-light-bg-primary dark:bg-dark-bg-primary" : "border-light-border dark:border-dark-border"} focus-visible-ring`}
                    >
                      <div className="w-full h-12 mb-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-tertiary" />
                      <p className="text-xs font-medium text-center text-light-text-primary dark:text-dark-text-primary">
                        Light
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeChange("dark")}
                      className={`p-4 rounded-xl border-2 ${selectedTheme === "dark" ? "border-accent-primary bg-dark-bg-primary" : "border-light-border dark:border-dark-border"} focus-visible-ring`}
                    >
                      <div className="w-full h-12 mb-2 rounded-lg bg-dark-bg-tertiary" />
                      <p className="text-xs font-medium text-center text-light-text-primary dark:text-dark-text-primary">
                        Dark
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemeChange("system")}
                      className={`p-4 rounded-xl border-2 ${selectedTheme === "system" ? "border-accent-primary" : "border-light-border dark:border-dark-border"} focus-visible-ring`}
                    >
                      <div className="w-full h-12 mb-2 rounded-lg bg-gradient-to-r from-light-bg-secondary to-dark-bg-tertiary" />
                      <p className="text-xs font-medium text-center text-light-text-primary dark:text-dark-text-primary">
                        System
                      </p>
                    </button>
                  </div>
                </>
              )}

              {activeSetting.title === "Security" && (
                <>
                  <div className="p-4 rounded-xl bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
                    <p className="mb-1 font-medium text-light-text-primary dark:text-dark-text-primary">
                      Password
                    </p>
                    <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                      Last changed 30 days ago
                    </p>
                  </div>
                  <button className="w-full p-4 text-left rounded-xl card-interactive">
                    <p className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      Change Password
                    </p>
                    <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-0.5">
                      Update your password
                    </p>
                  </button>
                  <button className="w-full p-4 text-left rounded-xl card-interactive">
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
                <div className="space-y-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      Language
                    </label>
                    <select className="input-field">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      Timezone
                    </label>
                    <select className="input-field">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC+0 (London)</option>
                      <option>UTC+1 (Berlin)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-light-border dark:border-dark-border">
              <button
                onClick={() => {
                  toast.success(`${activeSetting.title} settings saved!`)
                  setActiveSetting(null)
                }}
                className="btn-primary flex-1 px-4 py-2.5 rounded-lg"
              >
                Save Changes
              </button>
              <button
                onClick={() => setActiveSetting(null)}
                className="btn-ghost flex-1 px-4 py-2.5 rounded-lg"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-utility-overlay dark:bg-utility-overlay-dark backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm p-6 mx-4 border shadow-xl bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border-accent-danger dark:shadow-dark-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-accent-danger/10">
                <TriangleAlert className="w-6 h-6 text-accent-danger" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                Delete Account?
              </h3>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-light-text-secondary dark:text-dark-text-secondary">
              This action cannot be undone. All your data, tasks, and projects will be permanently
              deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover text-light-text-primary dark:text-dark-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="btn-danger flex-1 px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
