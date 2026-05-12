import { UserIcon as User } from "@animateicons/react/lucide"
import { useState } from "react"

/**
 * Avatar component — displays a user profile image with a refined icon fallback.
 *
 * Sizing:
 *   xs → 20×20  (tight stacked lists, task cards)
 *   sm → 28×28  (sidebar members, activity feeds)
 *   md → 36×36  (dropdowns, panels)
 *   lg → 56×56  (profile sections)
 *   xl → 96×96  (settings / profile page)
 *
 * @param {Object}  props
 * @param {string}  [props.src]          - Image URL. Placeholder URLs (pravatar/placehold) are ignored.
 * @param {string}  [props.alt]          - Accessible label for the image.
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Size variant.
 * @param {string}  [props.className]    - Extra classes applied to the outer wrapper.
 * @param {boolean} [props.showStatus]   - Render an online indicator dot.
 * @param {boolean} [props.isOnline]     - Controls online indicator colour.
 */
const Avatar = ({
  src,
  alt = "User",
  size = "md",
  className = "",
  showStatus = false,
  isOnline = false,
}) => {
  const [imgError, setImgError] = useState(false)

  // Pixel dimensions per size variant
  const sizePx = {
    xs: "w-5 h-5",
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-14 h-14",
    xl: "w-24 h-24",
  }

  // Icon size inside the fallback circle
  const iconPx = {
    xs: "w-2.5 h-2.5",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6",
    xl: "w-10 h-10",
  }

  // Status dot dimensions
  const statusPx = {
    xs: "w-1.5 h-1.5 border",
    sm: "w-2 h-2 border",
    md: "w-2.5 h-2.5 border-2",
    lg: "w-3 h-3 border-2",
    xl: "w-4 h-4 border-2",
  }

  // Ignore URLs that are placeholder services — show icon fallback instead
  const isValidSrc =
    src &&
    !imgError &&
    !src.includes("placehold") &&
    !src.includes("pravatar") &&
    !src.includes("placeholder")

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div
        className={`${sizePx[size] || sizePx.md} rounded-full overflow-hidden flex items-center justify-center bg-bg-elevated ring-1 ring-inset ring-black/5 dark:ring-white/10`}
      >
        {isValidSrc ? (
          // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onError is a native event handler
          <img
            src={src}
            alt={alt}
            className="object-cover w-full h-full"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 dark:from-accent-primary/30 dark:to-accent-primary/15">
            <User className={`${iconPx[size] || iconPx.md} text-primary`} aria-hidden="true" />
          </span>
        )}
      </div>

      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full ${statusPx[size] || statusPx.md} ${isOnline ? "bg-accent-success border-light-bg-primary dark:border-dark-bg-secondary" : "bg-light-border dark:bg-dark-border border-light-bg-primary dark:border-dark-bg-secondary"}`}
          aria-label={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  )
}

export default Avatar
