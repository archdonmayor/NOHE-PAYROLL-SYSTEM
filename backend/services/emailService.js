const nodemailer = require("nodemailer");

// Create a secure SMTP transporter using the backend .env configuration.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 60000
});

/**
 * Verify the connection and authentication with the SMTP server.
 */
async function verifyEmailConnection() {
  try {
    await transporter.verify();

    console.log("SMTP connection verified successfully.");

    return {
      success: true,
      message: "SMTP connection verified successfully."
    };
  } catch (error) {
    console.error("SMTP connection verification failed:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });

    throw error;
  }
}

/**
 * Send an email using the configured NOHE payroll mailbox.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} [options.text] - Plain-text email body.
 * @param {string} [options.html] - Optional HTML email body.
 * @param {Array} [options.attachments] - Optional email attachments.
 */
async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments = []
}) {
  // Validate required fields.
  if (!to || !subject || (!text && !html)) {
    throw new Error(
      "Recipient, subject, and email content are required."
    );
  }

  // Validate sender configuration.
  const sender = process.env.EMAIL_FROM || process.env.SMTP_USER;

  if (!sender) {
    throw new Error(
      "EMAIL_FROM or SMTP_USER must be configured."
    );
  }

  try {
    const result = await transporter.sendMail({
      from: sender,
      to,
      subject,
      text,
      html,
      attachments
    });

    console.log("Email accepted by SMTP server:", {
      messageId: result.messageId,
      recipient: to,
      accepted: result.accepted,
      rejected: result.rejected
    });

    return {
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected
    };
  } catch (error) {
    console.error("Email sending failed:", {
      recipient: to,
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command,
      response: error.response
    });

    throw error;
  }
}

module.exports = {
  transporter,
  verifyEmailConnection,
  sendEmail
};

