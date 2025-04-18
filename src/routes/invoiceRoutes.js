const express = require("express");
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  markInvoiceAsPaid,
  deleteInvoice,
} = require("../controllers/invoiceController");

// Routes for invoice management
router.post("/", createInvoice); // Create a new invoice
router.get("/", getInvoices); // Get all invoices
router.get("/:id", getInvoiceById); // Get invoice by ID
router.put("/:id/pay", markInvoiceAsPaid); // Mark invoice as paid
router.delete("/:id", deleteInvoice); // Delete invoice

module.exports = router;
