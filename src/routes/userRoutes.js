const express = require("express");
const router = express.Router();
const authorizeRoles = require("../middlewares/roleMiddleware");

// Route accessible only by admin
router.get(
  "/admin",
  authorizeRoles("admin"), // Check for admin role only
  (req, res) => {
    res.status(200).json({ message: "Welcome Admin!" });
  }
);

// Route accessible only by user
router.get(
  "/user",
  authorizeRoles("user"), // Check for user role only
  (req, res) => {
    res.status(200).json({ message: "Welcome User!" });
  }
);

module.exports = router;
