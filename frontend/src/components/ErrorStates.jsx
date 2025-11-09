import React from "react"
import { FiAlertTriangle, FiInbox, FiWifiOff } from "react-icons/fi"

export const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <FiAlertTriangle className="w-16 h-16 text-accent-warning mb-4" />
    <h2 className="text-2xl font-bold mb-2">404 - Not Found</h2>
    <p>The page you are looking for does not exist.</p>
  </div>
)

export const ServerError = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <FiAlertTriangle className="w-16 h-16 text-accent-danger mb-4" />
    <h2 className="text-2xl font-bold mb-2">500 - Server Error</h2>
    <p className="mb-6">There was an issue with our server. Please try again later.</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary">
        Retry
      </button>
    )}
  </div>
)

export const NetworkError = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <FiWifiOff className="w-16 h-16 text-accent-danger mb-4" />
    <h2 className="text-2xl font-bold mb-2">Network Error</h2>
    <p className="mb-6">Please check your internet connection and try again.</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary">
        Retry
      </button>
    )}
  </div>
)

export const EmptyState = ({ message, icon: Icon = FiInbox }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg">
    <Icon className="w-16 h-16 text-light-text-tertiary dark:text-dark-text-tertiary mb-4" />
    <p className="text-light-text-secondary dark:text-dark-text-secondary">{message}</p>
  </div>
)
