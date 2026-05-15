const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  startTask,
} = require("../controllers/task.controller");

const { protect, adminOnly } = require("../middleware/auth");

// GET + CREATE
router.route("/").get(protect, getTasks).post(protect, adminOnly, createTask);

// START TASK (INTERN ACTION)
router.patch("/:id/start", protect, startTask);

// STATS
router.get("/stats", protect, getTaskStats);

// SINGLE TASK
router
  .route("/:id")
  .get(protect, getTaskById)
  .put(protect, adminOnly, updateTask)
  .delete(protect, adminOnly, deleteTask);

module.exports = router;
