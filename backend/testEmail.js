require("dotenv").config();

const { sendEmail } = require("./services/emailService");

async function main() {
const recipient = process.env.TEST_EMAIL_TO;

if (!recipient) {
throw new Error(
"Please set TEST_EMAIL_TO in your backend .env file."
);
}

const result = await sendEmail({
to: recipient,
subject: "NOHE Payroll System - Email Delivery Test",
text: [
"Hello,",
"",
"This is a test email from the NOHE Payroll System.",
"The SMTP email service is working.",
"",
"No employee payslip is attached to this message.",
"",
"NOHE Payroll System"
].join("\n")
});

console.log("Test email accepted by SMTP server.");
console.log("Message ID:", result.messageId);
console.log("Accepted recipients:", result.accepted);
console.log("Rejected recipients:", result.rejected);
}

main().catch((error) => {
console.error("Test email failed:", error.message);
process.exitCode = 1;
});
