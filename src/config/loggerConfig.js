const winston = require('winston');

// Create a Winston logger
const logger = winston.createLogger({
  level: 'info', // Set the default logging level
  format: winston.format.json(), // Default format for logs
  transports: [
    // File transport for production or general logging
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Add a console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(), // Simple format for console logs
  }));
}


module.exports = logger;
