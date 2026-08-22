// =======================
// 1️⃣ Load Environment Variables
// =======================
require('dotenv').config();
require('./src/jobs/guardianCleanupJob.js');

// =======================
// 2️⃣ Core Modules & Libraries
// =======================
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const fs = require('fs');

// const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const activityMonitor = require('./src/middleware/activityMonitor');
const logger = require('./src/config/loggerConfig');


const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const path = require('path');


// =======================
// 3️⃣ Custom Config Imports
// =======================
const { configureSecurity, createHttpsServer } = require('./src/security/security');
const { startWebSocketServer } = require('./src/ws/websocket');


require('./src/config/passport.js');

const { sessionConfig } = require('./src/utils/sessionStore.js');

const {
  notFoundHandler,
  errorHandler
} = require('./src/middleware/errorHandler.js');



// =======================
// 4️⃣ Create Express App
// =======================
const app = express();

// =======================
// 5️⃣ Security Middleware (Helmet, CSP, CORS, compression)
// =======================
configureSecurity(app); // Must run before sessions, static files, and routes


// =======================
// 6️⃣ Cookie Parsing & Body Parsing
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// =======================
// 7️⃣ Static Files
// =======================
app.use(express.static(path.join(__dirname, 'public')));


// =======================
// 8️⃣ View Engine
// =======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// =======================
// 9️⃣ Session Middleware
// =======================
app.use(session(sessionConfig));


// =======================
// 🔟 Passport Initialization
// =======================
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


// =======================
// Routes
// =======================
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const homeRoutes = require('./src/routes/homeRoutes.js')
const routes = require('./src/routes/index.js'); 
const authRoutes = require('./src/routes/authRoutes.js');
const dashboardRoutes = require('./src/routes/dashboardRoutes.js');
const contactRoutes = require('./src/routes/contactRoutes.js');
const examRoutes = require('./src/routes/examRoutes.js');
const forgotPasswordRoutes = require('./src/routes/forgotPasswordRoutes.js');
const statisticsRoutes = require('./src/routes/statisticsRoutes.js');
const smsRoutes = require('./src/routes/smsRoutes.js');


// =======================
// activity Monitor attached globally
// =======================
app.use(activityMonitor);


// =======================
// attach routes globally
// =======================
app.use('/', homeRoutes)
app.use('/', analyticsRoutes);
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', contactRoutes);
app.use('/', forgotPasswordRoutes);
app.use('/', examRoutes);
app.use('/', statisticsRoutes);
app.use('/', smsRoutes);
app.use('/', routes);


// =======================
// 1️⃣2️⃣ Create HTTPS Server
// =======================
const server = createHttpsServer(app);

// =======================
// 1️⃣3️⃣ Start WebSocket Server
// =======================
startWebSocketServer(server);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);


// =======================
// 1️⃣4️⃣ Start HTTPS Server Listener
// =======================
const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, () => logger.log(`info`, `Server running on port ${PORT}`));


// Graceful shutdown
const shutdown = () => {
  logger.log('info', 'Shutting down server...');

  // 1️⃣ Close WebSocket connections
  if (global.wss) { // assuming you exported your WebSocket server as global or pass reference
    global.wss.clients.forEach(client => {
      try {
        client.close(1001, 'Server shutting down'); // 1001 = Going Away
      } catch (err) {
        logger.log('error', 'Error closing WS client:', err);
      }
    });
    global.wss.close(() => logger.log('info', 'WebSocket server closed.'));
  }

  // 2️⃣ Close HTTPS server
  server.close(err => {
    if (err) {
      logger.log('error', 'Error closing HTTPS server:', err);
      process.exit(1);
    }
    logger.log('info', 'HTTPS server closed.');

    // 3️⃣ Close database connections if any
    if (global.db) {
      global.db.close()
        .then(() => logger.log('info', 'Database connection closed.'))
        .catch(e => logger.log('error', 'Error closing DB connection:', e))
        .finally(() => process.exit(0));
    } else {
      process.exit(0);
    }
  });

  // 4️⃣ Force exit after 10 seconds if something hangs
  setTimeout(() => {
    logger.log('warn', 'Force exiting process after 10s...');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGINT', shutdown);   // Ctrl+C
process.on('SIGTERM', shutdown);  // Docker / Kubernetes stop signals