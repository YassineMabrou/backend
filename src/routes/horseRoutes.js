const express = require('express');
const multer = require('multer');
const HorseController = require('../controllers/HorseController');
const Horse = require('../models/Horse');
const User = require('../models/userModel');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Middleware to attach user info (fallback for dev)
router.use((req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  req.user = userId && userRole
    ? { id: userId, role: userRole }
    : { id: "660b7af3dbf2f912b8f1a0f4", role: "admin" };

  next();
});

// Add a single horse
router.post('/add', HorseController.addSingleHorse);

// Add horses from CSV
router.post('/add-csv', upload.single('file'), HorseController.addHorsesFromCSV);

// Search horses
router.get('/search', async (req, res) => {
  try {
    const { name, coatColor, sireNumber, archived } = req.query;
    const filter = { deletedAt: null };

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (coatColor) filter.coatColor = { $regex: coatColor, $options: 'i' };
    if (sireNumber) filter.sireNumber = sireNumber;
    if (archived) filter.archived = archived === 'true';

    const horses = await Horse.find(filter);
    res.json(horses);
  } catch (error) {
    console.error('Error in /search route:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Archive a horse
router.put('/:id/archive', async (req, res) => {
  try {
    const horse = await Horse.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );
    if (!horse) return res.status(404).json({ error: 'Horse not found' });
    res.json({ message: 'Horse archived', horse });
  } catch (error) {
    res.status(500).json({ error: 'Archiving failed' });
  }
});

// Soft delete a horse
router.delete('/:id', async (req, res) => {
  try {
    const horse = await Horse.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!horse) return res.status(404).json({ error: 'Horse not found' });
    res.json({ message: 'Horse deleted (soft delete)', horse });
  } catch (error) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

// Get all horses
router.get('/', HorseController.getAllHorses);

module.exports = router;
