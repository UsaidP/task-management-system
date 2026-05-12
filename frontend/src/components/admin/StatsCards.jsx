import { CircleCheckIcon, TriangleAlertIcon } from "@animateicons/react/lucide"
import { ClockIcon, SquareCheckIcon } from "lucide-react"

const iconMap = {
  total: <SquareCheckIcon size={22} />,
  completed: <CircleCheckIcon size={22} />,
  inProgress: <ClockIcon size={22} />,
  overdue: <TriangleAlertIcon size={22} />,
}

export default function AdminStatsCards({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 p-5 border animate-pulse rounded-2xl border-border bg-bg-surface"
          />
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Total Tasks",
      value: String(stats.totalTasks || 0),
      icon: "total",
      bgLight: "bg-accent-info/10",
      textColor: "text-accent-info",
      color: "from-accent-info to-accent-info-dark",
    },
    {
      title: "Completed",
      value: String(stats.completed || 0),
      icon: "completed",
      bgLight: "bg-accent-success/10",
      textColor: "text-accent-success",
      color: "from-accent-success to-accent-success-dark",
    },
    {
      title: "In Progress",
      value: String(stats.inProgress || 0),
      icon: "inProgress",
      bgLight: "bg-accent-warning/10",
      textColor: "text-accent-warning",
      color: "from-accent-warning to-accent-warning-dark",
    },
    {
      title: "Overdue",
      value: String(stats.overdue || 0),
      icon: "overdue",
      bgLight: "bg-accent-danger/10",
      textColor: "text-accent-danger",
      color: "from-accent-danger to-accent-danger-dark",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const pct =
          stats.totalTasks > 0
            ? Math.round((Number.parseInt(card.value, 10) / stats.totalTasks) * 100)
            : 0
        return (
          <div
            key={card.title}
            className="relative p-5 overflow-hidden transition-all duration-300 border shadow-sm group rounded-2xl border-border bg-bg-surface hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-text-muted">{card.title}</p>
                <p className="font-serif text-3xl font-bold text-text-primary">{card.value}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bgLight} ${card.textColor}`}
              >
                {iconMap[card.icon]}
              </div>
            </div>

            <div className="w-full h-1 mt-4 rounded-full bg-bg-elevated">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${card.color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
