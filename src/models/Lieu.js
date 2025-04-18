const mongoose = require("mongoose");

const lieuSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  postalCode: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true 
  },
  capacity: { 
    type: Number, 
    required: true 
  },
  archived: { 
    type: Boolean, 
    default: false 
  },

  // ✅ Add this field for assigned horses
  horses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Horse" }],

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Lieu = mongoose.models.Lieu || mongoose.model("Lieu", lieuSchema);
module.exports = Lieu;
