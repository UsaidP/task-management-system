import {
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Clock,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

const iconMap = {
  total: <CheckSquare size={22} />,
  completed: <CheckCircle2 size={22} />,
  inProgress: <Clock size={22} />,
  overdue: <AlertTriangle size={22} />,
}

export default function AdminStatsCards({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 h-32"
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
            ? Math.round((Number.parseInt(card.value) / stats.totalTasks) * 100)
            : 0
        return (
          <div
            key={card.title}
            className="group relative overflow-hidden rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-light-text-tertiary">{card.title}</p>
                <p className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
                  {card.value}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bgLight} ${card.textColor}`}
              >
                {iconMap[card.icon]}
              </div>
            </div>

            <div className="mt-4 h-1 w-full rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
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
