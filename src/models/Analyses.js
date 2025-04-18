const mongoose = require("mongoose");

const AnalysisSchema = new mongoose.Schema({
  horse: { type: mongoose.Schema.Types.ObjectId, ref: "Horse", required: true },
  act: { type: mongoose.Schema.Types.ObjectId, ref: "Act", required: true },
  testType: { type: String, required: true },
  result: { type: String, required: true },
  date: { type: Date, default: Date.now },
  file: { type: String },
});

module.exports = mongoose.model("Analyses", AnalysisSchema);
