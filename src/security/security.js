const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const crypto = require("crypto");
const express = require("express");
const https = require("https");
const logger = require("../config/loggerConfig");
function configureSecurity(app) {
  const isProd = process.env.NODE_ENV === "production";

  // ✅ SAFE trust proxy configuration
  app.set("trust proxy", 1);

  // Generate nonce for every request
  app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(20).toString("base64url");
    next();
  });

  // Strict CSP (nonces required)
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],

    styleSrc: [
      "'self'",
      "'unsafe-inline'",
    //   (req, res) => `'nonce-${res.locals.nonce}'`,
      "https://fonts.googleapis.com",
      "https://cdn.jsdelivr.net",
      "https://cdnjs.cloudflare.com",
      "https://unpkg.com",
      "https://cdn.datatables.net"
    ],

    fontSrc: [
      "'self'",
      "data:",
      "https://fonts.gstatic.com",
      "https://cdn.jsdelivr.net",
      "https://cdnjs.cloudflare.com",
      "https://unpkg.com"
    ],

    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
    //   (req, res) => `'nonce-${res.locals.nonce}'`,
      "https://cdn.jsdelivr.net",
      "https://cdnjs.cloudflare.com",
      "https://ajax.googleapis.com",
      "https://unpkg.com",
      "https://www.google.com",
      "https://www.gstatic.com",
      "https://code.jquery.com"
    ],

    imgSrc: [
      "'self'",
      "data:",
      "https://i.ytimg.com",
    ],

    connectSrc: [
      "'self'",
      "https://www.google.com",
      "https://www.gstatic.com",
      "https://unpkg.com",
      ...(isProd
        ? []
        : [
            "https://localhost:3000",
            "https://cdn.jsdelivr.net",
          ]),
    ],

    objectSrc: ["'none'"],

    frameSrc: [
      "'self'",
      "https://www.youtube.com",
      "https://www.google.com",
      "https://www.gstatic.com",
    ],

    mediaSrc: ["'self'"],

    upgradeInsecureRequests: [],
  },

  reportOnly: false,
};

  // HTTPS redirect in production
  if (isProd) {
    app.use((req, res, next) => {
      const isSecure =
        req.secure || req.headers["x-forwarded-proto"] === "https";
      if (!isSecure) {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  // Apply security middleware
  app.use(
    helmet({
      contentSecurityPolicy: cspConfig,
      hsts: isProd
        ? { maxAge: 63072000, includeSubDomains: true, preload: true }
        : false,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),
  );

  // Compression only in production
  if (isProd) app.use(compression({ level: 6, threshold: "10kb" }));

  // CORS
  app.use(
    cors({
      origin: isProd
        ? "https://www.milengeseboardingsecondary.com"
        : "https://localhost:3000",
      methods: ["GET", "POST", "DELETE", "PUT"],
      allowedHeaders: ["Content-Type"],
    }),
  );

  // CSP violation report endpoint
  app.post(
    "/api/report-to",
    express.json({ type: "application/csp-report" }),
    (req, res) => {
      try {
        const report = req.body?.["csp-report"];
        if (report) {
          logger.warn("CSP_VIOLATION", {
            blockedURI: report["blocked-uri"],
            violatedDirective: report["violated-directive"],
            sourceFile: report["source-file"],
            lineNumber: report["line-number"],
            userAgent: req.headers["user-agent"],
            ip: req.ip,
          });
        } else {
          logger.log("error", "Malformed CSP Report:", req.body);
        }
      } catch (error) {
        logger.log(`error`, `CSP Report Processing Error`, error);
      }
      res.status(204).end();
    },
  );
}

function createHttpsServer(app) {
  const sslDir = path.resolve(__dirname, "../ssl");
  const privateKeyPath = path.join(sslDir, "keys", "key.pem");
  const certificatePath = path.join(sslDir, "certs", "cert.pem");
  const caBundlePath = path.join(sslDir, "certs", "ca-bundle.crt");

  let serverOptions;
  try {
    serverOptions = {
      key: fs.readFileSync(privateKeyPath),
      cert: fs.readFileSync(certificatePath),
      ca: fs.existsSync(caBundlePath)
        ? fs.readFileSync(caBundlePath)
        : undefined,
      minVersion: "TLSv1.2",
      ciphers: [
        "TLS_AES_256_GCM_SHA384",
        "TLS_CHACHA20_POLY1305_SHA256",
        "TLS_AES_128_GCM_SHA256",
        "ECDHE-RSA-AES256-GCM-SHA384",
        "ECDHE-RSA-AES128-GCM-SHA256",
      ].join(":"),
      honorCipherOrder: true,
    };
    logger.log("info", "SSL certificates loaded successfully");
  } catch (err) {
    logger.log(`error`, `Critical SSL configuration error`, err);
    process.exit(1);
  }

  return https.createServer(serverOptions, app);
}

module.exports = { configureSecurity, createHttpsServer };
