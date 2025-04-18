const nodemailer = require("nodemailer");
const twilio = require("twilio");
require("dotenv").config();

// ✅ Setup Nodemailer for emails
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * ✅ Send Email Notification (Only if email is configured)
 */
const sendEmail = async ({ to, subject, text }) => {
  if (!transporter) {
    console.warn("⚠️ Email sending is disabled: EMAIL_USER & EMAIL_PASS are not set.");
    return;
  }

  try {
    let info = await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
    console.log(`📧 Email sent: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

// ✅ Setup Twilio for SMS
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * ✅ Send SMS Notification (Only if Twilio is configured)
 */
const sendSMS = async ({ to, message }) => {
  if (!twilioClient) {
    console.warn("⚠️ SMS sending is disabled: Twilio credentials are not set.");
    return;
  }

  try {
    let sms = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`📩 SMS sent: ${sms.sid}`);
  } catch (error) {
    console.error("❌ Error sending SMS:", error);
  }
};

module.exports = { sendEmail, sendSMS };
