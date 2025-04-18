const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema({
  horseId: { type: mongoose.Schema.Types.ObjectId, ref: "Horse", required: true },
  medication: String,
  dosage: String,
  instructions: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Prescription", PrescriptionSchema);
