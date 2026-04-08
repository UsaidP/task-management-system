import { Outlet } from "react-router-dom"
import AdminHeader from "./AdminHeader"
import AdminSidebar from "./AdminSidebar"

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
      <AdminSidebar />
      <div className="ml-64">
        <AdminHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
