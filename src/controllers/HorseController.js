const Horse = require('../models/Horse');
const csvParser = require('csv-parser');
const fs = require('fs');
const generateSireNumber = require('../utils/sireNumberGenerator');
const generateUELN = require('../utils/uelnGenerator');

// Add a single horse
exports.addSingleHorse = async (req, res) => {
  try {
    const { birthYear, ...rest } = req.body;

    if (!birthYear) {
      return res.status(400).json({ message: 'birthYear is required to generate SIRE number' });
    }

    const sireNumber = await generateSireNumber(birthYear);
    const sireKey = await generateUELN(sireNumber);

    const horse = new Horse({ ...rest, birthYear, sireNumber, sireKey });

    await horse.save();
    res.status(201).json({ message: 'Horse added successfully!', horse });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Failed to add horse', error: error.message });
  }
};

// Add horses from a CSV file
exports.addHorsesFromCSV = async (req, res) => {
  const filePath = req.file.path;

  const rawRows = [];
  const horses = [];

  try {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        rawRows.push(row); // Collect all rows first
      })
      .on('end', async () => {
        try {
          for (const row of rawRows) {
            const { birthYear, ...rest } = row;
            if (!birthYear) continue;

            const sireNumber = await generateSireNumber(Number(birthYear));
            const sireKey = await generateUELN(sireNumber);

            horses.push({ ...rest, birthYear, sireNumber, sireKey });
          }

          await Horse.insertMany(horses);
          res.status(201).json({ message: 'Horses added successfully!' });
        } catch (error) {
          console.error(error);
          res.status(400).json({ message: 'Failed to add horses from CSV', error: error.message });
        } finally {
          fs.unlinkSync(filePath); // Clean up the uploaded file
        }
      });
  } catch (error) {
    res.status(500).json({ message: 'Error processing CSV file', error: error.message });
  }
};

// Get all horses
exports.getAllHorses = async (req, res) => {
  try {
    const horses = await Horse.find();
    res.status(200).json(horses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve horses', error: error.message });
  }
};

// Get a horse by ID
exports.getHorseById = async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);
    if (!horse) {
      return res.status(404).json({ message: 'Horse not found' });
    }
    res.status(200).json(horse);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve horse', error: error.message });
  }
};

// Update a horse by ID
exports.updateHorse = async (req, res) => {
  try {
    const updatedHorse = await Horse.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedHorse) {
      return res.status(404).json({ message: 'Horse not found' });
    }
    res.status(200).json({ message: 'Horse updated successfully!', updatedHorse });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update horse', error: error.message });
  }
};

// Delete a horse by ID
exports.deleteHorse = async (req, res) => {
  try {
    const deletedHorse = await Horse.findByIdAndDelete(req.params.id);
    if (!deletedHorse) {
      return res.status(404).json({ message: 'Horse not found' });
    }
    res.status(200).json({ message: 'Horse deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete horse', error: error.message });
  }
};
