// Load environment variables
require('dotenv').config();

// Import packages
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const isProd = process.env.NODE_ENV === 'production';

// 1. Connection options 
const connectionOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ...(isProd
    ? {
        socketPath: '/var/lib/mysql/mysql.sock'
      }
    : {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306
      })
};

// 2. Store options (session store behavior)
const storeOptions = {
  ...connectionOptions, // merge connection options in
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

// 3. Create session store
const sessionStore = new MySQLStore(storeOptions);

// Session configuration
const sessionConfig = {
  name: 'sessionId',
  secret: process.env.SESSION_SECRET || 'your_secret_key_here',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 20 * 60 * 1000,
  }
};

module.exports = {
  sessionConfig
};