const express = require("express");
const router = express.Router();



// 🧾 Invoice controllers
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  markInvoiceAsPaid,
  deleteInvoice,
} = require("../controllers/invoiceController");

// ==========================
// 💰 Invoice Management Routes
// ==========================

// ✅ Create a new invoice
router.post(
  "/",

  createInvoice
);

// ✅ Get all invoices
router.get(
  "/",
  
  getInvoices
);

// ✅ Get invoice by ID
router.get(
  "/:id",

  getInvoiceById
);

// ✅ Mark invoice as paid
router.put(
  "/:id/pay",

  markInvoiceAsPaid
);

// ✅ Delete invoice
router.delete(
  "/:id",

  deleteInvoice
);

module.exports = router;
