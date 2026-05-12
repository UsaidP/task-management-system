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
      {/* Icon — pinwheel */}
      <img
        src="/taskflow_icon_pinwheel.svg"
        alt="TaskFlow pinwheel"
        width={s.icon}
        height={s.icon}
        className="flex-shrink-0 object-contain rounded-lg shadow-sm shadow-accent-primary/5"
        aria-hidden="true"
      />

      {/* Wordmark */}
      {!iconOnly && (
        <span className={`${s.text} font-extrabold tracking-tight select-none whitespace-nowrap`}>
          <span className="text-text-primary">Task</span>
          <span className="text-primary">flow</span>
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
