import { useEffect, useState } from "react"

/**
 * Debounces a value by the specified delay. Returns the debounced
 * value which updates only after the user stops changing the input
 * for `delay` milliseconds.
 *
 * @param {string} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {string} The debounced value
 *
 * @example
 * const [search, setSearch] = useState("")
 * const debouncedSearch = useDebounce(search, 500)
 *
 * useEffect(() => {
 *   fetchResults(debouncedSearch) // Only fires after 500ms of no typing
 * }, [debouncedSearch])
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
