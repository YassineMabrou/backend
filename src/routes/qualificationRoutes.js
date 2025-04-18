const express = require("express");
const Qualification = require("../models/Qualification");
const Horse = require("../models/Horse");
const router = express.Router();

// Generate score statistics (ensure this is before any other route that uses :id)
router.get("/stats", async (req, res) => {
  try {
    console.log("Fetching statistics...");

    // Aggregate the qualifications to get statistics per horseId
    const stats = await Qualification.aggregate([
      {
        $match: {
          score: { $ne: null }, // Ensure score is valid
          horseId: { $ne: null } // Ensure horseId is valid
        }
      },
      {
        $group: {
          _id: "$horseId", // Group by horseId (horse reference)
          avgScore: { $avg: "$score" }, // Calculate average score for each horse
          count: { $sum: 1 }, // Count the number of qualifications for each horse
          bestScore: { $max: "$score" } // Find the best score (highest score) for each horse
        }
      },
      {
        $lookup: {
          from: "horses", // Collection name of Horse model
          localField: "_id", // Field from Qualification model (horseId)
          foreignField: "_id", // Field from Horse model (horse's ObjectId)
          as: "horseDetails" // Alias for populated data
        }
      },
      {
        $unwind: "$horseDetails" // Flatten the array of horse details (it will be an array with one element)
      },
      {
        $project: {
          horseName: "$horseDetails.name", // Extract the horse name
          avgScore: 1,
          count: 1,
          bestScore: 1
        }
      },
      { $sort: { avgScore: -1 } } // Optionally sort by average score in descending order
    ]);

    console.log("Generated Stats:", stats);
    res.json(stats); // Send populated stats to frontend
  } catch (error) {
    console.error("Error generating stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add a qualification
router.post("/", async (req, res) => {
  try {
    const qualification = new Qualification(req.body);
    await qualification.save();
    res.status(201).json(qualification);
  } catch (error) {
    console.error("Error adding qualification:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all qualifications
router.get("/", async (req, res) => {
  try {
    const qualifications = await Qualification.find().populate("horseId");
    res.json(qualifications);
  } catch (error) {
    console.error("Error fetching qualifications:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific qualification by ID
router.get("/:id", async (req, res) => {
  try {
    const qualification = await Qualification.findById(req.params.id).populate("horseId");
    if (!qualification) {
      return res.status(404).json({ message: "Qualification not found" });
    }
    res.json(qualification);
  } catch (error) {
    console.error("Error fetching qualification:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a qualification
router.put("/:id", async (req, res) => {
  try {
    const qualification = await Qualification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!qualification) {
      return res.status(404).json({ message: "Qualification not found" });
    }
    res.json(qualification);
  } catch (error) {
    console.error("Error updating qualification:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a qualification
router.delete("/:id", async (req, res) => {
  try {
    const qualification = await Qualification.findByIdAndDelete(req.params.id);
    if (!qualification) {
      return res.status(404).json({ message: "Qualification not found" });
    }
    res.json({ message: "Qualification deleted successfully" });
  } catch (error) {
    console.error("Error deleting qualification:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
