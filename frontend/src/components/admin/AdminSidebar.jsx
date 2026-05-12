import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DashboardIcon,
  FolderOpenIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@animateicons/react/lucide"
import { SquareCheckIcon } from "lucide-react"
import { NavLink } from "react-router-dom"
import Logo from "../common/Logo.jsx"

const mainNav = [
  { id: "/admin", label: "Dashboard", icon: DashboardIcon, end: true },
  { id: "/admin/tasks", label: "All Tasks", icon: SquareCheckIcon },
  { id: "/admin/projects", label: "Projects", icon: FolderOpenIcon },
  { id: "/admin/team", label: "Team", icon: UsersIcon },
  { id: "/admin/analytics", label: "Analytics", icon: TrendingUpIcon },
]

export default function AdminSidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-bg-surface transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <Logo size="md" iconOnly={collapsed} to="/admin" />
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-center flex-shrink-0 rounded-md cursor-pointer h-7 w-7 text-text-muted hover:bg-bg-hover hover:text-light-text-secondary"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Admin Panel
          </div>
        )}
        {mainNav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.id}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-accent-primary/10 text-accent-primary dark:bg-accent-primary/15"
                    : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:text-light-text-primary dark:hover:text-dark-text-primary"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
