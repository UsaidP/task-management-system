import {
  DashboardIcon,
  GlobeIcon,
  LayoutGridIcon,
  MoonIcon,
  TriangleAlertIcon,
  UsersIcon,
  ZapIcon,
} from "@animateicons/react/lucide"
import { BriefcaseIcon, CalendarIcon, ListIcon, TargetIcon } from "lucide-react"

const ICON_MAP = {
  FiLayout: DashboardIcon,
  FiTrello: LayoutGridIcon,
  FiCalendar: CalendarIcon,
  FiList: ListIcon,
  FiUsers: UsersIcon,
  FiMoon: MoonIcon,
  FiZap: ZapIcon,
  FiBriefcase: BriefcaseIcon,
  FiTarget: TargetIcon,
  FiGlobe: GlobeIcon,
}

/**
 * A dynamic icon component that renders an icon based on a string name.
 * This prevents having to import every single icon into our main page.
 *
 * @param {object} props
 * @param {string} props.name - The name of the Icon to render (e.g., "FiTrello").
 */
export const Icon = ({ name, ...props }) => {
  const LucideIcon = ICON_MAP[name]

  // If the icon name is invalid, render a fallback icon to indicate an error.
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found. Rendering a fallback.`)
    return <TriangleAlertIcon {...props} />
  }

  return <LucideIcon {...props} />
}
