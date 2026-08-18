const express = require('express');

const { validate } = require('../middleware/validateRequest.js');

const {
  emailValidationRules,
  resetPasswordValidationRules
} = require('../validation/validationRules.js');

const controller = require('../controllers/forgotPasswordController.js');

const router = express.Router();

router.get(
  '/forgotPassword',
  controller.showForgotPassword
);

router.post(
  '/forgot-password',
  emailValidationRules(),
  validate,
  controller.requestReset
);

router.get(
  '/forgotPassword/resetPassword',
  controller.showResetPassword
);

router.post(
  '/resetPassword',
  resetPasswordValidationRules(),
  validate,
  controller.resetPassword
);

module.exports = router;