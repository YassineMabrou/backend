const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false }, // Optional phone number
  password: { type: String, required: true },
});

// ✅ Prevent Overwriting the Model
const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
