import { useState } from "react"
import { Outlet } from "react-router-dom"
import AdminHeader from "./AdminHeader.jsx"
import AdminSidebar from "./AdminSidebar.jsx"

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: collapsed ? "72px" : "256px" }}
      >
        <AdminHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
