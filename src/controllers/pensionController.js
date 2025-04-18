const Pension = require("../models/Pension");
const mongoose = require("mongoose");

// Create a new pension entry
exports.createPension = async (req, res) => {
  try {
    const { horseId, startDate, rate, billingType, status } = req.body;

    const newPension = new Pension({
      horseId,
      startDate,
      rate,
      billingType,
      status,
    });

    await newPension.save();
    res.status(201).json(newPension);  // Respond with the created pension
  } catch (error) {
    res.status(500).json({ message: error.message });  // Handle errors
  }
};

// Get all pensions (with horse name populated)
exports.getPensions = async (req, res) => {
  try {
    const { horse } = req.query;

    let query = {};
    if (horse) {
      const isHorseId = mongoose.Types.ObjectId.isValid(horse);
      
      if (isHorseId) {
        query = { horseId: horse };  // Search by horseId
      } else {
        query = { "horseId.name": { $regex: horse, $options: "i" } };  // Search by horse name (case insensitive)
      }
    }

    const pensions = await Pension.find(query)
      .populate("horseId", "name")  // Populate horse name field
      .exec();

    res.json(pensions);  // Respond with the list of pensions
  } catch (error) {
    res.status(500).json({ message: error.message });  // Handle errors
  }
};

// Get a single pension by ID
exports.getPensionById = async (req, res) => {
  try {
    const pension = await Pension.findById(req.params.id)
      .populate("horseId", "name")  // Populate horse name field
      .exec();

    if (!pension) return res.status(404).json({ message: "Pension not found" });

    res.json(pension);  // Respond with the pension details
  } catch (error) {
    res.status(500).json({ message: error.message });  // Handle errors
  }
};

// Update a pension
exports.updatePension = async (req, res) => {
  try {
    const updatedPension = await Pension.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("horseId", "name")  // Populate horse name field after update
      .exec();

    if (!updatedPension) return res.status(404).json({ message: "Pension not found" });

    res.json(updatedPension);  // Respond with the updated pension
  } catch (error) {
    res.status(500).json({ message: error.message });  // Handle errors
  }
};

// Delete a pension
exports.deletePension = async (req, res) => {
  try {
    const pension = await Pension.findByIdAndDelete(req.params.id);

    if (!pension) return res.status(404).json({ message: "Pension not found" });

    res.json({ message: "Pension deleted successfully" });  // Respond with success message
  } catch (error) {
    res.status(500).json({ message: error.message });  // Handle errors
  }
};
