const express = require("express");
const multer = require("multer");
const Analysis = require("../models/Analyses");
const router = express.Router();

// 📦 Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

/**
 * ➤ Get all analyses with optional filters
 * GET /api/analyses
 */
router.get("/", async (req, res) => {
  try {
    const { horse, act } = req.query;
    const filter = {};
    if (horse) filter.horse = horse;
    if (act) filter.act = act;

    const analyses = await Analysis.find(filter).populate("horse act");
    res.json(analyses);
  } catch (error) {
    console.error("❌ Error fetching analyses:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ➤ Add a new analysis
 * POST /api/analyses
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const data = req.body;

    // ✅ If file was uploaded directly via form-data
    if (req.file) {
      data.file = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }
    // ✅ If frontend passed already uploaded file URL
    else if (req.body.file) {
      data.file = req.body.file;
    }

    const newAnalysis = new Analysis(data);
    await newAnalysis.save();
    res.status(201).json(newAnalysis);
  } catch (error) {
    console.error("❌ Error saving analysis:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ➤ Update an analysis
 * PUT /api/analyses/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedAnalysis = await Analysis.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedAnalysis);
  } catch (error) {
    console.error("❌ Error updating analysis:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ➤ Delete an analysis
 * DELETE /api/analyses/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    await Analysis.findByIdAndDelete(req.params.id);
    res.json({ message: "Analysis deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting analysis:", error.message);
    res.status(500).json({ error: error.message });
  }
});
// DELETE /api/analyses/:id
router.delete("/:id", async (req, res) => {
  try {
    await Analysis.findByIdAndDelete(req.params.id);
    res.json({ message: "Analysis deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting analysis:", error.message);
    res.status(500).json({ error: error.message });
  }
});
// 📌 Update an analysis
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedAnalysis = await Analysis.findByIdAndUpdate(id, updatedData, {
      new: true, // return the updated document
    });

    if (!updatedAnalysis) {
      return res.status(404).json({ error: "Analysis not found." });
    }

    res.json(updatedAnalysis);
  } catch (error) {
    console.error("❌ Error updating analysis:", error.message);
    res.status(500).json({ error: "Failed to update analysis." });
  }
});

/**
 * ➤ Upload a file and return its public URL
 * POST /api/analyses/upload
 */
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  console.log("✅ File uploaded successfully:", fileUrl);

  res.json({ fileUrl });
});

module.exports = router;
