import { BarChart3, CheckCircle2, Clock, TrendingDown, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import apiService from "../../../service/apiService"

const COLORS = ["#C4654A", "#7A9A6D", "#D4A548", "#6888A0", "#8B70A0", "#C44A4A"]

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [weeklyData, setWeeklyData] = useState(null)
  const [distribution, setDistribution] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, weeklyRes, distRes, projectsRes] = await Promise.all([
          apiService.getAdminStats(),
          apiService.getAdminWeeklyStats(),
          apiService.getAdminTaskDistribution(),
          apiService.getAdminProjectProgress(),
        ])
        setStats(statsRes.data)
        setWeeklyData(weeklyRes.data)
        setDistribution(distRes.data || [])
        setProjects(projectsRes.data || [])
      } catch (err) {
        console.error("Failed to fetch analytics:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const completionRate =
    stats && stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0

  const overdueRate =
    stats && stats.totalTasks > 0 ? Math.round((stats.overdue / stats.totalTasks) * 100) : 0

  // Top projects by task count
  const topProjects = [...(projects || [])]
    .sort((a, b) => (b.totalTasks || 0) - (a.totalTasks || 0))
    .slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-10 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 h-32"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="animate-pulse rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 h-80" />
          <div className="animate-pulse rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 h-80" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
          Analytics
        </h1>
        <p className="text-sm text-light-text-tertiary mt-1">
          Platform-wide insights and performance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-text-tertiary">Completion Rate</p>
              <p className="mt-2 text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
                {completionRate}%
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-success/10 text-accent-success">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs">
            {completionRate >= 50 ? (
              <TrendingUp size={14} className="text-accent-success" />
            ) : (
              <TrendingDown size={14} className="text-accent-danger" />
            )}
            <span className={completionRate >= 50 ? "text-accent-success" : "text-accent-danger"}>
              {completionRate >= 50 ? "Healthy" : "Needs attention"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-text-tertiary">Overdue Rate</p>
              <p className="mt-2 text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
                {overdueRate}%
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-danger/10 text-accent-danger">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs">
            <span className={overdueRate <= 10 ? "text-accent-success" : "text-accent-danger"}>
              {stats?.overdue || 0} overdue tasks
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-text-tertiary">Total Projects</p>
              <p className="mt-2 text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
                {stats?.totalProjects || 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-info/10 text-accent-info">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="mt-3 text-xs text-light-text-tertiary">
            {projects.filter((p) => p.progress === 100).length} completed
          </div>
        </div>

        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-light-text-tertiary">Total Tasks</p>
              <p className="mt-2 text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
                {stats?.totalTasks || 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-warning/10 text-accent-warning">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="mt-3 text-xs text-light-text-tertiary">
            {stats?.inProgress || 0} in progress
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Weekly Trend */}
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-serif">
              Weekly Task Trend
            </h3>
            <p className="text-sm text-light-text-tertiary">
              Task creation vs completion over the last 7 days
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData || []}>
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
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", color: "#6E6358" }}
              />
              <Area
                type="monotone"
                dataKey="created"
                stroke="#C4654A"
                strokeWidth={2}
                fill="#C4654A"
                fillOpacity={0.1}
                name="Created"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#7A9A6D"
                strokeWidth={2}
                fill="#7A9A6D"
                fillOpacity={0.1}
                name="Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-serif">
              Priority Distribution
            </h3>
            <p className="text-sm text-light-text-tertiary">Tasks broken down by priority level</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {distribution.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
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
      </div>

      {/* Status Breakdown Bar Chart */}
      <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-serif">
            Task Status Breakdown
          </h3>
          <p className="text-sm text-light-text-tertiary">
            Distribution of tasks across all statuses
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={[
              {
                name: "To Do",
                value: stats?.todo || 0,
                fill: "#6888A0",
              },
              {
                name: "In Progress",
                value: stats?.inProgress || 0,
                fill: "#D4A548",
              },
              {
                name: "Under Review",
                value: stats?.underReview || 0,
                fill: "#8B70A0",
              },
              {
                name: "Completed",
                value: stats?.completed || 0,
                fill: "#7A9A6D",
              },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E0D5C7" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#6E6358" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: "#6E6358" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(224, 213, 199, 0.2)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E0D5C7",
                backgroundColor: "#F5EDE3",
                color: "#2C2420",
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {(distribution || []).map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.fill || COLORS[(distribution || []).indexOf(entry) % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Projects */}
      <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary font-serif">
            Top Projects by Task Count
          </h3>
          <p className="text-sm text-light-text-tertiary">
            Most active projects across the platform
          </p>
        </div>
        <div className="space-y-4">
          {topProjects.length === 0 && (
            <p className="text-center text-sm text-light-text-tertiary py-8">No projects found</p>
          )}
          {topProjects.map((project, index) => {
            const projectColors = [
              "bg-accent-primary",
              "bg-accent-info",
              "bg-accent-success",
              "bg-accent-warning",
              "bg-accent-danger",
            ]
            const colorClass = projectColors[index % projectColors.length]
            return (
              <div key={project._id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      {project.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-light-text-tertiary">
                      {project.totalTasks} tasks
                    </span>
                    <span className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                      {project.progress}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
                  <div
                    className={`h-full rounded-full ${colorClass} transition-all duration-700`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
