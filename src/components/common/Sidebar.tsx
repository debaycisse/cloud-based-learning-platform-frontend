import { Link, useLocation } from "react-router-dom"
import Logo from "./Logo"

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation()

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "fa-solid fa-home",
    },
    {
      name: "Courses",
      path: "/courses",
      icon: "fa-solid fa-book",
    },
    {
      name: "My Courses",
      path: "/my-courses",
      icon: "fa-solid fa-bookmark",
    },
    {
      name: "Progress",
      path: "/progress",
      icon: "fa-solid fa-chart-line",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: "fa-solid fa-user",
    },
    {
      name: "Support",
      path: "/support",
      icon: "fa-solid fa-circle-question",
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
            <Logo />
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

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>© {new Date().getFullYear()} LearnHub</p>
                <p>All rights reserved</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
