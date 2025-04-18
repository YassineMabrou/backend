const cron = require("node-cron");
const Pension = require("../models/Pension");
const Invoice = require("../models/Invoice");


cron.schedule("0 0 1 * *", async () => { // Runs on the 1st of every month
    const activePensions = await Pension.find({ status: "active" });
  
    for (const pension of activePensions) {
      const amount = pension.billingType === "monthly" ? pension.rate : pension.rate * 30;
      const invoice = new Invoice({ pensionId: pension._id, amount });
      await invoice.save();
    }
    console.log("Invoices generated!");
  });
  