const Submission = require("../models/Submission");
const Task = require("../models/Task");

const createSubmission = async (req, res) => {
  try {
    const { task, content, attachments } = req.body;

    // Check if task exists
    const existingTask = await Task.findById(task);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      task,
      intern: req.user._id,
    });
    if (existingSubmission) {
      return res
        .status(400)
        .json({ message: "Already submitted for this task" });
    }

    const submission = await Submission.create({
      task,
      intern: req.user._id,
      content,
      attachments: attachments || [],
    });

    // Update task status
    existingTask.status = "submitted";
    await existingTask.save();

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("task", "title description deadline")
      .populate("intern", "name email");

    res.status(201).json(populatedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubmissions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "intern") {
      query.intern = req.user._id;
    }

    const submissions = await Submission.find(query)
      .populate("task", "title description deadline status")
      .populate("intern", "name email department")
      .populate("feedback.givenBy", "name")
      .sort("-submittedAt");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("task", "title description deadline")
      .populate("intern", "name email")
      .populate("feedback.givenBy", "name");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Check access
    if (
      req.user.role === "intern" &&
      submission.intern._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reviewSubmission = async (req, res) => {
  try {
    const { feedback, score, status } = req.body;
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.feedback = {
      text: feedback,
      givenBy: req.user._id,
      givenAt: new Date(),
    };

    if (score !== undefined) submission.score = score;
    if (status) submission.status = status;

    await submission.save();

    // Update task status based on review
    const task = await Task.findById(submission.task);
    if (status === "approved") {
      task.status = "approved";
    } else if (status === "rejected") {
      task.status = "rejected";
    }
    await task.save();

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  reviewSubmission,
};
