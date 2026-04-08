import { AlertTriangle, RefreshCw } from "lucide-react"
import { Component } from "react"

/**
 * Error Boundary component that catches errors in its child tree
 * and displays a fallback UI instead of crashing the entire app.
 *
 * Usage:
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service in production
    console.error("[ErrorBoundary] Caught error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props
      if (fallback) return fallback

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-950/20">
          <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
          <h3 className="mb-1 text-lg font-semibold text-red-800 dark:text-red-200">
            Something went wrong
          </h3>
          <p className="mb-4 max-w-md text-center text-sm text-red-600 dark:text-red-400">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
