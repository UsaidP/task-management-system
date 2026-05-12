import { TriangleAlertIcon as AlertTriangle } from "@animateicons/react/lucide"

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center h-screen bg-bg-canvas text-text-primary"
    >
      <AlertTriangle className="w-12 h-12 text-danger mb-4" />
      <h2 className="text-2xl font-bold text-danger mb-4">Something went wrong:</h2>
      <pre className="text-sm font-mono text-danger bg-bg-surface border border-accent-danger/20 dark:border-accent-danger/30 p-4 rounded-lg whitespace-pre-wrap max-w-lg">
        {error.message}
      </pre>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="mt-6 px-5 py-2.5 bg-primary hover:bg-accent-primary-dark dark:hover:bg-accent-primary text-white rounded-xl font-semibold shadow-md transition-all duration-200"
      >
        Try again
      </button>
    </div>
  )
}

export default ErrorFallback
