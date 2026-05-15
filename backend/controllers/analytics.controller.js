const Task = require("../models/Task");
const Submission = require("../models/Submission");
const User = require("../models/User");

const getDashboardStats = async (req, res) => {
  try {
    const totalInterns = await User.countDocuments({
      role: "intern",
      isActive: true,
    });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "approved" });
    const pendingSubmissions = await Submission.countDocuments({
      status: "pending",
    });

    const tasksByStatus = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const recentTasks = await Task.find()
      .populate("assignedIntern", "name")
      .sort("-createdAt")
      .limit(5);

    res.json({
      totalInterns,
      totalTasks,
      completedTasks,
      pendingSubmissions,
      completionRate:
        totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
      tasksByStatus,
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInternPerformance = async (req, res) => {
  try {
    const interns = await User.find({ role: "intern", isActive: true }).select(
      "name email department",
    );

    const performance = await Promise.all(
      interns.map(async (intern) => {
        const tasks = await Task.find({ assignedIntern: intern._id });
        const submissions = await Submission.find({ intern: intern._id });

        const completedTasks = tasks.filter(
          (t) => t.status === "approved",
        ).length;
        const averageScore =
          submissions.reduce((sum, s) => sum + (s.score || 0), 0) /
          (submissions.length || 1);

        return {
          intern: {
            id: intern._id,
            name: intern.name,
            email: intern.email,
            department: intern.department,
          },
          totalTasks: tasks.length,
          completedTasks,
          submissions: submissions.length,
          averageScore: averageScore.toFixed(2),
          completionRate:
            tasks.length > 0
              ? ((completedTasks / tasks.length) * 100).toFixed(2)
              : 0,
        };
      }),
    );

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getInternPerformance };
