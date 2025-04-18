const express = require("express");
const Category = require("../models/category"); // ✅ Ensure correct import
const Horse = require("../models/Horse");
const Note = require("../models/Note");

const router = express.Router();

// ✅ Create a Category (Horse or Note)
router.post("/", async (req, res) => {
  try {
    const { name, type, criteria } = req.body;
    if (!["horse", "note"].includes(type)) {
      return res.status(400).json({ error: "Only horse and note categories are allowed" });
    }
    const category = new Category({ name, type, criteria });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Create a Category for Notes
router.post("/notes", async (req, res) => {
  try {
    const { name, criteria } = req.body;
    const category = new Category({ name, type: "note", criteria });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Get All Categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get a Single Category
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: "Invalid category ID" });
  }
});

// ✅ Update a Category
router.put("/:id", async (req, res) => {
  try {
    const { name, criteria } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, criteria, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: "Invalid category ID or data" });
  }
});

// ✅ Delete a Category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid category ID" });
  }
});

// ✅ Add a Horse to a Category
router.post("/horses", async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    if (!categoryId) return res.status(400).json({ error: "Category ID is required" });

    const horse = new Horse({ name, category: categoryId });
    await horse.save();
    res.status(201).json(horse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Add a Note to a Category
router.post("/notes", async (req, res) => {
  try {
    const { content, horseId } = req.body;
    if (!horseId) return res.status(400).json({ error: "Horse ID is required" });

    const note = new Note({ content, horseId });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
