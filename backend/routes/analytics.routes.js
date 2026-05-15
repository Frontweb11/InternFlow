const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getInternPerformance,
} = require("../controllers/analytics.controller");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/performance", protect, adminOnly, getInternPerformance);

module.exports = router;
