const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      fr: { type: String, required: true },
      en: { type: String, required: true },
    },
    type: {
      type: String,
      enum: ["horse", "note"],
      required: true,
    },
    criteria: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    horses: [{ // Reference to horses assigned to this category
      type: mongoose.Schema.Types.ObjectId,
      ref: "Horse",
      default: [],
    }],
    notes: [{ // Reference to notes assigned to this category
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      default: [],
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for child categories (optional)
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategory",
});

// Update `updatedAt` before save
categorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Category", categorySchema);
