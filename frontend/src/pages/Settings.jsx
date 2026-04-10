import { memo, useEffect, useState } from "react"
import { motion } from "framer-motion"
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
import { Skeleton, SkeletonCircle, SkeletonText } from "../components/Skeleton.jsx"
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
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
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
          className="bg-light-bg-primary/80 dark:bg-dark-bg-tertiary/80 rounded-2xl p-7 border border-light-border dark:border-dark-border"
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
                className="flex flex-col sm:flex-row gap-4 py-4 border-b border-light-border dark:border-dark-border last:border-0"
              >
                <div className="flex-1">
                  <SkeletonText width="w-32" height="h-5" className="mb-1" />
                  <SkeletonText width="w-40" height="h-4" />
                </div>
                <Skeleton className="w-full sm:w-44 h-10 rounded-xl" />
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
    className="bg-light-bg-primary/80 dark:bg-dark-bg-tertiary/80 backdrop-blur-md rounded-2xl p-7 border border-light-border dark:border-dark-border shadow-sm hover:shadow-md dark:shadow-dark-sm dark:hover:shadow-dark-md transition-all duration-300"
  >
    <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
      <div className="flex items-center justify-center w-11 h-11 bg-accent-primary/10 dark:bg-accent-primary/20 text-accent-primary dark:text-accent-primary-light rounded-xl text-xl flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-serif font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
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
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 border-b border-light-border dark:border-dark-border gap-4 first:pt-0 last:border-b-0 last:pb-0">
    <div className="flex flex-col gap-1 flex-1">
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
    className="relative inline-block cursor-pointer focus-within:ring-2 focus-within:ring-accent-primary/20 rounded-full"
    htmlFor={id}
  >
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="opacity-0 w-0 h-0 absolute"
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
    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary pointer-events-none" />
  </div>
))
SelectDropdown.displayName = "SelectDropdown"

const Settings = () => {
  const { theme, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(true)
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
        <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              Settings
            </h1>
            <p className="text-base text-light-text-secondary dark:text-dark-text-secondary">
              Manage your preferences and account settings
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
            onClick={handleSaveSettings}
          >
            <FiCheck />
            Save Changes
          </motion.button>
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
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary/20 ${
                    theme === "light"
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
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary/20 ${
                    theme === "dark"
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

          {/* Localization Section */}
          <SettingsSection
            title="Localization"
            icon={<FiGlobe />}
            description="Set your language and regional preferences"
          >
            <SettingItem label="Language">
              <SelectDropdown
                id="language"
                value={settings.language}
                onChange={(val) => updateSetting("language", val)}
                options={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Español" },
                  { value: "fr", label: "Français" },
                  { value: "de", label: "Deutsch" },
                  { value: "ja", label: "日本語" },
                  { value: "zh", label: "中文" },
                ]}
              />
            </SettingItem>
            <SettingItem label="Timezone">
              <SelectDropdown
                id="timezone"
                value={settings.timezone}
                onChange={(val) => updateSetting("timezone", val)}
                options={[
                  { value: "auto", label: "Auto-detect" },
                  { value: "utc", label: "UTC" },
                  { value: "est", label: "Eastern Time (ET)" },
                  { value: "pst", label: "Pacific Time (PT)" },
                  { value: "cet", label: "Central European Time" },
                  { value: "ist", label: "India Standard Time" },
                ]}
              />
            </SettingItem>
            <SettingItem label="Date Format">
              <SelectDropdown
                id="date-format"
                value={settings.dateFormat}
                onChange={(val) => updateSetting("dateFormat", val)}
                options={[
                  { value: "mdy", label: "MM/DD/YYYY" },
                  { value: "dmy", label: "DD/MM/YYYY" },
                  { value: "ymd", label: "YYYY-MM-DD" },
                ]}
              />
            </SettingItem>
            <SettingItem label="Start of Week">
              <SelectDropdown
                id="start-of-week"
                value={settings.startOfWeek}
                onChange={(val) => updateSetting("startOfWeek", val)}
                options={[
                  { value: "sunday", label: "Sunday" },
                  { value: "monday", label: "Monday" },
                  { value: "saturday", label: "Saturday" },
                ]}
              />
            </SettingItem>
          </SettingsSection>

          {/* Notifications Section */}
          <SettingsSection
            title="Notifications"
            icon={<FiBell />}
            description="Configure how you want to be notified"
          >
            <SettingItem label="Email Notifications" description="Receive task updates via email">
              <ToggleSwitch
                id="email-notifications"
                checked={settings.emailNotifications}
                onChange={(val) => updateSetting("emailNotifications", val)}
              />
            </SettingItem>
            <SettingItem
              label="Push Notifications"
              description="Get push notifications on your device"
            >
              <ToggleSwitch
                id="push-notifications"
                checked={settings.pushNotifications}
                onChange={(val) => updateSetting("pushNotifications", val)}
              />
            </SettingItem>
            <SettingItem
              label="Desktop Notifications"
              description="Show notifications on your desktop"
            >
              <ToggleSwitch
                id="desktop-notifications"
                checked={settings.desktopNotifications}
                onChange={(val) => updateSetting("desktopNotifications", val)}
              />
            </SettingItem>
            <SettingItem label="Task Reminders" description="Get reminded before task deadlines">
              <ToggleSwitch
                id="task-reminders"
                checked={settings.taskReminders}
                onChange={(val) => updateSetting("taskReminders", val)}
              />
            </SettingItem>
          </SettingsSection>

          {/* Preferences Section */}
          <SettingsSection
            title="Preferences"
            icon={<FiSettings />}
            description="General app behavior settings"
          >
            <SettingItem
              label="Sound Effects"
              description="Play sounds for actions and notifications"
            >
              <ToggleSwitch
                id="sound-effects"
                checked={settings.soundEffects}
                onChange={(val) => updateSetting("soundEffects", val)}
              />
            </SettingItem>
            <SettingItem label="Auto-save" description="Automatically save changes as you work">
              <ToggleSwitch
                id="auto-save"
                checked={settings.autoSave}
                onChange={(val) => updateSetting("autoSave", val)}
              />
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
            <div className="bg-accent-danger/5 dark:bg-accent-danger/10 border border-dashed border-accent-danger/30 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-6 py-4 bg-accent-success dark:bg-accent-success-dark text-white rounded-xl font-medium backdrop-blur-md shadow-xl dark:shadow-dark-lg z-50"
        >
          <FiCheckCircle className="text-xl flex-shrink-0" />
          <span>Settings saved successfully!</span>
        </motion.div>
      )}
    </div>
  )
}

export default Settings
