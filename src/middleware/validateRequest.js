const { validationResult } = require('express-validator');


function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render('./response/response', {
      message: errors
        .array()
        .map(error => error.msg)
        .join('\n ')
    });
  }

  next();
}


function validatePupilRegistration(req, res, next) {
  return validate(req, res, next);
}


module.exports = {
  validate,
  validatePupilRegistration
};