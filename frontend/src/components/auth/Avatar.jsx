import { FiUser } from "react-icons/fi"

/**
 * Avatar component - displays user profile image or fallback initial
 *
 * @param {Object} props
 * @param {string} [props.src] - Image URL for the avatar
 * @param {string} [props.alt] - Alt text for the avatar image
 * @param {string} [props.name] - Name to derive fallback initial from
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Size variant
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.showStatus=false] - Show online status indicator
 * @param {boolean} [props.isOnline=false] - Whether user is online
 */
const Avatar = ({
  src,
  alt = "User avatar",
  name,
  size = "md",
  className = "",
  showStatus = false,
  isOnline = false,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-2xl",
    xl: "w-32 h-32 text-5xl",
  }

  const statusSizeClasses = {
    sm: "w-3 h-3 border",
    md: "w-3.5 h-3.5 border-2",
    lg: "w-4 h-4 border-2",
    xl: "w-6 h-6 border-4",
  }

  const containerSizeClasses = {
    sm: "relative",
    md: "relative",
    lg: "relative",
    xl: "relative",
  }

  const fallbackInitial = name?.trim().charAt(0).toUpperCase() || "?"

  const hasImage = src && src !== "https://placehold.co/400"

  const handleImageError = (e) => {
    e.target.style.display = "none"
    const fallback = e.target.parentElement?.querySelector(".avatar-fallback")
    if (fallback) {
      fallback.style.display = "flex"
    }
  }

  return (
    <div className={`${containerSizeClasses[size]} inline-block flex-shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-xl overflow-hidden bg-gradient-to-br from-accent-primary via-accent-success to-accent-warning flex items-center justify-center text-light-text-inverse font-bold shadow-md relative`}
      >
        {hasImage ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            width="40"
            height="40"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
        ) : null}
        <div
          className={`avatar-fallback w-full h-full absolute inset-0 ${!hasImage ? "flex" : "hidden"} items-center justify-center`}
        >
          {hasImage ? (
            <FiUser className="w-1/2 h-1/2 text-light-text-inverse opacity-50" />
          ) : (
            <span>{fallbackInitial}</span>
          )}
        </div>
      </div>
      {showStatus && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 rounded-full ${statusSizeClasses[size]} ${
            isOnline ? "bg-accent-success" : "bg-light-border dark:bg-dark-border"
          } ${sizeClasses[size].includes("w-32") ? "border-light-bg-secondary dark:border-dark-bg-tertiary" : "border-light-bg-primary dark:border-dark-bg-primary"}`}
        />
      )}
    </div>
  )
}

export default Avatar
