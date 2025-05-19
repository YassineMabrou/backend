const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

// ✅ GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
});

// ✅ NEW: GET a user by ID (needed for permissions editor)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
});

// ✅ UPDATE user (permissions or profile)
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
});

// ✅ DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
});

// Backend Route to Get User and Permissions by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password"); // Exclude password from the response
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user); // Send user data including permissions
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
});

module.exports = router;
