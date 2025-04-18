const mongoose = require("mongoose");

const PensionSchema = new mongoose.Schema({
  horseId: { type: mongoose.Schema.Types.ObjectId, ref: "Horse", required: true },
  horseName: { type: String },  // Optional field for storing the horse's name
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // Optional if ongoing
  rate: { type: Number, required: true },
  billingType: { type: String, enum: ["daily", "monthly"], required: true },
  status: { type: String, enum: ["active", "completed"], default: "active" },
});

// This will update the horseName field whenever a horseId is assigned or updated
PensionSchema.pre("save", async function (next) {
  if (this.isModified("horseId")) {
    const horse = await mongoose.model("Horse").findById(this.horseId);
    this.horseName = horse ? horse.name : '';  // Set horseName from the associated horse document
  }
  next();
});

module.exports = mongoose.model("Pension", PensionSchema);
