import { NavLink } from "react-router-dom"

/**
 * TaskFlow logo component — works in light/dark mode at any size.
 *
 * @param {"sm" | "md" | "lg"} size  – sm (header), md (sidebar), lg (landing)
 * @param {boolean} iconOnly         – show only the icon (collapsed sidebar)
 * @param {string}  className        – extra wrapper classes
 * @param {string}  to               – optional NavLink destination
 */
const Logo = ({ size = "md", iconOnly = false, className = "", to }) => {
  const sizes = {
    sm: { icon: 28, text: "text-lg", gap: "gap-2" },
    md: { icon: 32, text: "text-xl", gap: "gap-2.5" },
    lg: { icon: 40, text: "text-2xl", gap: "gap-3" },
  }

  const s = sizes[size] || sizes.md

  const content = (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Icon — checkmark badge */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        {/* Rounded square background */}
        <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
        {/* Checkmark */}
        <path
          d="M12 21L17.5 26.5L28 14"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#E8553A" />
            <stop offset="50%" stopColor="#D4662F" />
            <stop offset="100%" stopColor="#5A8F4A" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      {!iconOnly && (
        <span className={`${s.text} font-extrabold tracking-tight select-none whitespace-nowrap`}>
          <span className="text-light-text-primary dark:text-dark-text-primary">Task</span>
          <span className="text-accent-primary">flow</span>
        </span>
      )}
    </div>
  )

  if (to) {
    return (
      <NavLink
        to={to}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 rounded-lg"
      >
        {content}
      </NavLink>
    )
  }

  return content
}

export default Logo
