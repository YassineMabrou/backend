const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddlewares");
const authorizeRoles = require("../middlewares/roleMiddleware");

// Route accessible only by admin
router.get(
  "/admin",
  verifyToken, // Verify token first
  authorizeRoles("admin"), // Check for admin role
  (req, res) => {
    res.status(200).json({ message: "Welcome Admin!" });
  }
);

// Route accessible only by user
router.get(
  "/user",
  verifyToken, // Verify token first
  authorizeRoles("user"), // Check for user role
  (req, res) => {
    res.status(200).json({ message: "Welcome User!" });
  }
);

module.exports = router;
