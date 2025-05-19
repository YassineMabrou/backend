const express = require("express");
const mongoose = require("mongoose");  // Ensure mongoose is imported
const Category = require("../models/category");
const Horse = require("../models/Horse");
const Note = require("../models/Note");

const router = express.Router();

// ✅ Create a Category
router.post("/", async (req, res) => {
  try {
    const { name, type, criteria = {}, isPublic = false, parentCategory = null } = req.body;

    if (!name || !name.fr || !name.en) {
      return res.status(400).json({ error: "Both French and English names are required." });
    }

    if (!["horse", "note"].includes(type)) {
      return res.status(400).json({ error: "Only 'horse' and 'note' types are allowed." });
    }

    const category = new Category({
      name,
      type,
      criteria,
      isPublic,
      parentCategory: parentCategory || null,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Get all categories (with parent name populated)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().populate("parentCategory", "name");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🐎 Get the horse name by ID
router.get('/horse-name/:id', async (req, res) => {
  try {
    const horseId = req.params.id;

    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(horseId)) {
      return res.status(400).json({ error: 'Invalid horse ID format' });
    }

    // Fetch the horse by ID
    const horse = await Horse.findById(horseId).select('name'); // Select only the 'name' field
    if (!horse) {
      return res.status(404).json({ error: 'Horse not found' });
    }

    // Return only the horse's name
    res.json({ name: horse.name });
  } catch (error) {
    console.error("Error fetching horse name:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Update a category
router.put("/:id", async (req, res) => {
  try {
    const { name, criteria = {}, isPublic = false, parentCategory = null } = req.body;

    if (!name || !name.fr || !name.en) {
      return res.status(400).json({ error: "Both French and English names are required." });
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        criteria,
        isPublic,
        parentCategory: parentCategory || null,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Category not found" });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Invalid category ID or data" });
  }
});

// ✅ Delete a category
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid category ID" });
  }
});

// ✅ Assign horse to category
router.post("/add-horse", async (req, res) => {
  try {
    const { horseId, categoryId } = req.body;

    // Ensure horseId and categoryId are provided
    if (!categoryId || !horseId) {
      return res.status(400).json({ error: "Horse ID and Category ID are required." });
    }

    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if the horse is already assigned to the category
    if (category.horses.includes(horseId)) {
      return res.status(400).json({ error: "Horse is already assigned to this category" });
    }

    // Add the horse ID to the category's horses array
    category.horses.push(horseId);
    await category.save();

    // Optionally, we can also update the Horse model to reference the category
    await Horse.findByIdAndUpdate(horseId, { category: categoryId });

    res.status(201).json({ message: "Horse assigned to category successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// ✅ Assign note to category
router.post('/add-note', async (req, res) => {
  try {
    const { noteId, categoryId } = req.body;

    // Check if the categoryId and noteId are provided
    if (!noteId || !categoryId) {
      return res.status(400).json({ error: "Both noteId and categoryId are required." });
    }

    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if the note is already assigned to the category
    if (category.notes.includes(noteId)) {
      return res.status(400).json({ error: "Note is already assigned to this category." });
    }

    // Add the note to the category's notes array
    category.notes.push(noteId);
    await category.save();

    // Optionally update the Note model to reference the category
    await Note.findByIdAndUpdate(noteId, { category: categoryId });

    res.status(201).json({ message: "Note successfully assigned to category." });
  } catch (error) {
    console.error("Error assigning note:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
