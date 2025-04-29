const express = require("express");
const Note = require("../models/Note");
const router = express.Router();

// 🔐 Middlewares


// ✅ Create a new note
router.post(
  "/",

  async (req, res) => {
    try {
      const { horseId, author, content } = req.body;

      if (!horseId || !author || !content) {
        return res.status(400).json({ error: "horseId, author, and content are required." });
      }

      const note = new Note(req.body);
      await note.save();
      res.status(201).json(note);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ✅ Get all notes
router.get(
  "/",

  async (req, res) => {
    try {
      const notes = await Note.find();
      res.json(notes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Get a note by ID
router.get(
  "/:id",
  async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note) return res.status(404).json({ message: "Note not found" });
      res.json(note);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Edit a note
router.put(
  "/:id",

  async (req, res) => {
    try {
      const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!note) return res.status(404).json({ message: "Note not found" });
      res.json(note);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Delete a note
router.delete(
  "/:id",

  async (req, res) => {
    try {
      const note = await Note.findByIdAndDelete(req.params.id);
      if (!note) return res.status(404).json({ message: "Note not found" });
      res.json({ message: "Note deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Get all notes for a specific horse
router.get(
  "/horse/:id",

  async (req, res) => {
    try {
      const notes = await Note.find({ horseId: req.params.id });
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  }
);

module.exports = router;
