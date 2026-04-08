import { useCallback, useEffect, useState } from "react"

/**
 * Detects online/offline status and provides a hook for components
 * to show an offline banner or disable certain interactions.
 *
 * @returns {{ isOnline: boolean }} Current online status
 *
 * @example
 * const { isOnline } = useOnlineStatus()
 *
 * if (!isOnline) return <OfflineBanner />
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  )

  const handleOnline = useCallback(() => setIsOnline(true), [])
  const handleOffline = useCallback(() => setIsOnline(false), [])

  useEffect(() => {
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline }
}
