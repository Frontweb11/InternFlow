const express = require("express");
const router = express.Router();
const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  reviewSubmission,
} = require("../controllers/submission.controller");
const { protect, adminOnly } = require("../middleware/auth");

router.route("/").get(protect, getSubmissions).post(protect, createSubmission);

router
  .route("/:id")
  .get(protect, getSubmissionById)
  .put(protect, adminOnly, reviewSubmission);

module.exports = router;
