const express = require('express');
const multer = require('multer');
const HorseController = require('../controllers/horseController');

const Horse = require('../models/Horse'); // ✅ Import your model

const router = express.Router();

// Multer configuration for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Route to add a single horse
router.post('/add', HorseController.addSingleHorse);

// Route to add horses from a CSV file
router.post('/add-csv', upload.single('file'), HorseController.addHorsesFromCSV);

// ✅ FIXED: Search horses (use Horse model instead of undefined 'horses')
router.get('/search', async (req, res) => {
    try {
        const { name, coatColor, sireNumber, archived } = req.query;
        let filter = { deletedAt: null }; // Only fetch non-deleted horses

        if (name) filter.name = { $regex: name, $options: "i" };
        if (coatColor) filter.coatColor = { $regex: coatColor, $options: "i" };
        if (sireNumber) filter.sireNumber = sireNumber;
        if (archived) filter.archived = archived === "true";

        const horses = await Horse.find(filter); // ✅ Corrected this line
        res.json(horses);
    } catch (error) {
        console.error("Error in /search route:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

// ✅ FIXED: Archive horse (use Horse model instead of undefined 'horse')
router.put('/:id/archive', async (req, res) => {
    try {
        const horse = await Horse.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
        if (!horse) return res.status(404).json({ error: "Horse not found" });
        res.json({ message: "Horse archived", horse });
    } catch (error) {
        res.status(500).json({ error: "Archiving failed" });
    }
});

// ✅ FIXED: Soft delete horse (use Horse model instead of undefined 'horse')
router.delete('/:id', async (req, res) => {
    try {
        const horse = await Horse.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
        if (!horse) return res.status(404).json({ error: "Horse not found" });
        res.json({ message: "Horse deleted (soft delete)", horse });
    } catch (error) {
        res.status(500).json({ error: "Deletion failed" });
    }
});
// Route to get all horses
router.get('/', HorseController.getAllHorses); // Link the route to the getAllHorses function



module.exports = router;
