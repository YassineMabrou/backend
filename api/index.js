// Import dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConnect = require("../src/config/dbConnect");
const { spawn } = require("child_process");
const path = require("path");
const dgram = require("dgram");

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.MONGODB_URL || !process.env.PORT) {
  console.error("❌ Missing required environment variables: MONGODB_URL and/or PORT");
  process.exit(1);
}

// Initialize the Express app
const app = express();

// Configure CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
(async () => {
  try {
    await dbConnect();
    console.log("✅ Connected to the database successfully");
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error.message);
    process.exit(1);
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
const Userr = require("../src/routes/users");

// Register API routes with /api prefix
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/horses", horseRoutes);
app.use("/api/acts", actRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/pensions", pensionRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/qualifications", qualificationRoutes);
app.use("/api/transports", transportRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/lieux", lieuxRouter);
app.use("/api/contacts", contactRoutes);
app.use("/api/current-location", currentLocationRoutes);
app.use("/api/analyses", analysesRouter);
app.use("/api/users", Userr); // You might want to clarify why users is registered twice

// UDP client setup
const udpClient = dgram.createSocket("udp4");

// Function to send data to ESP32
function sendAlertToESP32(horseId, status) {
  const esp32Ip = "192.168.1.20"; // Replace with your ESP32 IP address
  const esp32Port = 1234;         // ESP32 listening UDP port
  const message = JSON.stringify({ horse: horseId, status: status });

  udpClient.send(message, esp32Port, esp32Ip, (err) => {
    if (err) console.error("Error sending UDP message to ESP32:", err);
    else console.log("✅ Alert sent to ESP32:", message);
  });
}

// Prediction endpoint
app.post("/api/predict", (req, res) => {
  const { features, horseId } = req.body;

  if (!Array.isArray(features) || !horseId) {
    return res.status(400).json({ error: "Features should be an array and horseId is required" });
  }

  const pythonPath = "C:\\Users\\MSI\\AppData\\Local\\Programs\\Python\\Python310\\python.exe";
  const scriptPath = path.join(__dirname, "../predict.py");

  const pythonProcess = spawn(pythonPath, [scriptPath]);

  pythonProcess.stdin.write(JSON.stringify({ features }));
  pythonProcess.stdin.end();

  let dataBuffer = "";
  let errorBuffer = "";

  pythonProcess.stdout.on("data", (data) => {
    dataBuffer += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorBuffer += data.toString();
    console.error(`🐍 Python stderr: ${errorBuffer}`);
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0 || errorBuffer) {
      return res.status(500).json({
        error: "Python script failed to execute",
        details: errorBuffer || "Unknown error",
      });
    }

    try {
      const result = JSON.parse(dataBuffer);

      if (result.prediction === "died" || result.prediction === "euthanized") {
        sendAlertToESP32(horseId, result.prediction);
      }

      res.json(result);
    } catch (err) {
      console.error("❌ Failed to parse Python output:", err);
      res.status(500).json({ error: "Error parsing Python output" });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 7002;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
