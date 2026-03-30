import { motion } from "framer-motion"

export const Skeleton = ({ className = "", variant = "primary" }) => {
  const base =
    variant === "secondary"
      ? "bg-light-bg-hover dark:bg-dark-bg-hover"
      : "bg-light-bg-tertiary dark:bg-dark-bg-tertiary"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${base} animate-pulse rounded-md ${className}`}
    />
  )
}

export const SkeletonText = ({ width = "w-32", height = "h-4", className = "" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className={`bg-light-bg-tertiary dark:bg-dark-bg-tertiary animate-pulse rounded-md ${width} ${height} ${className}`}
  />
)

export const SkeletonCircle = ({ size = "w-12 h-12", className = "" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className={`bg-light-bg-tertiary dark:bg-dark-bg-tertiary animate-pulse rounded-full ${size} ${className}`}
  />
)

export const SkeletonCard = ({ className = "", children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className={`bg-light-bg-tertiary dark:bg-dark-bg-tertiary animate-pulse rounded-xl ${className}`}
  >
    {children}
  </motion.div>
)

export const HeaderSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="flex animate-pulse items-center justify-between"
  >
    <div>
      <div className="mb-3 h-10 w-64 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover" />
      <div className="h-6 w-80 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover" />
    </div>
    <div className="hidden h-6 w-48 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover md:block" />
  </motion.div>
)

export default Skeleton
