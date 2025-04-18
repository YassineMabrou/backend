const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  pensionId: { type: mongoose.Schema.Types.ObjectId, ref: "Pension", required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
