import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import * as FiIcons from "react-icons/fi"
import { useTheme } from "../theme/ThemeContext"

import "./Settings.css"

const Settings = () => {
  const { theme, toggleTheme } = useTheme()

  // Settings state with localStorage persistence
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("userSettings")
    return saved ? JSON.parse(saved) : {
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

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings))
  }, [settings])

  // Update individual setting
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // Toast notification state
  const [showSaveToast, setShowSaveToast] = useState(false)

  const handleSaveSettings = () => {
    setShowSaveToast(true)
    setTimeout(() => setShowSaveToast(false), 3000)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  // Reusable components
  const SettingsSection = ({ icon, title, description, children, delay = 0 }) => (
    <motion.div
      variants={sectionVariants}
      className="settings-section"
    >
      <div className="settings-section-header">
        <div className="settings-section-icon">{icon}</div>
        <div className="settings-section-info">
          <h2 className="settings-section-title">{title}</h2>
          {description && <p className="settings-section-description">{description}</p>}
        </div>
      </div>
      <div className="settings-section-content">{children}</div>
    </motion.div>
  )

  const SettingItem = ({ label, description, children }) => (
    <div className="setting-item">
      <div className="setting-item-info">
        <label className="setting-item-label">{label}</label>
        {description && <span className="setting-item-description">{description}</span>}
      </div>
      <div className="setting-item-control">{children}</div>
    </div>
  )

  const ToggleSwitch = ({ checked, onChange, id }) => (
    <label className="toggle-switch" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider">
        <span className="toggle-knob" />
      </span>
    </label>
  )

  const SelectDropdown = ({ value, onChange, options, id }) => (
    <div className="select-wrapper">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="settings-select"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <FiIcons.FiChevronDown className="select-icon" />
    </div>
  )

  return (
    <div className="settings-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="settings"
      >
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-content">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">Manage your preferences and account settings</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="settings-save-btn"
            onClick={handleSaveSettings}
          >
            <FiIcons.FiCheck />
            Save Changes
          </motion.button>
        </div>

        {/* Settings Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="settings-container"
        >
          {/* Appearance Section */}
          <SettingsSection
            title="Appearance"
            icon={<FiIcons.FiPalette />}
            description="Customize how the app looks and feels"
          >
            <SettingItem
              label="Theme"
              description="Choose between light and dark mode"
            >
              <div className="theme-toggle-group">
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => theme !== 'light' && toggleTheme()}
                >
                  <FiIcons.FiSun />
                  <span>Light</span>
                </button>
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => theme !== 'dark' && toggleTheme()}
                >
                  <FiIcons.FiMoon />
                  <span>Dark</span>
                </button>
              </div>
            </SettingItem>
          </SettingsSection>

          {/* Localization Section */}
          <SettingsSection
            title="Localization"
            icon={<FiIcons.FiGlobe />}
            description="Set your language and regional preferences"
          >
            <SettingItem label="Language">
              <SelectDropdown
                id="language"
                value={settings.language}
                onChange={(val) => updateSetting('language', val)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Español' },
                  { value: 'fr', label: 'Français' },
                  { value: 'de', label: 'Deutsch' },
                  { value: 'ja', label: '日本語' },
                  { value: 'zh', label: '中文' },
                ]}
              />
            </SettingItem>
            <SettingItem label="Timezone">
              <SelectDropdown
                id="timezone"
                value={settings.timezone}
                onChange={(val) => updateSetting('timezone', val)}
                options={[
                  { value: 'auto', label: 'Auto-detect' },
                  { value: 'utc', label: 'UTC' },
                  { value: 'est', label: 'Eastern Time (ET)' },
                  { value: 'pst', label: 'Pacific Time (PT)' },
                  { value: 'cet', label: 'Central European Time' },
                  { value: 'ist', label: 'India Standard Time' },
                ]}
              />
            </SettingItem>
            <SettingItem label="Date Format">
              <SelectDropdown
                id="date-format"
                value={settings.dateFormat}
                onChange={(val) => updateSetting('dateFormat', val)}
                options={[
                  { value: 'mdy', label: 'MM/DD/YYYY' },
                  { value: 'dmy', label: 'DD/MM/YYYY' },
                  { value: 'ymd', label: 'YYYY-MM-DD' },
                ]}
              />
            </SettingItem>
            <SettingItem label="Start of Week">
              <SelectDropdown
                id="start-of-week"
                value={settings.startOfWeek}
                onChange={(val) => updateSetting('startOfWeek', val)}
                options={[
                  { value: 'sunday', label: 'Sunday' },
                  { value: 'monday', label: 'Monday' },
                  { value: 'saturday', label: 'Saturday' },
                ]}
              />
            </SettingItem>
          </SettingsSection>

          {/* Notifications Section */}
          <SettingsSection
            title="Notifications"
            icon={<FiIcons.FiBell />}
            description="Configure how you want to be notified"
          >
            <SettingItem
              label="Email Notifications"
              description="Receive task updates via email"
            >
              <ToggleSwitch
                id="email-notifications"
                checked={settings.emailNotifications}
                onChange={(val) => updateSetting('emailNotifications', val)}
              />
            </SettingItem>
            <SettingItem
              label="Push Notifications"
              description="Get push notifications on your device"
            >
              <ToggleSwitch
                id="push-notifications"
                checked={settings.pushNotifications}
                onChange={(val) => updateSetting('pushNotifications', val)}
              />
            </SettingItem>
            <SettingItem
              label="Desktop Notifications"
              description="Show notifications on your desktop"
            >
              <ToggleSwitch
                id="desktop-notifications"
                checked={settings.desktopNotifications}
                onChange={(val) => updateSetting('desktopNotifications', val)}
              />
            </SettingItem>
            <SettingItem
              label="Task Reminders"
              description="Get reminded before task deadlines"
            >
              <ToggleSwitch
                id="task-reminders"
                checked={settings.taskReminders}
                onChange={(val) => updateSetting('taskReminders', val)}
              />
            </SettingItem>
          </SettingsSection>

          {/* Preferences Section */}
          <SettingsSection
            title="Preferences"
            icon={<FiIcons.FiSettings />}
            description="General app behavior settings"
          >
            <SettingItem
              label="Sound Effects"
              description="Play sounds for actions and notifications"
            >
              <ToggleSwitch
                id="sound-effects"
                checked={settings.soundEffects}
                onChange={(val) => updateSetting('soundEffects', val)}
              />
            </SettingItem>
            <SettingItem
              label="Auto-save"
              description="Automatically save changes as you work"
            >
              <ToggleSwitch
                id="auto-save"
                checked={settings.autoSave}
                onChange={(val) => updateSetting('autoSave', val)}
              />
            </SettingItem>
          </SettingsSection>

          {/* Account Section */}
          <SettingsSection
            title="Account"
            icon={<FiIcons.FiUser />}
            description="Manage your account and security"
          >
            <SettingItem label="Password">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="settings-button"
              >
                <FiIcons.FiLock />
                Change Password
              </motion.button>
            </SettingItem>
            <SettingItem label="Two-Factor Authentication">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="settings-button secondary"
              >
                <FiIcons.FiShield />
                Enable 2FA
              </motion.button>
            </SettingItem>
            <SettingItem label="Export Data">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="settings-button secondary"
              >
                <FiIcons.FiDownload />
                Export
              </motion.button>
            </SettingItem>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection
            title="Danger Zone"
            icon={<FiIcons.FiAlertTriangle />}
            description="Irreversible and destructive actions"
          >
            <div className="danger-zone-content">
              <SettingItem label="Delete Account" description="Permanently delete your account and all associated data">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="settings-button danger"
                >
                  <FiIcons.FiTrash2 />
                  Delete Account
                </motion.button>
              </SettingItem>
            </div>
          </SettingsSection>
        </motion.div>
      </motion.div>

      {/* Save Toast Notification */}
      {showSaveToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="save-toast"
        >
          <FiIcons.FiCheckCircle />
          <span>Settings saved successfully!</span>
        </motion.div>
      )}
    </div>
  )
}

export default Settings