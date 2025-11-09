import React from "react"
import { motion } from "framer-motion"
import * as FiIcons from "react-icons/fi"

import "./Settings.css"

const Settings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="settings"
    >
      <h1 className="settings-title">Settings</h1>
      <div className="settings-container">
        <SettingsSection title="Appearance" icon={<FiIcons.FiPalette />}>
          <SettingItem label="Theme">
            <select id="theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="Notifications" icon={<FiIcons.FiBell />}>
          <SettingItem label="Email Notifications">
            <input type="checkbox" id="email-notifications" />
          </SettingItem>
          <SettingItem label="Push Notifications">
            <input type="checkbox" id="push-notifications" />
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="Account" icon={<FiIcons.FiLock />}>
          <SettingItem>
            <button className="settings-button">Change Password</button>
          </SettingItem>
          <SettingItem>
            <button className="settings-button danger">Delete Account</button>
          </SettingItem>
        </SettingsSection>
      </div>
    </motion.div>
  )
}

const SettingsSection = ({ icon, title, children }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="settings-section"
  >
    <h2 className="settings-section-title">
      {icon}
      <span>{title}</span>
    </h2>
    <div className="settings-section-content">{children}</div>
  </motion.div>
)

const SettingItem = ({ label, children }) => (
  <div className="setting-item">
    {label && <label>{label}</label>}
    {children}
  </div>
)

export default Settings
