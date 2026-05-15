const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const { protect, adminOnly } = require("../middleware/auth");

router
  .route("/")
  .get(protect, adminOnly, getUsers)
  .post(protect, adminOnly, createUser);

router
  .route("/:id")
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

module.exports = router;
