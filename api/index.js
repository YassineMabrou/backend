// Import dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConnect = require("../src/config/dbConnect");
const serverless = require("serverless-http");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
(async () => {
  try {
    await dbConnect();
    console.log("✅ Connected to the database successfully");
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error.message);
  }
})();

// Import API routes
const authRoutes = require("../src/routes/authRoutes");
const userRoutes = require("../src/routes/userRoutes");
const horseRoutes = require("../src/routes/horseRoutes");
const actRoutes = require("../src/routes/ActRoutes");
const prescriptionRoutes = require("../src/routes/prescriptionRoutes");
const noteRoutes = require("../src/routes/noteRoutes");
const reportRoutes = require("../src/routes/ReportRoutes");
const pensionRoutes = require("../src/routes/pensionsRoutes");
const invoiceRoutes = require("../src/routes/invoiceRoutes");
const qualificationRoutes = require("../src/routes/qualificationRoutes");
const transportRoutes = require("../src/routes/transportRoutes");
const categoryRoutes = require("../src/routes/categoryRoutes");
const lieuxRouter = require("../src/routes/lieux");
const contactRoutes = require("../src/routes/ContactRoutes");
const currentLocationRoutes = require("../src/routes/currentLocationRoute");
const analysesRouter = require("../src/routes/analyses");

// Register API routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/horses", horseRoutes);
app.use("/acts", actRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/notes", noteRoutes);
app.use("/reports", reportRoutes);
app.use("/pensions", pensionRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/qualifications", qualificationRoutes);
app.use("/transports", transportRoutes);
app.use("/categories", categoryRoutes);
app.use("/lieux", lieuxRouter);
app.use("/contacts", contactRoutes);
app.use("/current-location", currentLocationRoutes);
app.use("/analyses", analysesRouter);

// Prediction route note
app.post('/predict', (req, res) => {
  res.status(501).json({
    error: "❌ Prediction with Python subprocess is not supported on Vercel. Please host this on an external service like Railway, Render, or AWS Lambda."
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Unexpected error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Export app as a serverless function
module.exports = serverless(app);
