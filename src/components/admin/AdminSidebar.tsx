import { Link, useLocation } from "react-router-dom"
import Logo from "../common/Logo"

interface AdminSidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

const AdminSidebar = ({ isOpen, toggleSidebar }: AdminSidebarProps) => {
  const location = useLocation()

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "fa-solid fa-gauge",
    },
    {
      name: "Courses",
      path: "/admin/courses",
      icon: "fa-solid fa-book",
    },
    {
      name: "Assessments",
      path: "/admin/assessments",
      icon: "fa-solid fa-clipboard-check",
    },
    {
      name: "Learning Paths",
      path: "/admin/learning-paths",
      icon: "fa-solid fa-route",
    },
    {
      name: "Questions",
      path: "/admin/questions",
      icon: "fa-solid fa-question",
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: "fa-solid fa-users",
    },
    {
      name: "Back to Platform",
      path: "/dashboard",
      icon: "fa-solid fa-arrow-left",
    },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-white dark:bg-gray-800 shadow-md transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Logo />
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">Admin</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Close sidebar"
            >
              <i className="fa-solid fa-xmark h-6 w-6"></i>
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-100"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <i className={`${item.icon} mr-3 ${isActive ? "text-primary-600 dark:text-primary-400" : ""}`}></i>
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
