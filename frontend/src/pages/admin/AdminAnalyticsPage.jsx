import {
  CircleCheckIcon,
  FolderOpenIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "@animateicons/react/lucide"
import { motion, useReducedMotion } from "framer-motion"
import { ClockIcon, SquareCheckIcon } from "lucide-react"
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
  const reduceMotion = useReducedMotion()

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
        <div className="w-48 h-10 rounded-xl animate-pulse bg-bg-elevated" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 p-6 border animate-pulse rounded-2xl border-border bg-bg-surface"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="p-6 border animate-pulse h-80 rounded-2xl border-border bg-bg-surface" />
          <div className="p-6 border animate-pulse h-80 rounded-2xl border-border bg-bg-surface" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-serif text-2xl font-bold tracking-tight text-text-primary">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Platform-wide insights and performance metrics
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            icon: <CircleCheckIcon size={20} />,
            iconBg: "bg-accent-success/10 text-accent-success",
            trend: completionRate >= 50,
            trendLabel: completionRate >= 50 ? "Healthy" : "Needs attention",
            delay: 0.05,
          },
          {
            label: "Overdue Rate",
            value: `${overdueRate}%`,
            icon: <ClockIcon size={20} />,
            iconBg: "bg-accent-danger/10 text-accent-danger",
            trend: overdueRate <= 10,
            trendLabel: `${stats?.overdue || 0} overdue tasks`,
            delay: 0.1,
          },
          {
            label: "Total Projects",
            value: stats?.totalProjects || 0,
            icon: <FolderOpenIcon size={20} />,
            iconBg: "bg-accent-info/10 text-accent-info",
            sub: `${projects.filter((p) => p.progress === 100).length} completed`,
            delay: 0.15,
          },
          {
            label: "Total Tasks",
            value: stats?.totalTasks || 0,
            icon: <SquareCheckIcon size={20} />,
            iconBg: "bg-accent-warning/10 text-accent-warning",
            sub: `${stats?.inProgress || 0} in progress`,
            delay: 0.2,
          },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: kpi.delay, ease: [0.16, 1, 0.3, 1] }}
            className="relative p-5 overflow-hidden border shadow-sm rounded-2xl border-border bg-bg-surface interactive-card group"
          >
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-muted">{kpi.label}</p>
                  <p className="mt-2 font-serif text-3xl font-bold tracking-tight text-text-primary">
                    {kpi.value}
                  </p>
                </div>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl ${kpi.iconBg} transition-transform duration-200 group-hover:scale-110`}
                  style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                >
                  {kpi.icon}
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs">
                {kpi.trend !== undefined && (
                  <>
                    {kpi.trend ? (
                      <TrendingUpIcon size={14} className="text-success" />
                    ) : (
                      <TrendingDownIcon size={14} className="text-danger" />
                    )}
                    <span className={kpi.trend ? "text-accent-success" : "text-accent-danger"}>
                      {kpi.trendLabel}
                    </span>
                  </>
                )}
                {kpi.sub && <span className="text-text-muted">{kpi.sub}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 gap-6 xl:grid-cols-2"
      >
        {/* Weekly Trend */}
        <div className="p-6 border shadow-sm rounded-2xl border-border bg-bg-surface">
          <div className="mb-4">
            <h3 className="font-serif text-base font-semibold tracking-tight text-text-primary">
              Weekly Task Trend
            </h3>
            <p className="text-sm text-text-muted">
              Task creation vs completion over the last 7 days
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0D5C7" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6B5D52" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12, fill: "#6B5D52" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #E0D5C7",
                  backgroundColor: "#FAF6F1",
                  color: "#2C2420",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  padding: "12px 16px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", color: "#6B5D52" }}
              />
              <Area
                type="monotone"
                dataKey="created"
                stroke="#C4654A"
                strokeWidth={2.5}
                fill="#C4654A"
                fillOpacity={0.08}
                name="Created"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#7A9A6D"
                strokeWidth={2.5}
                fill="#7A9A6D"
                fillOpacity={0.08}
                name="Completed"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="p-6 border shadow-sm rounded-2xl border-border bg-bg-surface">
          <div className="mb-4">
            <h3 className="font-serif text-base font-semibold tracking-tight text-text-primary">
              Priority Distribution
            </h3>
            <p className="text-sm text-text-muted">Tasks broken down by priority level</p>
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
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #E0D5C7",
                  backgroundColor: "#FAF6F1",
                  color: "#2C2420",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  padding: "12px 16px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", color: "#6B5D52" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Status Breakdown Bar Chart */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="p-6 border shadow-sm rounded-2xl border-border bg-bg-surface"
      >
        <div className="mb-4">
          <h3 className="font-serif text-base font-semibold tracking-tight text-text-primary">
            Task Status Breakdown
          </h3>
          <p className="text-sm text-text-muted">Distribution of tasks across all statuses</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={[
              { name: "To Do", value: stats?.todo || 0, fill: "#6888A0" },
              { name: "In Progress", value: stats?.inProgress || 0, fill: "#D4A548" },
              { name: "Under Review", value: stats?.underReview || 0, fill: "#8B70A0" },
              { name: "Completed", value: stats?.completed || 0, fill: "#7A9A6D" },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E0D5C7" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#6B5D52" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: "#6B5D52" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(196, 101, 74, 0.06)" }}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid #E0D5C7",
                backgroundColor: "#FAF6F1",
                color: "#2C2420",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                padding: "12px 16px",
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
              {[
                { fill: "#6888A0" },
                { fill: "#D4A548" },
                { fill: "#8B70A0" },
                { fill: "#7A9A6D" },
              ].map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Projects */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="p-6 border shadow-sm rounded-2xl border-border bg-bg-surface"
      >
        <div className="mb-4">
          <h3 className="font-serif text-base font-semibold tracking-tight text-text-primary">
            Top Projects by Task Count
          </h3>
          <p className="text-sm text-text-muted">Most active projects across the platform</p>
        </div>
        <div className="space-y-4">
          {topProjects.length === 0 && (
            <p className="py-8 text-sm text-center text-text-muted">No projects found</p>
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
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${colorClass} shadow-sm`} />
                    <span className="text-sm font-medium text-text-primary">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted">{project.totalTasks} tasks</span>
                    <span className="text-sm font-semibold text-text-secondary">
                      {project.progress}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-bg-elevated">
                  <div
                    className={`h-full rounded-full ${colorClass} transition-all duration-700`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
