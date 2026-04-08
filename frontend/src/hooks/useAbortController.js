import { useEffect, useRef } from "react"

/**
 * Creates an AbortController that is automatically aborted on unmount
 * or when dependencies change. Prevents race conditions from stale
 * requests after component unmount or rapid navigation.
 *
 * @param {Array} deps - Dependencies that trigger a new abort + request
 * @returns {AbortController} The current AbortController instance
 *
 * @example
 * function MyComponent() {
 *   const controller = useAbortController([searchTerm])
 *
 *   useEffect(() => {
 *     fetchData(controller.signal)
 *   }, [searchTerm])
 * }
 */
export const useAbortController = (deps = []) => {
  const controllerRef = useRef(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Abort any previous in-flight request
    if (controllerRef.current) {
      controllerRef.current.abort()
    }

    // Create a fresh controller for this render
    const controller = new AbortController()
    controllerRef.current = controller

    // Cleanup: abort on unmount or dep change
    return () => {
      controller.abort()
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: deps is passed dynamically
  }, [...deps])

  return controllerRef.current
}
