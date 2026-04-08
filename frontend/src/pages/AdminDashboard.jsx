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
      <AdminStatsCards stats={stats} loading={loading} />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AdminAreaChart weeklyData={weeklyData} loading={loading} />
        </div>
        <div>
          <AdminPieChart distribution={distribution} loading={loading} />
        </div>
      </div>

      <div className="mt-6">
        <AdminRecentTasks tasks={recentTasks.slice(0, 8)} loading={loading} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AdminTeamMembers users={users.slice(0, 6)} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <AdminActivityFeed tasks={recentTasks.slice(0, 7)} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <AdminProjectProgress projects={projects.slice(0, 5)} loading={loading} />
        </div>
      </div>
    </div>
  )
}
