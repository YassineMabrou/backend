const Horse = require('../models/Horse');
const csvParser = require('csv-parser');
const fs = require('fs');

// Add a single horse
exports.addSingleHorse = async (req, res) => {
  try {
    const horse = new Horse(req.body);
    await horse.save();
    res.status(201).json({ message: 'Horse added successfully!', horse });
  } catch (error) {
    res.status(400).json({ message: 'Failed to add horse', error: error.message });
  }
};

// Add horses from a CSV file
exports.addHorsesFromCSV = async (req, res) => {
  const filePath = req.file.path;
  const horses = [];

  try {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        horses.push(row);
      })
      .on('end', async () => {
        try {
          await Horse.insertMany(horses);
          res.status(201).json({ message: 'Horses added successfully!' });
        } catch (error) {
          res.status(400).json({ message: 'Failed to add horses from CSV', error: error.message });
        } finally {
          fs.unlinkSync(filePath);
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
