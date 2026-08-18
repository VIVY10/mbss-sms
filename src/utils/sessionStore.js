// Load environment variables
require('dotenv').config();

// Import packages
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// MySQL session store options
const options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306, // Default MySQL port
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  clearExpired: true, 
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 86400000, // 1 day
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
};

// Create session store
const sessionStore = new MySQLStore(options);

// Session configuration
const sessionConfig = {
  name: 'sessionId', // Custom session cookie name
  secret: process.env.SESSION_SECRET || 'your_secret_key_here',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset cookie expiration on every response
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    sameSite: 'strict', // Protect against CSRF
    maxAge: 20 * 60 * 1000, // 20 minutes
   //domain: 'https://localhost:3000'
  }
};

module.exports = {
  sessionConfig
};