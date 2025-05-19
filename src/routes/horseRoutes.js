const express = require('express');
const multer = require('multer');
const HorseController = require('../../controllers/horseController');
const Horse = require('../models/Horse');
const User = require('../models/userModel');
const mongoose = require('mongoose');

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
router.post('/add', HorseController.addSingleHorse);

// Add horses from CSV
router.post('/add-csv', upload.single('file'), HorseController.addHorsesFromCSV);

// ✅ Search for horses
router.get('/search', async (req, res) => {
  try {
    // Log the incoming query parameters for debugging
    console.log("Received search parameters:", req.query);

    const { name, coatColor, sireNumber, sireKey, archived } = req.query;
    let filter = { deletedAt: null }; // Only consider non-deleted horses

    // Validate and apply filters
    if (name) filter.name = { $regex: name, $options: "i" }; // Case-insensitive search for 'name'
    if (coatColor) filter.coatColor = { $regex: coatColor, $options: "i" }; // Case-insensitive search for 'coatColor'

    // Ensure 'sireNumber' and 'sireKey' are passed correctly as strings
    if (sireNumber) {
      if (typeof sireNumber !== 'string') {
        return res.status(400).json({ error: `'sireNumber' must be a string` });
      }
      filter.sireNumber = sireNumber;  // Treat as a string
    }

    if (sireKey) {
      if (typeof sireKey !== 'string') {
        return res.status(400).json({ error: `'sireKey' must be a string` });
      }
      filter.sireKey = sireKey;  // Treat as a string
    }

    // Handle 'archived' as a boolean value (check if it's defined)
    if (archived !== undefined) {
      filter.archived = archived === "true"; // Only process if 'archived' is defined
    }

    // Query the database with the filter
    const horses = await Horse.find(filter);
    res.json(horses); // Return the list of horses based on the filter
  } catch (error) {
    console.error("Error in /search route:", error); // Log the full error stack
    res.status(500).json({ error: `Search failed: ${error.message}` }); // Send a more detailed error message
  }
});

// ✅ Get a horse by ID
router.get("/horses/:id", async (req, res) => {
  try {
    const horseId = req.params.id;

    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(horseId)) {
      return res.status(400).json({ error: "Invalid horse ID format" });
    }

    const horse = await Horse.findById(horseId);
    if (!horse) {
      return res.status(404).json({ error: "Horse not found" });
    }
    res.json(horse); // Return the horse data
  } catch (error) {
    console.error("Error fetching horse:", error); // Log the error stack trace
    res.status(500).json({ error: "Server error" }); // Send a server error response
  }
});

// Archive a horse
router.put('/:id/archive', async (req, res) => {
  try {
    const horse = await Horse.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!horse) return res.status(404).json({ error: "Horse not found" });
    res.json({ message: "Horse archived", horse });
  } catch (error) {
    res.status(500).json({ error: `Archiving failed: ${error.message}` });
  }
});

// Soft delete a horse
router.delete('/:id', async (req, res) => {
  try {
    const horse = await Horse.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
    if (!horse) return res.status(404).json({ error: "Horse not found" });
    res.json({ message: "Horse deleted (soft delete)", horse });
  } catch (error) {
    res.status(500).json({ error: `Deletion failed: ${error.message}` });
  }
});

// Get all horses
router.get('/', HorseController.getAllHorses);

module.exports = router;
