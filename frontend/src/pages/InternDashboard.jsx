// src/pages/InternDashboard.jsx
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { taskAPI, submissionAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
const InternDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    averageScore: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, submissionsRes] = await Promise.all([
        taskAPI.getAll(),
        submissionAPI.getAll(),
      ]);

      const tasks = tasksRes.data;
      const submissions = submissionsRes.data;

      // Calculate stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(
        (t) => t.status === "approved",
      ).length;
      const pendingTasks = tasks.filter((t) => t.status === "pending").length;
      const inProgressTasks = tasks.filter(
        (t) => t.status === "in-progress",
      ).length;

      const avgScore =
        submissions.reduce((acc, s) => acc + (s.score || 0), 0) /
        (submissions.length || 1);

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        averageScore: avgScore.toFixed(2),
      });

      // Get recent tasks (last 5)
      setRecentTasks(tasks.slice(0, 5));

      // Get recent submissions (last 5)
      setRecentSubmissions(submissions.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "in-progress":
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDeadlineStatus = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return "Overdue";
    if (daysLeft === 0) return "Due today";
    if (daysLeft <= 3) return "Coming soon";
    return `${daysLeft} days left`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="mt-2 opacity-90">
            Track your progress and stay on top of your tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold mt-1">{stats.totalTasks}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {stats.completedTasks}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In Progress</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">
                  {stats.inProgressTasks}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Average Score</p>
                <p className="text-2xl font-bold mt-1 text-purple-600">
                  {stats.averageScore}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task._id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(task.status)}
                      <h3 className="font-semibold">{task.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {task.description}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        Priority:{" "}
                        <span
                          className={`font-medium ${
                            task.priority === "high"
                              ? "text-red-600"
                              : task.priority === "medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </span>
                      <span>Deadline: {getDeadlineStatus(task.deadline)}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      task.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : task.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : task.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
            {recentTasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No tasks assigned yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <div key={submission._id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{submission.task?.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {submission.content.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted:{" "}
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {submission.score ? (
                      <div className="text-lg font-bold text-green-600">
                        {submission.score}%
                      </div>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Pending Review
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {recentSubmissions.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No submissions yet
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InternDashboard;
