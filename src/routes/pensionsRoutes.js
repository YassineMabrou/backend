const express = require("express");
const router = express.Router();

const {
  createPension,
  getPensions,
  getPensionById,
  updatePension,
  deletePension,
} = require("../controllers/pensionController");



// ========================
// 🏠 Pension Management
// ========================

// ✅ Create a new pension
router.post(
  "/",

  createPension
);

// ✅ Get all pensions (with optional search filters)
router.get(
  "/",

  getPensions
);

// ✅ Get a specific pension by ID
router.get(
  "/:id",

  getPensionById
);

// ✅ Update a pension by ID
router.put(
  "/:id",

  updatePension
);

// ✅ Delete a pension by ID
router.delete(
  "/:id",

  deletePension
);

module.exports = router;
