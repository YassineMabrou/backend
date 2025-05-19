const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const schedule = require("node-schedule");
const { Parser } = require("json2csv");

const Act = require("../models/Act");
const User = require("../models/user");
const { sendEmail, sendSMS } = require("../utils/notifications");

// === Scheduling Functions ===
function scheduleActDateNotification(act) {
  if (!act.date) return;
  schedule.scheduleJob(new Date(act.date), () => sendNotification(act));
}

function scheduleReminder(act) {
  if (!act.reminderDate) return;
  schedule.scheduleJob(new Date(act.reminderDate), () => sendNotification(act));
}

function scheduleRecurringAct(act) {
  if (!act.recurrencePattern) return;

  const rule = new schedule.RecurrenceRule();
  switch (act.recurrencePattern) {
    case "daily":
      rule.hour = 0;
      rule.minute = 0;
      break;
    case "weekly":
      rule.dayOfWeek = new schedule.Range(0, 6);
      rule.hour = 0;
      rule.minute = 0;
      break;
    case "monthly":
      rule.date = 1;
      rule.hour = 0;
      rule.minute = 0;
      break;
  }

  schedule.scheduleJob(rule, () => sendNotification(act));
}

// === Notification Logic ===
async function sendNotification(act) {
  let notificationEmail = act.notificationEmail;
  let notificationPhoneNumber = act.notificationPhoneNumber;

  if ((!notificationEmail || !notificationPhoneNumber) && typeof act.createdBy === "string") {
    const user = await User.findById(act.createdBy).lean();
    if (user) {
      notificationEmail = notificationEmail || user.email;
      notificationPhoneNumber = notificationPhoneNumber || user.phone;
    }
  }

  const subject = `Reminder for ${act.type}`;
  const text = `This is a reminder that the act "${act.type}" is scheduled for ${new Date(act.date).toDateString()}.`;

  if (act.notificationMethod?.includes("email") && notificationEmail) {
    await sendEmail({ to: notificationEmail, subject, text });
  }

  if (act.notificationMethod?.includes("sms") && notificationPhoneNumber) {
    await sendSMS({ to: notificationPhoneNumber, message: text });
  }
}

// === Multer setup for attachment upload ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../uploads/attachments");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// === Routes ===

// GET /api/acts/history
router.get("/history", async (req, res) => {
  const {
    horseId,
    name,
    type,
    startDate,
    endDate,
    sortBy = "date",
    order = "desc",
    exportFormat,
  } = req.query;

  const filter = {};
  if (horseId && mongoose.Types.ObjectId.isValid(horseId)) {
    filter.horses = mongoose.Types.ObjectId(horseId);
  }
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const sort = { [sortBy]: order === "asc" ? 1 : -1 };

  try {
    let query = Act.find(filter).sort(sort);
    if (name) {
      query = query.populate({
        path: "horses",
        match: { name: new RegExp(name, "i") },
      });
    }

    let acts = await query.exec();
    if (name) {
      acts = acts.filter((act) => act.horses && act.horses.length > 0);
    }

    if (exportFormat === "csv") {
      const fields = ["type", "date", "plannedDate", "observations", "results", "reminders"];
      const parser = new Parser({ fields });
      const csv = parser.parse(acts);
      res.header("Content-Type", "text/csv");
      res.attachment("act_history.csv");
      return res.send(csv);
    }

    res.json(acts);
  } catch (error) {
    console.error("❌ Error in /history route:", error);
    res.status(500).json({ error: "Failed to fetch act history", details: error.message });
  }
});

// GET all acts
router.get("/", async (req, res) => {
  try {
    const acts = await Act.find();
    res.json(acts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new act
router.post("/", async (req, res) => {
  try {
    const newAct = new Act(req.body);
    await newAct.save();

    scheduleReminder(newAct);
    scheduleActDateNotification(newAct);
    scheduleRecurringAct(newAct);

    res.status(201).json(newAct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { results, observations } = req.body;

    const updated = await Act.findByIdAndUpdate(
      req.params.id,
      { results, observations },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Act not found" });

    res.json(updated);
  } catch (err) {
    console.error("❌ Failed to update act results/observations:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /acts/:id/comment — update comments and attachment
router.put("/:id/comment", upload.single("attachment"), async (req, res) => {
  try {
    const updateData = {
      comments: req.body.comments,
    };

    if (req.file) {
      updateData.attachment = `/uploads/attachments/${req.file.filename}`;
    }

    const updated = await Act.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) return res.status(404).json({ message: "Act not found" });

    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating comment/attachment:", error);
    res.status(500).json({ message: error.message });
  }
});
// DELETE /api/acts/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletedAct = await Act.findByIdAndDelete(req.params.id);
    if (!deletedAct) {
      return res.status(404).json({ message: "Act not found" });
    }
    res.json({ message: "Act deleted successfully", act: deletedAct });
  } catch (error) {
    console.error("❌ Error deleting act:", error);
    res.status(500).json({ message: "Failed to delete act", error: error.message });
  }
});


// GET act by ID (must come last!)
router.get("/:id", async (req, res) => {
  try {
    const act = await Act.findById(req.params.id);
    if (!act) return res.status(404).json({ message: "Act not found" });
    res.json(act);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
