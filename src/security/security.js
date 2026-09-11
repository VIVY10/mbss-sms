const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const crypto = require("crypto");
const express = require("express");
const http = require('http');
const https = require("https");
const logger = require("../config/loggerConfig");


/**
 * CSP configuration
 */
function configureSecurity(app) {
  const isProd = process.env.NODE_ENV === 'production';

  app.set('trust proxy', 1);

  app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
  });

const nonce = (req, res) => `'nonce-${res.locals.nonce}'`;

  app.use(helmet({
      originAgentCluster: true,
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],

    scriptSrc: [
      "'self'",
      nonce,
      "https://cdn.jsdelivr.net",
      "https://cdnjs.cloudflare.com",
      "https://ajax.googleapis.com",
      "https://unpkg.com",
      "https://www.google.com",
      "https://www.gstatic.com",
      "https://code.jquery.com",
    ],

    styleSrc: [
      "'self'",
      nonce,
      "https://fonts.googleapis.com",
      "https://cdn.jsdelivr.net",
      "https://cdnjs.cloudflare.com",
      "https://unpkg.com",
      "https://cdn.datatables.net",
      "https://fonts.googleapis.com "
    ],

    fontSrc: [
      "'self'", 'data:',
      "https://fonts.gstatic.com",
      "https://cdn.jsdelivr.net",
      "https://cdnjs.cloudflare.com",
      "https://unpkg.com"
    ],

    imgSrc: [
      "'self'",
      'data:',
      'https://i.ytimg.com'
    ],

    connectSrc: [
      "'self'",
      'wss:',
      'https://www.google.com',
      'https://www.gstatic.com',
      'https://cdn.jsdelivr.net'
    ],

    frameSrc: [
      "'self'",
      'https://www.youtube.com',
      'https://www.google.com'
    ],

    objectSrc: ["'none'"]
  }
},
    hidePoweredBy: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: false
  }));

  if (isProd) app.use(compression());

  app.use(cors({
    origin: isProd ? ['https://www.mbss-sms.netapek.com'] : ['https://localhost:3000'],
    credentials: true
  }));

  app.post(
    '/api/report-to',
    express.json({ type: ['application/csp-report', 'application/json'] }),
    (req, res) => {
      const report = req.body?.['csp-report'];
      if (report) logger.warn('CSP_VIOLATION', report);
      res.sendStatus(204);
    }
  );
}


/**
 * Create server safely for all environments
 *
 * LiteSpeed / CloudLinux: HTTP only
 * Other: HTTPS if SSL_KEY_PATH & SSL_CERT_PATH are set
 */
function createServer(app) {
  // cPanel / LiteSpeed MUST be HTTP
  logger.info('Creating HTTP server (LiteSpeed-safe)');
  return http.createServer(app);
}


module.exports = { configureSecurity, createServer };