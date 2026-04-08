import { useCallback, useState } from "react"

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

  const handleSubmit = useCallback(
    async (...args) => {
      if (isSubmitting) return
      setIsSubmitting(true)
      try {
        return await handler(...args)
      } finally {
        setIsSubmitting(false)
      }
    },
    [handler, isSubmitting]
  )

  return { isSubmitting, handleSubmit }
}
