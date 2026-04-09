import {
  BarChart3,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  LayoutDashboard,
  Users,
  Zap,
} from "lucide-react"
import { NavLink } from "react-router-dom"

const mainNav = [
  { id: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { id: "/admin/tasks", label: "All Tasks", icon: CheckSquare },
  { id: "/admin/projects", label: "Projects", icon: FolderOpen },
  { id: "/admin/team", label: "Team", icon: Users },
  { id: "/admin/analytics", label: "Analytics", icon: BarChart3 },
]

export default function AdminSidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-light-border dark:border-dark-border px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent-primary">
            <Zap className="h-5 w-5 text-light-text-inverse" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-light-text-primary dark:text-dark-text-primary font-serif">
              Taskly
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-light-text-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:text-light-text-secondary cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-light-text-tertiary">
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
