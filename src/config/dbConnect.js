const mongoose = require("mongoose");

mongoose.set('strictQuery', true); // suppress warning

const dbConnect = async () => {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    throw new Error("❌ Missing MONGODB_URL environment variable");
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    throw err;
  }
};

module.exports = dbConnect;
