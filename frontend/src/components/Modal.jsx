import { XIcon as X } from "@animateicons/react/lucide"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useId, useRef } from "react"

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)
  const modalTitleId = useId()

  const sizeClasses = {
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-5xl",
    xl: "max-w-7xl",
  }

  useEffect(() => {
    if (isOpen) {
      // Store the element that was focused before the modal opened
      previousFocusRef.current = document.activeElement
      // Focus the modal container
      modalRef.current?.focus()
      // Trap focus within the modal
      const handleTabKey = (event) => {
        if (event.key !== "Tab" || !modalRef.current) return
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
      document.addEventListener("keydown", handleTabKey)
      return () => document.removeEventListener("keydown", handleTabKey)
    }
    // Restore focus when modal closes
    if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    } else {
      document.removeEventListener("keydown", handleEscape)
    }
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-utility-overlay/80 dark:bg-utility-overlay-dark/80 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative bg-bg-canvas rounded-2xl shadow-[0_12px_32px_rgba(44,36,32,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)] w-full ${sizeClasses[size] || sizeClasses.md} m-4 outline-none ring-1 ring-light-border/30 dark:ring-dark-border/30`}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 id={modalTitleId} className="text-xl font-bold text-text-primary">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-bg-hover focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              >
                <X className="w-5 h-5 text-text-secondary" aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
