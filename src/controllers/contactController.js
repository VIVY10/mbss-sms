const { matchedData } = require('express-validator');

const service = require('../services/contactService.js');

exports.showContactPage = async(req, res) => {
  res.render('./main/contact');
}

exports.sendContactMessage = async(req, res) => {
  try {
    const data = matchedData(req);

    await service.sendContactMessage(data);

    res.render('./response/response', {
      message: 'Email sent successfully.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.redirect('/contact');
  }
}