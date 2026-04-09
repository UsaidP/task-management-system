import { useId } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const COLORS = {
  created: "#C4654A",
  completed: "#7A9A6D",
  overdue: "#D46A6A",
}

const PIE_COLORS = ["#C4654A", "#7A9A6D", "#D4A548", "#6888A0", "#8B70A0", "#C44A4A"]

export function AdminAreaChart({ weeklyData, loading }) {
  const uid = useId()
  const gradCreated = `${uid}-created`
  const gradCompleted = `${uid}-completed`

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 h-72" />
    )
  }

  return (
    <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-serif">
            Task Overview
          </h3>
          <p className="text-sm text-light-text-tertiary">Weekly task creation & completion</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS.created }} />
            <span className="text-xs text-light-text-tertiary">Created</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS.completed }}
            />
            <span className="text-xs text-light-text-tertiary">Completed</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={weeklyData || []}>
          <defs>
            <linearGradient id={gradCreated} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.created} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.created} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={gradCompleted} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.completed} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.completed} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0D5C7" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6E6358" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 12, fill: "#6E6358" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #E0D5C7",
              backgroundColor: "#F5EDE3",
              color: "#2C2420",
            }}
          />
          <Area
            type="monotone"
            dataKey="created"
            stroke={COLORS.created}
            strokeWidth={2}
            fill={`url(#${gradCreated})`}
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke={COLORS.completed}
            strokeWidth={2}
            fill={`url(#${gradCompleted})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AdminPieChart({ distribution, loading }) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 h-72" />
    )
  }

  const pieData = (distribution || []).map((item) => ({
    name: item.name,
    value: item.value,
  }))

  return (
    <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-serif">
          Task Distribution
        </h3>
        <p className="text-sm text-light-text-tertiary">By priority</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {pieData.map((entry) => (
              <Cell
                key={entry.name}
                fill={PIE_COLORS[pieData.indexOf(entry) % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #E0D5C7",
              backgroundColor: "#F5EDE3",
              color: "#2C2420",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", color: "#6E6358" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
