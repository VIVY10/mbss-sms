const express = require('express');

const { validate } = require('../middleware/validateRequest');
const { contactusValidationRules } = require('../validation/validationRules');
const controller = require('../controllers/contactController');

const router = express.Router();

router.get('/contact', controller.showContactPage);

router.post(
    '/contactUs',
    contactusValidationRules(),
    validate,
    controller.sendContactMessage
);

module.exports = router;