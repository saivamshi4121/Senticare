let transporter;

function getTransporter() {
  if (transporter) return transporter;
  let nodemailer;
  try {
    // Lazy require so app doesn't crash if nodemailer isn't installed
    nodemailer = require('nodemailer');
  } catch (e) {
    console.warn('Nodemailer not installed. Skipping email transport initialization.');
    return null;
  }
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured. Skipping email transport initialization.');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const txp = getTransporter();
  if (!txp) {
    return { skipped: true };
  }
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };
  const tx = await txp.sendMail(mailOptions);
  return tx;
}

module.exports = { sendEmail };


