const express = require("express");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const mongoose = require("mongoose");
const Lieu = require("../models/Lieu");
const Horse = require("../models/Horse");

const router = express.Router();

// 📌 1️⃣ Add a new location with sub-locations
router.post("/", async (req, res) => {
  try {
    const { name, address, postalCode, city, type, subLocations, capacity } = req.body;

    // Validate required fields
    if (!name || !address || !postalCode || !city || !type || !capacity) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate sub-locations if provided
    if (subLocations) {
      for (let subLocation of subLocations) {
        const { name, type, capacity, dimensions } = subLocation;
        if (!name || !type || !capacity || !dimensions) {
          return res.status(400).json({ error: "All sub-location fields are required" });
        }

        // Ensure dimensions are in the format 'lengthxwidthxheight'
        if (!dimensions.match(/\d+x\d+x\d+/)) {
          return res.status(400).json({ error: "Dimensions must be in the format 'lengthxwidthxheight'" });
        }
      }
    }

    // Create the new location
    const newLieu = new Lieu({ name, address, postalCode, city, type, subLocations, capacity });
    await newLieu.save();
    res.status(201).json(newLieu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 2️⃣ Update a location, including sub-locations
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const { name, address, postalCode, city, type, capacity, subLocations } = req.body;

    // Validate sub-locations
    if (subLocations) {
      for (let subLocation of subLocations) {
        const { name, type, capacity, dimensions } = subLocation;
        if (!name || !type || !capacity || !dimensions) {
          return res.status(400).json({ error: "All sub-location fields are required" });
        }

        if (!dimensions.match(/\d+x\d+x\d+/)) {
          return res.status(400).json({ error: "Dimensions must be in the format 'lengthxwidthxheight'" });
        }
      }
    }

    const updatedLieu = await Lieu.findByIdAndUpdate(
      id,
      { name, address, postalCode, city, type, capacity, subLocations, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedLieu) return res.status(404).json({ error: "Lieu not found" });

    res.json(updatedLieu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 3️⃣ Delete a location, including its sub-locations
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const lieu = await Lieu.findByIdAndDelete(id);
    if (!lieu) return res.status(404).json({ error: "Lieu not found" });

    res.json({ message: "Lieu deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 4️⃣ Archive a location
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

    if (!updated) return res.status(404).json({ error: "Lieu not found" });

    res.json({ message: "Lieu archived successfully", lieu: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 5️⃣ Export Lieu Data (PDF, CSV, Excel)
router.get("/:id/export", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const { format } = req.query;
    const lieu = await Lieu.findById(id);
    if (!lieu) return res.status(404).json({ error: "Lieu not found" });

    const exportDir = "./exports";
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    // PDF Export
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

      if (Array.isArray(lieu.subLocations)) {
        lieu.subLocations.forEach((s, i) => {
          const d = s.dimensions || {};
          doc.text(`${i + 1}. ${s.name} - ${s.type} - Capacity: ${s.capacity}`);
          doc.text(`   Dimensions: ${d.length || "?"}x${d.width || "?"}x${d.height || "?"}`);
        });
      } else {
        doc.text("   Aucune sous-localisation trouvée.");
      }

      doc.end();
      stream.on("finish", () => res.download(filePath));
      return;
    }

    // CSV Export
    if (format === "csv") {
      const fields = ["name", "address", "city", "type", "capacity", "subLocations"];
      const subLocationData = (lieu.subLocations || []).map((s) => ({
        ...s,
        dimensions: `${s?.dimensions?.length || "?"}x${s?.dimensions?.width || "?"}x${s?.dimensions?.height || "?"}`,
      }));

      const parser = new Parser({ fields });
      const csv = parser.parse({
        ...lieu.toObject(),
        subLocations: subLocationData.map((s) => `${s.name} - ${s.type}`).join(", "),
      });

      res.header("Content-Type", "text/csv");
      res.attachment(`lieu_${id}.csv`);
      return res.send(csv);
    }

    // Excel Export
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
        (lieu.subLocations || []).map((s) => `${s.name} - ${s.type}`).join(", "),
      ]);

      const filePath = `${exportDir}/lieu_${id}.xlsx`;
      await workbook.xlsx.writeFile(filePath);
      return res.download(filePath);
    }

    return res.status(400).json({ error: "Format not supported" });
  } catch (error) {
    console.error("❌ Export error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET all locations
router.get("/", async (req, res) => {
  try {
    const lieux = await Lieu.find();
    res.json(lieux);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Assign a horse to a location
router.post("/assign", async (req, res) => {
  try {
    const { horseId, lieuId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(horseId) || !mongoose.Types.ObjectId.isValid(lieuId)) {
      return res.status(400).json({ error: "Invalid horseId or lieuId" });
    }

    const horse = await Horse.findById(horseId);
    if (!horse) return res.status(404).json({ error: "Horse not found" });

    const lieu = await Lieu.findById(lieuId);
    if (!lieu) return res.status(404).json({ error: "Lieu not found" });

    if (!lieu.horses) lieu.horses = [];
    if (!lieu.horses.includes(horse._id)) {
      lieu.horses.push(horse._id);
      await lieu.save();
    }

    res.status(200).json({
      message: "Horse successfully assigned to location (Lieu).",
      lieu,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
