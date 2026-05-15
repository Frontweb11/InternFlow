import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  User,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = isAdmin
    ? [
        { path: "/admin-dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/tasks", icon: ClipboardList, label: "Tasks" },
        { path: "/submissions", icon: FileText, label: "Submissions" },
        { path: "/admin/users", icon: Users, label: "Manage Users" },
        { path: "/admin/analytics", icon: BarChart3, label: "Analytics" },
        { path: "/profile", icon: User, label: "Profile" },
      ]
    : [
        {
          path: "/intern-dashboard",
          icon: LayoutDashboard,
          label: "Dashboard",
        },
        { path: "/tasks", icon: ClipboardList, label: "My Tasks" },
        { path: "/submissions", icon: FileText, label: "My Submissions" },
        { path: "/profile", icon: User, label: "Profile" },
      ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">InternFlow</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome, {user?.name}</p>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
