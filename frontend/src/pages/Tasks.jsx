import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { taskAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedIntern: "",
    deadline: "",
    priority: "medium",
  });

  const [interns, setInterns] = useState([]);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchTasks();
    if (isAdmin) fetchInterns();
  }, []);

  // ---------------- FETCH TASKS ----------------
  const fetchTasks = async () => {
    try {
      const res = await taskAPI.getAll();
      setTasks(res.data);
    } catch (err) {
      toast.error("Failed to fetch tasks");
    }
  };

  // ---------------- FETCH INTERNS ----------------
  const fetchInterns = async () => {
    try {
      const res = await userAPI.getAll({ role: "intern" });
      setInterns(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- CREATE / UPDATE TASK ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTask) {
        await taskAPI.update(editingTask._id, formData);
        toast.success("Task updated");
      } else {
        await taskAPI.create(formData);
        toast.success("Task created");
      }

      setShowModal(false);
      setEditingTask(null);
      resetForm();
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    try {
      await taskAPI.delete(id);
      toast.success("Task deleted");
      fetchTasks();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ---------------- START TASK (IMPORTANT FIX) ----------------
  const handleStartTask = async (id) => {
    try {
      await taskAPI.startTask(id);
      toast.success("Task started");
      fetchTasks();
    } catch (err) {
      toast.error("Failed to start task");
    }
  };

  // ---------------- RESET FORM ----------------
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      assignedIntern: "",
      deadline: "",
      priority: "medium",
    });
  };

  // ---------------- COLORS ----------------
  const getPriorityColor = (p) => {
    if (p === "low") return "text-green-600";
    if (p === "medium") return "text-yellow-600";
    if (p === "high") return "text-orange-600";
    return "text-red-600";
  };

  const getStatusColor = (s) => {
    if (s === "pending") return "text-gray-600";
    if (s === "in-progress") return "text-blue-600";
    if (s === "approved") return "text-green-600";
    if (s === "rejected") return "text-red-600";
    return "text-gray-600";
  };

  // ---------------- UI ----------------
  return (
    <Layout>
      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Tasks</h1>

          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              <Plus className="inline w-4 h-4 mr-1" />
              Create Task
            </button>
          )}
        </div>

        {/* TASK LIST */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task._id} className="border p-4 rounded bg-white">
              <h2 className="font-bold text-lg">{task.title}</h2>
              <p className="text-gray-600">{task.description}</p>

              <div className="flex gap-4 mt-2 text-sm">
                <span className={getPriorityColor(task.priority)}>
                  {task.priority}
                </span>

                <span className={getStatusColor(task.status)}>
                  {task.status}
                </span>
              </div>

              <p className="text-sm mt-1">
                Assigned: {task.assignedIntern?.name}
              </p>

              <p className="text-sm">
                Deadline: {new Date(task.deadline).toLocaleDateString()}
              </p>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-3">
                {/* INTERN ACTION */}
                {!isAdmin && task.status === "pending" && (
                  <button
                    onClick={() => handleStartTask(task._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Start Task
                  </button>
                )}

                {/* ADMIN ACTIONS */}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setFormData(task);
                        setShowModal(true);
                      }}
                      className="text-blue-600"
                    >
                      <Edit />
                    </button>

                    <button
                      onClick={() => handleDelete(task._id)}
                      className="text-red-600"
                    >
                      <Trash2 />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-96">
              <h2 className="text-xl font-bold mb-4">
                {editingTask ? "Edit Task" : "Create Task"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border p-2"
                />

                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border p-2"
                />

                {isAdmin && (
                  <>
                    <select
                      value={formData.assignedIntern}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assignedIntern: e.target.value,
                        })
                      }
                      className="w-full border p-2"
                    >
                      <option value="">Select Intern</option>
                      {interns.map((i) => (
                        <option key={i._id} value={i._id}>
                          {i.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value,
                        })
                      }
                      className="w-full border p-2"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </>
                )}

                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full border p-2"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1 border"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tasks;
