import { motion } from "framer-motion"
import { memo, useEffect, useState } from "react"
import {
  FiAlertTriangle,
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiDownload,
  FiGlobe,
  FiLayout,
  FiLock,
  FiMoon,
  FiSettings,
  FiShield,
  FiSun,
  FiTrash2,
  FiUser,
} from "react-icons/fi"
import { toast } from "react-hot-toast"
import { Skeleton, SkeletonCircle, SkeletonText } from "../components/Skeleton.jsx"
import { useAuth } from "../contexts/customHook.js"
import { useTheme } from "../theme/ThemeContext"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

const SettingsSkeleton = () => (
  <div className="space-y-6 p-6 sm:p-8 max-w-[1400px] mx-auto">
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
      <div>
        <SkeletonText width="w-32 sm:w-40" height="h-8 sm:h-10" className="mb-2" />
        <SkeletonText width="w-48 sm:w-64" height="h-5" />
      </div>
      <Skeleton className="w-full sm:w-40 h-11 rounded-xl" />
    </div>
    <div className="grid gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="border bg-light-bg-primary/80 dark:bg-dark-bg-tertiary/80 rounded-2xl p-7 border-light-border dark:border-dark-border"
        >
          <div className="flex items-start gap-4 mb-6">
            <SkeletonCircle size="w-11 h-11" className="!rounded-xl" />
            <div className="flex-1">
              <SkeletonText width="w-40" height="h-6" className="mb-2" />
              <SkeletonText width="w-56" height="h-4" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="flex flex-col gap-4 py-4 border-b sm:flex-row border-light-border dark:border-dark-border last:border-0"
              >
                <div className="flex-1">
                  <SkeletonText width="w-32" height="h-5" className="mb-1" />
                  <SkeletonText width="w-40" height="h-4" />
                </div>
                <Skeleton className="w-full h-10 sm:w-44 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const SettingsSection = memo(({ icon, title, description, children }) => (
  <motion.div
    variants={sectionVariants}
    className="transition-all duration-300 border shadow-sm bg-light-bg-primary/80 dark:bg-dark-bg-tertiary/80 backdrop-blur-md rounded-2xl p-7 border-light-border dark:border-dark-border hover:shadow-md dark:shadow-dark-sm dark:hover:shadow-dark-md"
  >
    <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row">
      <div className="flex items-center justify-center flex-shrink-0 text-xl w-11 h-11 bg-accent-primary/10 dark:bg-accent-primary/20 text-accent-primary dark:text-accent-primary-light rounded-xl">
        {icon}
      </div>
      <div className="flex-1">
        <h2 className="mb-1 font-serif text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {description}
          </p>
        )}
      </div>
    </div>
    <div className="flex flex-col">{children}</div>
  </motion.div>
))
SettingsSection.displayName = "SettingsSection"

const SettingItem = memo(({ label, description, children }) => (
  <div className="flex flex-col gap-4 py-4 border-b sm:flex-row sm:justify-between sm:items-center border-light-border dark:border-dark-border first:pt-0 last:border-b-0 last:pb-0">
    <div className="flex flex-col flex-1 gap-1">
      <label className="text-base font-medium text-light-text-primary dark:text-dark-text-primary">
        {label}
      </label>
      {description && (
        <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
          {description}
        </span>
      )}
    </div>
    <div className="flex-shrink-0 w-full sm:w-auto">{children}</div>
  </div>
))
SettingItem.displayName = "SettingItem"

const ToggleSwitch = memo(({ checked, onChange, id }) => (
  <label
    className="relative inline-block rounded-full cursor-pointer focus-within:ring-2 focus-within:ring-accent-primary/20"
    htmlFor={id}
  >
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="absolute w-0 h-0 opacity-0"
    />
    <div
      className={`flex items-center w-12 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? "bg-accent-primary dark:bg-accent-primary-light" : "bg-light-bg-hover dark:bg-dark-bg-hover"}`}
    >
      <div
        className={`w-4 h-4 bg-light-text-inverse dark:bg-dark-text-inverse rounded-full shadow-sm transition-transform duration-300 ${checked ? "transform translate-x-6" : ""}`}
      />
    </div>
  </label>
))
ToggleSwitch.displayName = "ToggleSwitch"

const SelectDropdown = memo(({ value, onChange, options, id }) => (
  <div className="relative inline-block w-full sm:w-auto">
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none w-full sm:w-auto px-4 py-2.5 pr-10 bg-light-bg-secondary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border rounded-xl text-sm font-medium text-light-text-primary dark:text-dark-text-primary cursor-pointer min-w-[180px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <FiChevronDown className="absolute transform -translate-y-1/2 pointer-events-none right-3 top-1/2 text-light-text-tertiary dark:text-dark-text-tertiary" />
  </div>
))
SelectDropdown.displayName = "SelectDropdown"

const Settings = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, forgetPassword } = useAuth()
  const [loading, setLoading] = useState(true)

  const changePassword = async () => {
    try {
      if (!user?.email) {
        toast.error("User email not found")
        return
      }
      
      await forgetPassword(user.email)
      toast.success(`Password reset email sent to ${user.email}`)
    } catch (error) {
      toast.error(error?.message || "Failed to send password reset email")
    }
  }
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("userSettings")
    return saved
      ? JSON.parse(saved)
      : {
        emailNotifications: true,
        pushNotifications: false,
        desktopNotifications: true,
        language: "en",
        timezone: "auto",
        dateFormat: "dmy",
        startOfWeek: "sunday",
        taskReminders: true,
        soundEffects: true,
        autoSave: true,
      }
  })

  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings))
  }, [settings])

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const [showSaveToast, setShowSaveToast] = useState(false)

  const handleSaveSettings = () => {
    setShowSaveToast(true)
    setTimeout(() => setShowSaveToast(false), 3000)
  }

  useEffect(() => {
    // Simulate brief loading for skeleton polish
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <SettingsSkeleton />
  }

  return (
    <div className="relative min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-5 sm:p-8 max-w-[900px] mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-10 sm:flex-row">
          <div className="flex-1">
            <h1 className="mb-2 font-serif text-3xl font-bold sm:text-4xl text-light-text-primary dark:text-dark-text-primary">
              Settings
            </h1>
            <p className="text-base text-light-text-secondary dark:text-dark-text-secondary">
              Manage your preferences and account settings
            </p>
          </div>

        </div>

        {/* Settings Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6"
        >
          {/* Appearance Section */}
          <SettingsSection
            title="Appearance"
            icon={<FiLayout />}
            description="Customize how the app looks and feels"
          >
            <SettingItem label="Theme" description="Choose between light and dark mode">
              <div className="flex gap-2 w-full sm:w-auto bg-light-bg-secondary dark:bg-dark-bg-tertiary p-1.5 rounded-xl">
                <button
                  type="button"
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary/20 ${theme === "light"
                    ? "bg-light-bg-primary dark:bg-dark-bg-tertiary text-accent-primary dark:text-accent-primary-light shadow-sm"
                    : "text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                    }`}
                  onClick={() => theme !== "light" && toggleTheme()}
                >
                  <FiSun />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary/20 ${theme === "dark"
                    ? "bg-light-bg-primary dark:bg-dark-bg-tertiary text-accent-primary dark:text-accent-primary-light shadow-sm"
                    : "text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
                    }`}
                  onClick={() => theme !== "dark" && toggleTheme()}
                >
                  <FiMoon />
                  <span>Dark</span>
                </button>
              </div>
            </SettingItem>
          </SettingsSection>

          {/* Account Section */}
          <SettingsSection
            title="Account"
            icon={<FiUser />}
            description="Manage your account and security"
          >
            <SettingItem label="Password">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                onClick={changePassword}
              >
                <FiLock />
                Change Password
              </motion.button>
            </SettingItem>
            <SettingItem label="Two-Factor Authentication">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              >
                <FiShield />
                Enable 2FA
              </motion.button>
            </SettingItem>
            <SettingItem label="Export Data">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              >
                <FiDownload />
                Export
              </motion.button>
            </SettingItem>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection
            title="Danger Zone"
            icon={<FiAlertTriangle />}
            description="Irreversible and destructive actions"
          >
            <div className="p-4 border border-dashed bg-accent-danger/5 dark:bg-accent-danger/10 border-accent-danger/30 rounded-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-light-text-primary dark:text-dark-text-primary">
                    Delete Account
                  </label>
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Permanently delete your account and all associated data
                  </span>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-shrink-0 items-center justify-center gap-2 px-5 py-2.5 bg-accent-danger hover:bg-accent-danger-dark dark:bg-accent-danger dark:hover:bg-accent-danger-dark text-white rounded-xl text-sm font-semibold shadow-sm dark:shadow-dark-sm transition-all duration-200 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-accent-danger/20"
                >
                  <FiTrash2 />
                  Delete Account
                </motion.button>
              </div>
            </div>
          </SettingsSection>
        </motion.div>
      </motion.div>

      {/* Save Toast Notification */}
      {showSaveToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed z-50 flex items-center gap-3 px-6 py-4 font-medium text-white transform -translate-x-1/2 shadow-xl bottom-8 left-1/2 bg-accent-success dark:bg-accent-success-dark rounded-xl backdrop-blur-md dark:shadow-dark-lg"
        >
          <FiCheckCircle className="flex-shrink-0 text-xl" />
          <span>Settings saved successfully!</span>
        </motion.div>
      )}
    </div>
  )
}

export default Settings
