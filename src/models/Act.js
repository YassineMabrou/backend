const mongoose = require("mongoose");

const ActSchema = new mongoose.Schema({
  horses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Horse", required: true }],
  type: { type: String, required: true },
  date: { type: Date, required: true },
  plannedDate: { type: Date },
  observations: { type: String },
  results: { type: String },
  // ✅ Update attachments to single string (optional override if not multiple)
  attachment: { type: String },
  // ✅ Update comments to single string instead of array of objects
  comments: { type: String },

  reminders: { type: Boolean, default: false },
  reminderDate: { type: Date },
  recurrencePattern: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  notificationSent: { type: Boolean, default: false },
  notificationMethod: { type: [String], enum: ['email', 'sms'], default: ['email'] },

  notificationEmail: { type: String },
  notificationPhoneNumber: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Act", ActSchema);