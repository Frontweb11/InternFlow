import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { analyticsAPI } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, ClipboardList, CheckCircle, Clock } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await analyticsAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        {
          title: "Total Interns",
          value: stats.totalInterns,
          icon: Users,
          color: "bg-blue-500",
        },
        {
          title: "Total Tasks",
          value: stats.totalTasks,
          icon: ClipboardList,
          color: "bg-green-500",
        },
        {
          title: "Completed Tasks",
          value: stats.completedTasks,
          icon: CheckCircle,
          color: "bg-purple-500",
        },
        {
          title: "Pending Submissions",
          value: stats.pendingSubmissions,
          icon: Clock,
          color: "bg-yellow-500",
        },
      ]
    : [];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          Loading dashboard...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tasks by Status</h2>
            <BarChart
              width={400}
              height={300}
              data={stats?.tasksByStatus || []}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Completion Rate</h2>
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {stats?.completionRate}%
              </div>
              <p className="text-gray-600">Overall Task Completion Rate</p>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {stats?.recentTasks.map((task) => (
              <div key={task._id} className="border-b pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-600">
                      Assigned to: {task.assignedIntern?.name}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      task.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : task.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
