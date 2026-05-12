import { BellIcon } from "@animateicons/react/lucide"
import { useAuth } from "../../contexts/customHook.js"
import { capitalizeName } from "../../utils/stringHelpers.js"
import Avatar from "../auth/Avatar"

export default function AdminHeader() {
  const { user } = useAuth()

  let _initials = "A"
  if (user?.fullname) {
    _initials = user.fullname
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-lg font-semibold text-text-primary font-serif">
          Welcome back, {capitalizeName(user?.fullname) || "Admin"}
        </h1>
        <p className="text-xs text-text-muted">
          Here&apos;s what&apos;s happening with your tasks today.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="View notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-muted hover:bg-bg-hover hover:text-light-text-secondary"
        >
          <BellIcon size={18} />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-text-inverse">
            0
          </span>
        </button>

        <div className="flex items-center gap-2.5 ml-2">
          <Avatar
            src={user?.avatar?.url || user?.avatar}
            alt={capitalizeName(user?.fullname) || "Admin"}
            size="sm"
          />
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-text-primary leading-tight">
              {capitalizeName(user?.fullname) || "Admin"}
            </p>
            <p className="text-[11px] text-text-muted leading-tight">
              {user?.email || "admin@taskflow.io"}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
