const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// CORS headers (optional if already handled globally)
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// 🧍 User routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// 👑 Admin routes
router.post("/admin/register", authController.registerAdmin);
router.post("/admin/login", authController.loginAdmin);

module.exports = router;
