const { sendContactEmail } = require("../config/mailer.js");

async function sendContactMessage(data) {
  await sendContactEmail(
    data.senderName,
    data.subject,
    data.emailAddress,
    data.emailMessage,
  );

  return {
    success: true,
    message: "Your enquiry has been sent successfully."
  };
}

module.exports = {
  sendContactMessage,
};
