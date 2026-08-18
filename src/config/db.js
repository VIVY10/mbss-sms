'use strict';
require('dotenv').config();
const mysql = require('mysql2/promise');  // ← Use promise version!
const logger = require("../config/loggerConfig")

const isProd = process.env.NODE_ENV === 'production';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const poolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10s
  // cPanel / socket vs TCP
  ...(isProd
    ? { socketPath: '/var/lib/mysql/mysql.sock' }
    : { host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT) || 3306 })
};

// Create promise-based pool
const pool = mysql.createPool(poolConfig);

/**
 * Wait until DB is reachable (async version)
 */
async function waitForDb(retries = MAX_RETRIES) {
  if (retries <= 0) {
    logger.log('error', '❌ Could not connect to database after multiple attempts. Continuing without DB.');
    return;
  }

  try {
    const connection = await pool.getConnection();
    logger.log('info', '✅ Database connection successful');
    connection.release();
  } catch (err) {
    logger.log('warn', `⚠️ Database connection failed. Retries left: ${retries - 1}. Error: ${err.code || err.message}`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    await waitForDb(retries - 1);
  }
}

// Immediately try connecting (fire-and-forget)
waitForDb().catch(err => {
  logger.error('Unexpected error in waitForDb', err);
});

module.exports = pool;
  