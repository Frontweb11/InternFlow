const Task = require("../models/Task");
const User = require("../models/User");

const createTask = async (req, res) => {
  try {
    const { title, description, assignedIntern, deadline, priority } = req.body;

    // Check if intern exists
    const intern = await User.findById(assignedIntern);
    if (!intern || intern.role !== "intern") {
      return res.status(404).json({ message: "Intern not found" });
    }

    const task = await Task.create({
      title,
      description,
      assignedIntern,
      assignedBy: req.user._id,
      deadline,
      priority: priority || "medium",
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedIntern", "name email")
      .populate("assignedBy", "name");

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "intern") {
      query.assignedIntern = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate("assignedIntern", "name email department")
      .populate("assignedBy", "name")
      .sort("-createdAt");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedIntern", "name email department")
      .populate("assignedBy", "name");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check access
    if (
      req.user.role === "intern" &&
      task.assignedIntern._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updates = ["title", "description", "deadline", "status", "priority"];
    updates.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const startTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ONLY assigned intern can start task
    if (
      req.user.role === "intern" &&
      task.assignedIntern.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not your task" });
    }

    task.status = "in-progress";
    task.startedAt = new Date();

    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getTaskStats = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "intern") {
      query.assignedIntern = req.user._id;
    }

    const tasks = await Task.find(query);

    const stats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      submitted: tasks.filter((t) => t.status === "submitted").length,
      approved: tasks.filter((t) => t.status === "approved").length,
      rejected: tasks.filter((t) => t.status === "rejected").length,
      byPriority: {
        low: tasks.filter((t) => t.priority === "low").length,
        medium: tasks.filter((t) => t.priority === "medium").length,
        high: tasks.filter((t) => t.priority === "high").length,
        urgent: tasks.filter((t) => t.priority === "urgent").length,
      },
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  startTask,
};
