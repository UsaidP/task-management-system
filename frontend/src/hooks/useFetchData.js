import { useCallback, useEffect, useState } from "react"

/**
 * A reusable data fetching hook with built-in AbortController,
 * loading states, error handling, and request cancellation.
 *
 * @param {Function} fetchFn - Async function that returns the data
 * @param {Object} options
 * @param {boolean} options.enabled - Whether to fetch immediately (default: true)
 * @param {Array} options.deps - Dependencies that trigger refetch
 * @returns {{ data, loading, error, refetch }}
 *
 * @example
 * const { data, loading, error, refetch } = useFetchData(
 *   (signal) => apiService.getTasks(signal),
 *   { deps: [projectId] }
 * )
 */
export const useFetchData = (fetchFn, { enabled = true, deps = [] } = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (abortSignal) => {
      if (!enabled) return

      setLoading(true)
      setError(null)

      try {
        const result = await fetchFn(abortSignal)
        setData(result)
      } catch (err) {
        // Ignore abort errors - they mean the component unmounted
        if (err.name === "AbortError") return
        setError(err)
      } finally {
        setLoading(false)
      }
    },
    [fetchFn, enabled]
  )

  useEffect(() => {
    const controller = new AbortController()
    execute(controller.signal)

    return () => {
      controller.abort()
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: execute is stable via useCallback
  }, [...deps, execute])

  const refetch = useCallback(() => {
    const controller = new AbortController()
    execute(controller.signal)
    return controller
  }, [execute])

  return { data, loading, error, refetch }
}
