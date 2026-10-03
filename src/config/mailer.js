const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 465),
  secure: Number(process.env.EMAIL_PORT || 465) === 465,
  auth: {
    user: process.env.CONTACT_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendContactEmail = async (
  senderName,
  subject,
  emailAddress,
  emailMessage,
) => {
  return transporter.sendMail({
    // Your authenticated email should normally be the sender
    from: `"School Website" <${emailAddress}>`,

    // Visitor's email goes here so you can reply directly
    replyTo: emailAddress,

    // School mailbox receiving the enquiry
    to: process.env.SCHOOL_EMAIL,

    subject: subject,

    text: `sent by ${senderName}
    Email: ${emailAddress}

  ${emailMessage}`,
  });
};

const sendCleanupNotification = async ({ success, message }) => {
  return transporter.sendMail({
    from: process.env.CONTACTEMAIL,
    to: process.env.REPLYTO_ADDRESS,
    subject: success ? "Parent Cleanup Success" : "Parent Cleanup Error",
    text: success
      ? message
      : `An error occurred while deleting orphaned parents: ${message}`,
  });
};

module.exports = {
  transporter,
  sendContactEmail,
  sendCleanupNotification,
};
