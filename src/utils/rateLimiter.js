const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();

// Configuration for a forgot password route rate limiter
// exports.forgotPasswordLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again after 15 minutes',
//   standardHeaders: true, // Return IETF standard rate limit headers
//   legacyHeaders: false, // Disable the legacy X-RateLimit-* headers
// });

// ------------------------------------------------------------------------
// Rate Limit Presets / Constants
// ------------------------------------------------------------------------
const TIME = {
  MINUTE: 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
};

const MESSAGES = {
  tooManyRequests: (minutes) => 
    `Too many attempts. Please try again after ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
};

// ------------------------------------------------------------------------
// Shared base configuration
// ------------------------------------------------------------------------
const createRateLimiter = (options) => rateLimit({
  standardHeaders: true,
  legacyHeaders: false,
  
  // Default message formatting
  message: (req, res) => ({
    status: 429,
    error: 'Too Many Requests',
    message: MESSAGES.tooManyRequests(Math.ceil(options.windowMs / TIME.MINUTE)),
  }),
  
  handler: (req, res, next, options) => {
    res.status(429).json(options.message(req, res));
  },
  
  ...options,
});

// ------------------------------------------------------------------------
// Specific limiters
// ------------------------------------------------------------------------

exports.forgotPasswordLimiter = createRateLimiter({
  windowMs: TIME.FIFTEEN_MINUTES,
  max: 10,
});

// Example: you can now easily add more limiters with the same style
exports.loginLimiter = createRateLimiter({
  windowMs: TIME.ONE_HOUR,
  max: 10,
});

exports.verifyEmailLimiter = createRateLimiter({
  windowMs: TIME.FIFTEEN_MINUTES,
  max: 5,
});