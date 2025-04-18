const mongoose = require("mongoose");

const QualificationSchema = new mongoose.Schema({
  horseId: { type: mongoose.Schema.Types.ObjectId, ref: "Horse", required: true },
  competitionName: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  result: { type: String, required: true }, // Ex: "1ère place", "Top 5"
  score: { type: Number }, // Optionnel pour les performances chiffrées
});

module.exports = mongoose.model("Qualification", QualificationSchema);
