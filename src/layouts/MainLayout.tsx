import { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";


const MainLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full md:ml-64 transition-all duration-300">
        <Navbar toggleSidebar={toggleSidebar} user={user} onLogout={logout} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet /> {/* Render children passed to the layout */}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
