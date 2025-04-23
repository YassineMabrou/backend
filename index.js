const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConnect = require("../src/config/dbConnect");
const serverless = require("serverless-http");

// Load env
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to DB
(async () => {
  try {
    await dbConnect();
    console.log("✅ Connected to DB");
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
  }
})();

// Routes
app.use("/api/auth", require("../src/routes/authRoutes"));
app.use("/api/users", require("../src/routes/userRoutes"));
app.use("/api/horses", require("../src/routes/horseRoutes"));
app.use("/api/acts", require("../src/routes/ActRoutes"));
app.use("/api/prescriptions", require("../src/routes/prescriptionRoutes"));
app.use("/api/notes", require("../src/routes/noteRoutes"));
app.use("/api/reports", require("../src/routes/ReportRoutes"));
app.use("/api/pensions", require("../src/routes/pensionsRoutes"));
app.use("/api/invoices", require("../src/routes/invoiceRoutes"));
app.use("/api/qualifications", require("../src/routes/qualificationRoutes"));
app.use("/api/transports", require("../src/routes/transportRoutes"));
app.use("/api/categories", require("../src/routes/categoryRoutes"));
app.use("/api/lieux", require("../src/routes/lieux"));
app.use("/api/contacts", require("../src/routes/ContactRoutes"));
app.use("/api/current-location", require("../src/routes/currentLocationRoute.js"));
app.use("/api/analyses", require("../src/routes/analyses"));

// ⚠️ NOTE: Python prediction (spawn) won't work on Vercel serverless
app.post('/api/predict', (req, res) => {
  return res.status(501).json({ error: "Python subprocesses are not supported on Vercel Serverless. Deploy separately (e.g., on Railway, Render, or Lambda)." });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Export for serverless
module.exports = serverless(app);
