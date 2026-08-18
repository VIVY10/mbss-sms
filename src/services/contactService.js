const { sendContactEmail } = require('../config/mailer.js');


async function sendContactMessage({
    senderName,
    emailAddress,
    emailMessage,
    jobtitle
}) {
    if (jobtitle !== '') {
        return { sent: false };
    }

    await sendContactEmail({
        senderName,
        emailAddress,
        emailMessage
    });

    return { sent: true };
}


module.exports = {
    sendContactMessage
};