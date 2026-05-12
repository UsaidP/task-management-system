import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import apiService from "../../service/apiService"
import AdminActivityFeed from "../components/admin/AdminActivityFeed"
import { AdminAreaChart, AdminPieChart } from "../components/admin/AdminCharts"
import AdminProjectProgress from "../components/admin/AdminProjectProgress"
import AdminRecentTasks from "../components/admin/AdminRecentTasks"
import AdminTeamMembers from "../components/admin/AdminTeamMembers"
import AdminStatsCards from "../components/admin/StatsCards"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [weeklyData, setWeeklyData] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [distribution, setDistribution] = useState([])
  const [loading, setLoading] = useState(true)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, weeklyRes, tasksRes, usersRes, projectsRes, distRes] = await Promise.all([
          apiService.getAdminStats(),
          apiService.getAdminWeeklyStats(),
          apiService.getAdminRecentTasks(),
          apiService.getAdminAllUsers(),
          apiService.getAdminProjectProgress(),
          apiService.getAdminTaskDistribution(),
        ])
        setStats(statsRes.data)
        setWeeklyData(weeklyRes.data)
        setRecentTasks(tasksRes.data || [])
        setUsers(usersRes.data || [])
        setProjects(projectsRes.data || [])
        setDistribution(distRes.data || [])
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-serif text-2xl font-bold tracking-tight text-text-primary">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Platform-wide overview and management</p>
      </motion.div>

      <AdminStatsCards stats={stats} loading={loading} />

      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 gap-6 mt-6 xl:grid-cols-3"
      >
        <div className="xl:col-span-2">
          <AdminAreaChart weeklyData={weeklyData} loading={loading} />
        </div>
        <div>
          <AdminPieChart distribution={distribution} loading={loading} />
        </div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6"
      >
        <AdminRecentTasks tasks={recentTasks.slice(0, 8)} loading={loading} />
      </motion.div>

      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-1">
          <AdminTeamMembers users={users.slice(0, 6)} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <AdminActivityFeed tasks={recentTasks.slice(0, 7)} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <AdminProjectProgress projects={projects.slice(0, 5)} loading={loading} />
        </div>
      </motion.div>
    </div>
  )
}
