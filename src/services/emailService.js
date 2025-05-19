const nodemailer = require('nodemailer');

// Create a transporter object using Gmail's SMTP (you can change this to any email service like SendGrid, SES)
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can change this to any other email service (e.g., SendGrid, SES)
  auth: {
    user: process.env.EMAIL_USER,  // Your email address (e.g., 'your-email@gmail.com')
    pass: process.env.EMAIL_PASS,  // Your email password or app password (store this in .env)
  },
});

// Function to send the welcome email after registration
const sendWelcomeEmail = (userEmail, username, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,  // Sender's email address
    to: userEmail,                 // Recipient's email address (provided by user in registration)
    subject: 'Welcome to Our Service!',
    text: `Hello ${username},\n\nThank you for registering with us.\n\nHere are your account details:\n\nUsername: ${username}\nPassword: ${password}\n\nPlease keep your credentials secure.`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;
