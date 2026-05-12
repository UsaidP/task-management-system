import {
  TriangleAlertIcon as AlertTriangle,
  WifiOffIcon as WifiOff,
} from "@animateicons/react/lucide"
import { InboxIcon as Inbox } from "lucide-react"

export const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <div className="p-4 rounded-2xl bg-accent-warning/10 dark:bg-accent-warning/20 mb-4">
      <AlertTriangle className="w-10 h-10 text-warning" />
    </div>
    <h2 className="text-2xl font-bold text-text-primary mb-2">404 - Not Found</h2>
    <p className="text-text-secondary">The page you are looking for does not exist.</p>
  </div>
)

export const ServerError = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <div className="p-4 rounded-2xl bg-accent-danger/10 dark:bg-accent-danger/20 mb-4">
      <AlertTriangle className="w-10 h-10 text-danger" />
    </div>
    <h2 className="text-2xl font-bold text-text-primary mb-2">500 - Server Error</h2>
    <p className="text-text-secondary mb-6">
      There was an issue with our server. Please try again later.
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-5 py-2.5 bg-primary hover:bg-accent-primary-dark dark:hover:bg-accent-primary text-white rounded-xl font-semibold shadow-sm transition-all duration-200"
      >
        Retry
      </button>
    )}
  </div>
)

export const NetworkError = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <div className="p-4 rounded-2xl bg-accent-danger/10 dark:bg-accent-danger/20 mb-4">
      <WifiOff className="w-10 h-10 text-danger" />
    </div>
    <h2 className="text-2xl font-bold text-text-primary mb-2">Network Error</h2>
    <p className="text-text-secondary mb-6">Please check your internet connection and try again.</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-5 py-2.5 bg-primary hover:bg-accent-primary-dark dark:hover:bg-accent-primary text-white rounded-xl font-semibold shadow-sm transition-all duration-200"
      >
        Retry
      </button>
    )}
  </div>
)

export const EmptyState = ({ message, icon: Icon = Inbox }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed border-border rounded-2xl">
    <div className="p-4 rounded-2xl bg-bg-elevated mb-4">
      <Icon className="w-10 h-10 text-text-muted" />
    </div>
    <p className="text-text-secondary">{message}</p>
  </div>
)

export const EmptyStateAction = ({ message, icon: Icon = Inbox, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed border-border rounded-2xl">
    <div className="p-4 rounded-2xl bg-bg-elevated mb-4">
      <Icon className="w-10 h-10 text-text-muted" />
    </div>
    <p className="text-text-secondary mb-4">{message}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="px-5 py-2.5 bg-primary hover:bg-accent-primary-dark dark:hover:bg-accent-primary text-white rounded-xl font-semibold shadow-sm transition-all duration-200"
      >
        {actionLabel}
      </button>
    )}
  </div>
)
