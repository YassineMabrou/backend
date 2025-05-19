const mongoose = require("mongoose");

const userPermissionSchema = new mongoose.Schema({
  manage_horse: { type: Boolean, default: false },
  manage_action: { type: Boolean, default: false },
  manage_qualification: { type: Boolean, default: false },
  manage_movement: { type: Boolean, default: false },
  manage_location: { type: Boolean, default: false },
  manage_contact: { type: Boolean, default: false },
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // ✅ username back
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  permissions: userPermissionSchema,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
