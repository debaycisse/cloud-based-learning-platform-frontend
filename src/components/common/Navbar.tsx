import { useState } from "react"
import { Link } from "react-router-dom"
import type { User } from "../../types"
import Logo from "./Logo"
import ThemeToggle from "./ThemeToggle"

interface NavbarProps {
  toggleSidebar: () => void
  user: User | null
  onLogout: () => void
}

const Navbar = ({ toggleSidebar, user, onLogout }: NavbarProps) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen)
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
          >
            <i className="fa-solid fa-bars h-6 w-6"></i>
          </button>
          <Logo className="ml-2" />
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          <div className="relative">
            <button
              onClick={toggleProfileMenu}
              className="flex items-center space-x-2 focus:outline-none"
              aria-label="Open user menu"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.username}
              </span>
              <i
                className={`fa-solid fa-chevron-down text-gray-500 dark:text-gray-400 text-xs transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`}
              ></i>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <i className="fa-solid fa-user mr-2"></i>
                  Profile
                </Link>
                <Link
                  to="/progress"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <i className="fa-solid fa-chart-line mr-2"></i>
                  My Progress
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <i className="fa-solid fa-screwdriver-wrench mr-2"></i>
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    onLogout()
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <i className="fa-solid fa-right-from-bracket mr-2"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
