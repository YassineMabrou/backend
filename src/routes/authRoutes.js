const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Middleware to set CORS headers
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Allow requests from this origin
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Define routes
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
