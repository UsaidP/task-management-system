import { FiAlertTriangle, FiInbox, FiWifiOff } from "react-icons/fi"

export const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <div className="p-4 rounded-2xl bg-accent-warning/10 dark:bg-accent-warning/20 mb-4">
      <FiAlertTriangle className="w-10 h-10 text-accent-warning" />
    </div>
    <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
      404 - Not Found
    </h2>
    <p className="text-light-text-secondary dark:text-dark-text-secondary">
      The page you are looking for does not exist.
    </p>
  </div>
)

export const ServerError = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <div className="p-4 rounded-2xl bg-accent-danger/10 dark:bg-accent-danger/20 mb-4">
      <FiAlertTriangle className="w-10 h-10 text-accent-danger" />
    </div>
    <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
      500 - Server Error
    </h2>
    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
      There was an issue with our server. Please try again later.
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-5 py-2.5 bg-accent-primary hover:bg-accent-primary-dark dark:bg-accent-primary-light dark:hover:bg-accent-primary text-white rounded-xl font-semibold shadow-sm transition-all duration-200"
      >
        Retry
      </button>
    )}
  </div>
)

export const NetworkError = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <div className="p-4 rounded-2xl bg-accent-danger/10 dark:bg-accent-danger/20 mb-4">
      <FiWifiOff className="w-10 h-10 text-accent-danger" />
    </div>
    <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
      Network Error
    </h2>
    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
      Please check your internet connection and try again.
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-5 py-2.5 bg-accent-primary hover:bg-accent-primary-dark dark:bg-accent-primary-light dark:hover:bg-accent-primary text-white rounded-xl font-semibold shadow-sm transition-all duration-200"
      >
        Retry
      </button>
    )}
  </div>
)

export const EmptyState = ({ message, icon: Icon = FiInbox }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed border-light-border dark:border-dark-border rounded-2xl">
    <div className="p-4 rounded-2xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary mb-4">
      <Icon className="w-10 h-10 text-light-text-tertiary dark:text-dark-text-tertiary" />
    </div>
    <p className="text-light-text-secondary dark:text-dark-text-secondary">{message}</p>
  </div>
)

export const EmptyStateAction = ({ message, icon: Icon = FiInbox, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed border-light-border dark:border-dark-border rounded-2xl">
    <div className="p-4 rounded-2xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary mb-4">
      <Icon className="w-10 h-10 text-light-text-tertiary dark:text-dark-text-tertiary" />
    </div>
    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">{message}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="px-5 py-2.5 bg-accent-primary hover:bg-accent-primary-dark dark:bg-accent-primary-light dark:hover:bg-accent-primary text-white rounded-xl font-semibold shadow-sm transition-all duration-200"
      >
        {actionLabel}
      </button>
    )}
  </div>
)
