const { body, query } = require('express-validator');

exports.getReportValidators = () => {
  return [
    query("user")
      .optional()
      .trim()
      .escape(),               // basic XSS protection

    query("type")
      .optional()
      // .isIn(["admin", "staff", "customer"])
      // .withMessage("Invalid type")
      .trim()
      .escape(),

    query("start")
      .optional()
      .isISO8601()
      .toDate()
      .trim()
      .escape(),               // converts string → Date

    query("end")
      .optional()
      .isISO8601()
      .toDate()
      .trim()
      .escape()
  ]
};

exports.heartbeatValidators = () => {
  return [
    body("page")
      .trim()
      .escape(),

    body("duration")
      .trim()
      .escape()
  ]
};

exports.durationValidators = () => {
  return [
    body("duration")
      .notEmpty()
      .trim()
      .escape()
  ]
};