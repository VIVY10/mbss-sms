const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 465),
  secure: Number(process.env.EMAIL_PORT || 465) === 465,
  auth: {
    user: process.env.CONTACT_EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});
 
const sendContactEmail = async({ senderName, emailAddress, emailMessage }) => {
  return transporter.sendMail({
    from: process.env.CONTACTEMAIL,
    replyTo: emailAddress,
    to: process.env.CONTACTEMAIL,
    subject: 'Contact Us Message',
    text: `Name: ${senderName}\nEmail: ${emailAddress}\n\n${emailMessage}`
  });
}

const sendCleanupNotification = async({ success, message }) => {
  return transporter.sendMail({
    from: process.env.CONTACTEMAIL,
    to: process.env.CONTACTEMAIL,
    subject: success ? 'Parent Cleanup Success' : 'Parent Cleanup Error',
    text: success ? message : `An error occurred while deleting orphaned parents: ${message}`
  });
}

module.exports = {
  transporter,
  sendContactEmail,
  sendCleanupNotification
};
