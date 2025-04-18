const mongoose = require("mongoose");

const ActSchema = new mongoose.Schema({
  horses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Horse", required: true }],
  type: { type: String, required: true },
  date: { type: Date, required: true },
  plannedDate: { type: Date },
  observations: { type: String },
  results: { type: String },
  attachments: [{ type: String }],
  comments: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String },
    date: { type: Date, default: Date.now }
  }],
  reminders: { type: Boolean, default: false },
  reminderDate: { type: Date },
  recurrencePattern: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  notificationSent: { type: Boolean, default: false },
  notificationMethod: { type: [String], enum: ['email', 'sms'], default: ['email'] },

  // New fields for explicit notification contact details
  notificationEmail: { type: String },
  notificationPhoneNumber: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Act", ActSchema);