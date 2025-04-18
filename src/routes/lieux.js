const express = require("express");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const mongoose = require("mongoose");
const Lieu = require("../models/Lieu");
const Horse = require("../models/Horse"); // Import the Horse model

const router = express.Router();

// 📌 1️⃣ Add a new location
router.post("/", async (req, res) => {
  try {
    const { name, address, postalCode, city, type, subLocations, capacity } = req.body;

    if (!name || !address || !postalCode || !city || !type || !capacity) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate subLocations if provided
    if (subLocations) {
      for (let subLocation of subLocations) {
        const { name, type, capacity, dimensions } = subLocation;
        if (!name || !type || !capacity || !dimensions) {
          return res.status(400).json({ error: "All sub-location fields are required" });
        }
      }
    }

    const newLieu = new Lieu({ name, address, postalCode, city, type, subLocations, capacity });
    await newLieu.save();
    res.status(201).json(newLieu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 2️⃣ Update a location
// 📌 Update a location
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const { name, address, postalCode, city, type, capacity } = req.body;

    const updatedLieu = await Lieu.findByIdAndUpdate(
      id,
      {
        name,
        address,
        postalCode,
        city,
        type,
        capacity,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedLieu) {
      return res.status(404).json({ error: "Lieu not found" });
    }

    res.json(updatedLieu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 📌 3️⃣ Delete a location
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const lieu = await Lieu.findByIdAndDelete(id);
    if (!lieu) {
      return res.status(404).json({ error: "Lieu not found" });
    }

    res.json({ message: "Lieu deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const updated = await Lieu.findByIdAndUpdate(
      id,
      { archived: true, updatedAt: Date.now() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Lieu not found" });
    }

    res.json({ message: "Lieu archived successfully", lieu: updated });
  } catch (error) {
    console.error("❌ Archive Error:", error);
    res.status(500).json({ error: error.message });
  }
});



// 📌 5️⃣ Export Lieu Data
router.get("/:id/export", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const { format } = req.query; // Supports PDF, CSV, Excel
    const lieu = await Lieu.findById(id);
    if (!lieu) {
      return res.status(404).json({ error: "Lieu not found" });
    }

    // Ensure export directory exists
    const exportDir = "./exports";
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // 📌 Export as PDF
    if (format === "pdf") {
      const doc = new PDFDocument();
      const filePath = `${exportDir}/lieu_${id}.pdf`;
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(16).text(`Lieu: ${lieu.name}`, { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Adresse: ${lieu.address}`);
      doc.text(`Ville: ${lieu.city}`);
      doc.text(`Type: ${lieu.type}`);
      doc.text(`Capacité: ${lieu.capacity}`);
      doc.text(`Sous-localisations:`);

      lieu.subLocations.forEach((subLocation, index) => {
        doc.text(`${index + 1}. ${subLocation.name} - ${subLocation.type} - Capacity: ${subLocation.capacity}`);
        doc.text(`   Dimensions: ${subLocation.dimensions.length}x${subLocation.dimensions.width}x${subLocation.dimensions.height}`);
      });

      doc.end();
      stream.on("finish", () => res.download(filePath));
      return;
    }

    // 📌 Export as CSV
    if (format === "csv") {
      const fields = ["name", "address", "city", "type", "capacity", "subLocations"];
      const subLocationData = lieu.subLocations.map(subLocation => ({
        ...subLocation,
        dimensions: `${subLocation.dimensions.length}x${subLocation.dimensions.width}x${subLocation.dimensions.height}`
      }));

      const parser = new Parser({ fields });
      const csv = parser.parse({
        ...lieu.toObject(),
        subLocations: subLocationData.map(subLocation => `${subLocation.name} - ${subLocation.type}`).join(", ")
      });

      res.header("Content-Type", "text/csv");
      res.attachment(`lieu_${id}.csv`);
      return res.send(csv);
    }

    // 📌 Export as Excel
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Lieu");

      worksheet.addRow(["Nom", "Adresse", "Ville", "Type", "Capacité", "Sous-localisations"]);
      worksheet.addRow([
        lieu.name,
        lieu.address,
        lieu.city,
        lieu.type,
        lieu.capacity,
        lieu.subLocations.map(subLocation => `${subLocation.name} - ${subLocation.type}`).join(", ")
      ]);

      const filePath = `${exportDir}/lieu_${id}.xlsx`;
      await workbook.xlsx.writeFile(filePath);
      return res.download(filePath);
    }

    return res.status(400).json({ error: "Format not supported" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ✅ GET all locations
router.get('/', async (req, res) => {
  try {
    const lieux = await Lieu.find();
    res.json(lieux);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Assign a horse to a location by updating only the Lieu model
router.post("/assign", async (req, res) => {
  try {
    const { horseId, lieuId } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(horseId) || !mongoose.Types.ObjectId.isValid(lieuId)) {
      return res.status(400).json({ error: "Invalid horseId or lieuId" });
    }

    // Make sure the horse exists
    const horse = await Horse.findById(horseId);
    if (!horse) {
      return res.status(404).json({ error: "Horse not found" });
    }

    // Find the location
    const lieu = await Lieu.findById(lieuId);
    if (!lieu) {
      return res.status(404).json({ error: "Lieu not found" });
    }

    // Ensure the horses array exists
    if (!lieu.horses) lieu.horses = [];

    // Add the horse to the location only if it's not already there
    if (!lieu.horses.includes(horse._id)) {
      lieu.horses.push(horse._id);
      await lieu.save();
    }

    res.status(200).json({
      message: "Horse successfully assigned to location (Lieu).",
      lieu,
    });
  } catch (error) {
    console.error("❌ Assignment Error:", error);
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
