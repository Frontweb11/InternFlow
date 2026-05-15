import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import InternDashboard from "./pages/InternDashboard";
import Tasks from "./pages/Tasks";
import Submissions from "./pages/Submissions";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import Analytics from "./pages/Analytics";
import { ClipboardList } from "lucide-react";

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}-dashboard`} />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/intern-dashboard"
        element={
          <PrivateRoute role="intern">
            <InternDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <Tasks />
          </PrivateRoute>
        }
      />

      <Route
        path="/submissions"
        element={
          <PrivateRoute>
            <Submissions />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <PrivateRoute role="admin">
            <AdminUsers />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <PrivateRoute role="admin">
            <Analytics />
          </PrivateRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to={user ? `/${user.role}-dashboard` : "/login"} />}
      />
    </Routes>
  );
}

export default App;
