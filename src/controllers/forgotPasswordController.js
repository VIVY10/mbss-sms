const { matchedData } = require('express-validator');

const service = require('../services/passwordResetService.js');

exports.showForgotPassword = (req, res) => {
  res.render('./forgotPassword/forgotPassword');
};

exports.requestReset = async (req, res) => {
  try {
    const { email } = matchedData(req);

    await service.requestReset(email);

    // Avoid exposing whether an account exists.
    return res.json({
      status: 'ok'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 'error',
      message: 'An error occurred. Please try again later.'
    });
  }
};

exports.showResetPassword = async (req, res) => {
  const { email, token } = req.query;

  try {
    const record = await service.findValidToken(
      email,
      token
    );

    if (!record) {
      return res.render(
        './forgotPassword/resetPassword',
        {
          message:
            'Token has expired or is invalid. Please try password reset again.',
          showForm: false
        }
      );
    }

    res.render('./forgotPassword/resetPassword', {
      showForm: true,
      record
    });
  } catch (error) {
    console.error(error);

    res.render(
      './response/resetPasswordResponse',
      {
        message:
          'An error occurred. Please try again later.'
      }
    );
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const {
      password1,
      email,
      token
    } = matchedData(req);

    const success = await service.resetPassword({
      email,
      token,
      password: password1
    });

    res.render(
      './response/resetPasswordResponse',
      {
        message: success
          ? 'Password reset successfully. Please login with your new password.'
          : 'Invalid or expired token. Please try the reset password process again.'
      }
    );
  } catch (error) {
    console.error(error);

    res.render(
      './response/resetPasswordResponse',
      {
        message:
          'An error occurred. Please try again later.'
      }
    );
  }
};