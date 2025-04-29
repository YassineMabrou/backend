const express = require("express");
const Qualification = require("../models/Qualification");
const Horse = require("../models/Horse");
const router = express.Router();


// ✅ Generate qualification statistics
router.get(
  "/stats",
  async (req, res) => {
    try {
      const stats = await Qualification.aggregate([
        {
          $match: {
            score: { $ne: null },
            horseId: { $ne: null }
          }
        },
        {
          $group: {
            _id: "$horseId",
            avgScore: { $avg: "$score" },
            count: { $sum: 1 },
            bestScore: { $max: "$score" }
          }
        },
        {
          $lookup: {
            from: "horses",
            localField: "_id",
            foreignField: "_id",
            as: "horseDetails"
          }
        },
        { $unwind: "$horseDetails" },
        {
          $project: {
            horseName: "$horseDetails.name",
            avgScore: 1,
            count: 1,
            bestScore: 1
          }
        },
        { $sort: { avgScore: -1 } }
      ]);

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ✅ Create a qualification
router.post(
  "/",

  async (req, res) => {
    try {
      const qualification = new Qualification(req.body);
      await qualification.save();
      res.status(201).json(qualification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// ✅ Get all qualifications
router.get(
  "/",


  async (req, res) => {
    try {
      const qualifications = await Qualification.find().populate("horseId");
      res.json(qualifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ✅ Get a specific qualification
router.get(
  "/:id",


  async (req, res) => {
    try {
      const qualification = await Qualification.findById(req.params.id).populate("horseId");
      if (!qualification) {
        return res.status(404).json({ message: "Qualification not found" });
      }
      res.json(qualification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ✅ Update a qualification
router.put(
  "/:id",

  async (req, res) => {
    try {
      const qualification = await Qualification.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!qualification) {
        return res.status(404).json({ message: "Qualification not found" });
      }
      res.json(qualification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ✅ Delete a qualification
router.delete(
  "/:id",
  async (req, res) => {
    try {
      const qualification = await Qualification.findByIdAndDelete(req.params.id);
      if (!qualification) {
        return res.status(404).json({ message: "Qualification not found" });
      }
      res.json({ message: "Qualification deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
