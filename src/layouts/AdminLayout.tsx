import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import AdminNavbar from "../components/admin/AdminNavbar"
import AdminSidebar from "../components/admin/AdminSidebar"
import Footer from "../components/common/Footer"

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const toggleSidebar = () => {
    console.log(`Toggling sidebar... current value ${sidebarOpen}`)
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full md:ml-64 transition-all duration-300">
        <AdminNavbar toggleSidebar={toggleSidebar} user={user} onLogout={logout} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default AdminLayout
