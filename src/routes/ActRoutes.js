const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Act = require("../models/Act");
const schedule = require("node-schedule");
const { sendEmail, sendSMS } = require("../utils/notifications");
const { Parser } = require("json2csv");

// Helper functions
function scheduleReminder(act) {
  if (!act.reminderDate) return;

  schedule.scheduleJob(act.reminderDate, function () {
    sendNotification(act);
  });
}

function scheduleRecurringAct(act) {
  if (!act.recurrencePattern) return;

  const recurrenceRule = new schedule.RecurrenceRule();
  switch (act.recurrencePattern) {
    case 'daily':
      recurrenceRule.hour = 0;
      recurrenceRule.minute = 0;
      break;
    case 'weekly':
      recurrenceRule.dayOfWeek = new schedule.Range(0, 6);
      recurrenceRule.hour = 0;
      recurrenceRule.minute = 0;
      break;
    case 'monthly':
      recurrenceRule.date = 1;
      recurrenceRule.hour = 0;
      recurrenceRule.minute = 0;
      break;
  }

  schedule.scheduleJob(recurrenceRule, function () {
    sendNotification(act);
  });
}

async function sendNotification(act) {
  const notificationEmail = act.notificationEmail || act.createdBy.email;
  const notificationPhoneNumber = act.notificationPhoneNumber || act.createdBy.phone;

  if (act.notificationMethod.includes('email') && notificationEmail) {
    await sendEmail(notificationEmail, act);
  }

  if (act.notificationMethod.includes('sms') && notificationPhoneNumber) {
    await sendSMS(notificationPhoneNumber, act);
  }
}

// ===============================
// Routes for Acts
// ===============================

// GET /api/acts
router.get("/", async (req, res) => {
  try {
    const acts = await Act.find();
    res.json(acts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/acts/filter
router.get("/filter", async (req, res) => {
  try {
    const acts = await Act.find(); // simplified for brevity
    res.json(acts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/acts/:id
router.get("/:id", async (req, res) => {
  try {
    const act = await Act.findById(req.params.id);
    if (!act) {
      return res.status(404).json({ message: "Act not found" });
    }
    res.json(act);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/acts
router.post("/", async (req, res) => {
  try {
    const newAct = new Act(req.body);
    await newAct.save();

    // Schedule any reminders or recurrence patterns if applicable
    scheduleReminder(newAct);
    scheduleRecurringAct(newAct);

    res.status(201).json(newAct);  // Respond with the created act
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/acts/history (for exporting as CSV or filtering)
router.get("/history", async (req, res) => {
  const { horseId, type, startDate, endDate, sortBy = "date", order = "desc", exportFormat } = req.query;

  if (!horseId) {
    return res.status(400).json({ error: "horseId is required" });
  }

  const filter = { horse: horseId };
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const sort = { [sortBy]: order === "asc" ? 1 : -1 };
  const acts = await Act.find(filter).sort(sort);

  if (exportFormat === "csv") {
    const fields = ["type", "date", "plannedDate", "observations", "results", "reminders"];
    const parser = new Parser({ fields });
    const csv = parser.parse(acts);
    res.header("Content-Type", "text/csv");
    res.attachment("act_history.csv");
    return res.send(csv);
  }

  res.json(acts);
});

module.exports = router;
