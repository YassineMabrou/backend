const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  horseId: { type: mongoose.Schema.Types.ObjectId, ref: "Horse", required: true }, // Horse reference
  author: { type: String, required: true }, // Author of the note
  content: { type: String, required: true }, // Content of the note
  createdAt: { type: Date, default: Date.now }, // Date of note creation
});

module.exports = mongoose.model("Note", NoteSchema);
