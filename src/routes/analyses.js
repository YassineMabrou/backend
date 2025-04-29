const express = require("express");
const multer = require("multer");
const Analysis = require("../models/Analyses");
const router = express.Router();

// 📌 Multer config for file uploads
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
 * ➤ 📌 Get all analyses (optional filters)
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
    res.status(500).json({ error: error.message });
  }
});

/**
 * ➤ 📌 Add a new analysis
 * POST /api/analyses
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.file = `/uploads/${req.file.filename}`;
    }

    const newAnalysis = new Analysis(data);
    await newAnalysis.save();
    res.status(201).json(newAnalysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ➤ 📌 Update an analysis
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
    res.status(500).json({ error: error.message });
  }
});

/**
 * ➤ 📌 Delete an analysis
 * DELETE /api/analyses/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    await Analysis.findByIdAndDelete(req.params.id);
    res.json({ message: "Analyse supprimée" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ➤ 📌 Upload PDF only (lab results etc.)
 * POST /api/analyses/upload
 */
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier n'a été téléchargé." });
  }
  res.json({ fileUrl: `/uploads/${req.file.filename}` });
});

module.exports = router;
