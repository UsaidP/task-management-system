import { useCallback, useRef, useState } from "react"

/**
 * Hook that prevents double-submission on mutation operations.
 * Returns a boolean `isSubmitting` and a wrapped `handleSubmit` function.
 *
 * @param {Function} handler - The async function to execute
 * @returns {{ isSubmitting: boolean, handleSubmit: Function }}
 *
 * @example
 * const { isSubmitting, handleSubmit } = useMutation(async () => {
 *   await apiService.createTask(projectId, data)
 * })
 *
 * <button disabled={isSubmitting} onClick={handleSubmit}>
 *   {isSubmitting ? "Saving..." : "Save"}
 * </button>
 */
export const useMutation = (handler) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ Use ref to track submitting state without affecting hook deps
  // This prevents handleSubmit from getting a new identity on every isSubmitting change
  const isSubmittingRef = useRef(false)

  const handleSubmit = useCallback(
    async (...args) => {
      // Check via ref (doesn't affect closure)
      if (isSubmittingRef.current) return

      isSubmittingRef.current = true
      setIsSubmitting(true)
      try {
        return await handler(...args)
      } finally {
        isSubmittingRef.current = false
        setIsSubmitting(false)
      }
    },
    [handler] // ✅ Stable: only changes if handler definition changes
  )

  return { isSubmitting, handleSubmit }
}
