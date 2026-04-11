import { Bell } from "lucide-react"
import { useAuth } from "../../contexts/customHook.js"

export default function AdminHeader() {
  const { user } = useAuth()

  let initials = "A"
  if (user?.fullname) {
    initials = user.fullname
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-light-border dark:border-dark-border bg-light-bg-secondary/80 dark:bg-dark-bg-secondary/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary font-serif">
          Welcome back, {user?.fullname || "Admin"}
        </h1>
        <p className="text-xs text-light-text-tertiary">
          Here&apos;s what&apos;s happening with your tasks today.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="View notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-light-text-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:text-light-text-secondary"
        >
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-danger text-[9px] font-bold text-light-text-inverse">
            0
          </span>
        </button>

        <div className="flex items-center gap-2.5 ml-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-primary text-sm font-bold text-light-text-inverse">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary leading-tight">
              {user?.fullname || "Admin"}
            </p>
            <p className="text-[11px] text-light-text-tertiary leading-tight">
              {user?.email || "admin@taskflow.io"}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
