const express = require('express');
const multer = require('multer');
const horseController = require('../controllers/HorseController');
const Horse = require('../models/Horse');
const User = require('../models/userModel');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ✅ Middleware: Extract user from headers or fallback to mock admin (for dev)
router.use((req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (userId && userRole) {
    req.user = {
      id: userId,
      role: userRole,
    };
  } else {
    // 🧪 Development fallback if no user info provided
    req.user = {
      id: "660b7af3dbf2f912b8f1a0f4", // Replace with real MongoDB _id
      role: "admin", // 'admin' or 'user'
    };
  }
  next();
});

// 🐎 Horse Routes

// Add a single horse
router.post(
  '/add',
  HorseController.addSingleHorse
);

// Add horses from CSV
router.post(
  '/add-csv',
  upload.single('file'),
  HorseController.addHorsesFromCSV
);

// Search horses
router.get(
  '/search',
  async (req, res) => {
    try {
      // Search logic
      const { name, coatColor, sireNumber, archived } = req.query;
      let filter = { deletedAt: null };

      if (name) filter.name = { $regex: name, $options: "i" };
      if (coatColor) filter.coatColor = { $regex: coatColor, $options: "i" };
      if (sireNumber) filter.sireNumber = sireNumber;
      if (archived) filter.archived = archived === "true";

      const horses = await Horse.find(filter);
      res.json(horses);
    } catch (error) {
      console.error("Error in /search route:", error);
      res.status(500).json({ error: "Search failed" });
    }
  }
);

// Archive a horse
router.put(
  '/:id/archive',
  async (req, res) => {
    try {
      const horse = await Horse.findByIdAndUpdate(
        req.params.id,
        { archived: true },
        { new: true }
      );
      if (!horse) return res.status(404).json({ error: "Horse not found" });
      res.json({ message: "Horse archived", horse });
    } catch (error) {
      res.status(500).json({ error: "Archiving failed" });
    }
  }
);

// Soft delete a horse
router.delete(
  '/:id',
  async (req, res) => {
    try {
      const horse = await Horse.findByIdAndUpdate(
        req.params.id,
        { deletedAt: new Date() },
        { new: true }
      );
      if (!horse) return res.status(404).json({ error: "Horse not found" });
      res.json({ message: "Horse deleted (soft delete)", horse });
    } catch (error) {
      res.status(500).json({ error: "Deletion failed" });
    }
  }
);

// Get all horses
router.get(
  '/',
  HorseController.getAllHorses
);

module.exports = router;
