const express = require("express");
const PDFDocument = require("pdfkit");
const fastcsv = require("fast-csv");
const ExcelJS = require("exceljs");
const { format } = require("date-fns");
const Horse = require("../models/Horse");



const router = express.Router();

const getHorseData = async (horseId) => {
  return await Horse.findById(horseId)
    .populate("notes")
    .populate("prescriptions")
    .exec();
};

const safeFormatDate = (date) => {
  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return format(parsedDate, "yyyy-MM-dd");
    }
  }
  return "N/A";
};

// ✅ Generate PDF Report
router.get(
  "/pdf/:horseId",
  async (req, res) => {
    try {
      const { horseId } = req.params;
      const horse = await getHorseData(horseId);

      if (!horse) {
        return res.status(404).json({ error: "Horse not found." });
      }

      const doc = new PDFDocument();
      const filename = `horse_${horse.name}_report.pdf`;

      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);
      doc.fontSize(18).text("Horse Management Report", { align: "center" });
      doc.moveDown(2);

      doc.fontSize(14).text(`Name: ${horse.name}`);
      doc.fontSize(12).text(`Coat Color: ${horse.coatColor}`);
      doc.text(`Sire Number: ${horse.sireNumber}`);
      doc.text(`Birthdate: ${safeFormatDate(horse.birthDate)}`);
      doc.text(`Sex: ${horse.sex}`);
      doc.text(`Breed Code: ${horse.breedCode}`);
      doc.text(`Date Added: ${safeFormatDate(horse.createdAt)}`);
      doc.moveDown(1);

      doc.fontSize(12).text("Notes:", { underline: true });
      if (horse.notes.length > 0) {
        horse.notes.forEach((note) => {
          doc.text(`- ${note.content} (by ${note.author}, ${safeFormatDate(note.createdAt)})`);
        });
      } else {
        doc.text("No notes available.");
      }
      doc.moveDown(1);

      doc.text("Prescriptions:", { underline: true });
      if (horse.prescriptions.length > 0) {
        horse.prescriptions.forEach((prescription) => {
          doc.text(`- ${prescription.medication}: ${prescription.instructions} (by ${prescription.issuedBy})`);
        });
      } else {
        doc.text("No prescriptions available.");
      }

      doc.end();
    } catch (error) {
      console.error("PDF Generation Error:", error);
      res.status(500).json({ error: "Failed to generate PDF report." });
    }
  }
);

// ✅ Generate CSV Report
router.get(
  "/csv/:horseId",
  async (req, res) => {
    try {
      const { horseId } = req.params;
      const horse = await getHorseData(horseId);

      if (!horse) {
        return res.status(404).json({ error: "Horse not found." });
      }

      const filename = `horse_${horse.name}_report.csv`;
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Type", "text/csv");

      const csvStream = fastcsv.format({ headers: true });
      csvStream.pipe(res);

      csvStream.write({
        Name: horse.name,
        CoatColor: horse.coatColor,
        SireNumber: horse.sireNumber,
        BirthDate: safeFormatDate(horse.birthDate),
        Sex: horse.sex,
        BreedCode: horse.breedCode,
        Notes: horse.notes.map((n) => `${n.content} (by ${n.author})`).join(" | "),
        Prescriptions: horse.prescriptions.map((p) => `${p.medication}: ${p.instructions}`).join(" | "),
        Date_Added: safeFormatDate(horse.createdAt),
      });

      csvStream.end();
    } catch (error) {
      console.error("CSV Generation Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// ✅ Generate Excel Report
router.get(
  "/excel/:horseId",
  async (req, res) => {
    try {
      const { horseId } = req.params;
      const horse = await getHorseData(horseId);

      if (!horse) {
        return res.status(404).json({ error: "Horse not found." });
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Horse Report");

      worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Coat Color", key: "coatColor", width: 15 },
        { header: "Sire Number", key: "sireNumber", width: 15 },
        { header: "Birth Date", key: "birthDate", width: 15 },
        { header: "Sex", key: "sex", width: 10 },
        { header: "Breed Code", key: "breedCode", width: 15 },
        { header: "Notes", key: "notes", width: 40 },
        { header: "Prescriptions", key: "prescriptions", width: 40 },
        { header: "Date Added", key: "createdAt", width: 15 },
      ];

      worksheet.addRow({
        name: horse.name,
        coatColor: horse.coatColor,
        sireNumber: horse.sireNumber,
        birthDate: safeFormatDate(horse.birthDate),
        sex: horse.sex,
        breedCode: horse.breedCode,
        notes: horse.notes.map((n) => `${n.content} (by ${n.author})`).join(" | "),
        prescriptions: horse.prescriptions.map((p) => `${p.medication}: ${p.instructions}`).join(" | "),
        createdAt: safeFormatDate(horse.createdAt),
      });

      res.setHeader("Content-Disposition", `attachment; filename=horse_${horse.name}_report.xlsx`);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Excel Generation Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
