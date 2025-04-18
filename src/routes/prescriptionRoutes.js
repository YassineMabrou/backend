const express = require("express");
const Prescription = require("../models/Prescription");
const router = express.Router();

// Create prescription
router.post("/", async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();
    res.status(201).json(prescription);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all prescriptions
router.get("/", async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send prescription via email (Example)
router.post("/:id/email", async (req, res) => {
  res.json({ message: "Email feature to be implemented" });
});
// routes/prescriptions.js
router.get('/horse/:id', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ horseId: req.params.id });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

module.exports = router;
