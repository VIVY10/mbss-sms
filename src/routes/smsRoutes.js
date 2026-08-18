const express = require('express');

const { authChecker } = require('../middleware/authChecker.js');
const controller = require('../controllers/smsController.js');

const router = express.Router();

router.get(
  '/sendResults',
  authChecker,
  controller.showResultsForm
);

router.post(
  '/getResults',
  authChecker,
  controller.sendResults
);

module.exports = router;