const express = require("express");
const router = express.Router();
const {
  createPension,
  getPensions,
  getPensionById,
  updatePension,
  deletePension,
} = require("../controllers/pensionController");

// Routes for pension management

// Create a new pension
router.post("/", createPension);

// Get all pensions with optional search filter by horse (horseId or horse name)
router.get("/", getPensions);  // Can include query params like ?horse=someNameOrId

// Get a single pension by ID
router.get("/:id", getPensionById);

// Update a pension by ID
router.put("/:id", updatePension);

// Delete a pension by ID
router.delete("/:id", deletePension);

module.exports = router;
