import { AnimatePresence, motion } from "framer-motion"
import { WifiOffIcon as WifiOff } from "@animateicons/react/lucide"
import { useOnlineStatus } from "../hooks/useOnlineStatus"

/**
 * Displays a banner at the top of the screen when the user is offline.
 * Automatically appears/disappears based on network status.
 */
export const OfflineBanner = () => {
  const { isOnline } = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden bg-orange-500 text-white dark:bg-orange-600"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium">
            <WifiOff className="h-4 w-4" />
            <span>You're offline. Some features may not be available.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
