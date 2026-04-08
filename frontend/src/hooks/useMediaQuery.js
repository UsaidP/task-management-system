import { useCallback, useEffect, useState } from "react"

/**
 * Hook that tracks whether a media query matches.
 *
 * @param {string} query - The CSS media query to test
 * @returns {boolean} Whether the media query currently matches
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)")
 * const isDark = useMediaQuery("(prefers-color-scheme: dark)")
 */
export const useMediaQuery = (query) => {
  const getMatches = useCallback(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(query).matches
  }, [query])

  const [matches, setMatches] = useState(getMatches)

  useEffect(() => {
    const matchMedia = window.matchMedia(query)

    // Handle initial value
    setMatches(matchMedia.matches)

    // Listen for changes
    const handleChange = () => setMatches(matchMedia.matches)

    // Use the modern addEventListener API
    matchMedia.addEventListener("change", handleChange)

    return () => {
      matchMedia.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}

export default useMediaQuery
