const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    availability: { type: String, required: true },

    // 📌 List of horses assigned to this contact
    horses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Horse" }],

    // 📌 Historique des interventions (List of actions performed by the contact)
    interventions: [
      {
        date: { type: Date, default: Date.now }, // Date of the intervention
        horse: { type: mongoose.Schema.Types.ObjectId, ref: "Horse" }, // Horse involved
        type: { type: String, required: true }, // Type of intervention (e.g., "Medical Checkup", "Training", etc.)
        description: { type: String, required: true }, // Details about the intervention
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", ContactSchema);
