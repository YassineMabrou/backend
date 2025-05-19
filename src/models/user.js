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
  name: { type: String, required: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  permissions: userPermissionSchema,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
