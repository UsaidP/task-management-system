import { motion } from "framer-motion"

const PlaceholderView = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center p-12 bg-light-bg-secondary dark:bg-dark-bg-tertiary rounded-2xl border border-light-border dark:border-dark-border border-dashed max-w-lg w-full"
      >
        <h2 className="text-2xl font-serif text-light-text-primary dark:text-dark-text-primary mb-4">
          {title}
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
          This view is currently under construction. Phase 4 will fully implement this feature.
        </p>
        <div className="w-16 h-1 bg-accent-primary mx-auto rounded-full opacity-50" />
      </motion.div>
    </div>
  )
}

export default PlaceholderView
