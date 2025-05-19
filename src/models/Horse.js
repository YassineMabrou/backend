const mongoose = require("mongoose");

const horseSchema = new mongoose.Schema({
  name: {
    type: String,
     required: true,
    unique: true, 
  },
  coatColor: {
    type: String,
    required: true,
  },
 sireNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{9}$/, 'SIRE number must be exactly 9 digits']
  },
  sireKey: {
  type: String,
  required: true,
  unique: true,
  match: [/^\d{15}$/, 'Clé SIRE (UELN) invalide (15 chiffres attendus)']
},
  birthDate: {
    type: Date,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  breedCode: {
    type: String,
    required: true,
  },
  responsibleContacts: {
    type: String,
    required: true,
  },
  archived: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date, 
    default: null 
  },

  // 🔹 Notes and Prescriptions
  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
  prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prescription" }],

  // ✅ Simplified currentLocation
  currentLocation: {
    lieu: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Lieu', 
      required: true 
    }
  },

  movementHistory: [
    {
      lieu: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Lieu' 
      },
      timestamp: { type: Date, default: Date.now },
    }
  ],
}, { timestamps: true });

const Horse = mongoose.model("Horse", horseSchema);
module.exports = Horse;
