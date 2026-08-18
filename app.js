require('dotenv').config();
require('./src/jobs/guardianCleanupJob.js');

const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const path = require('path');

require('./src/config/passport.js');

const { sessionConfig } = require('./src/utils/sessionStore.js');

const {
  notFoundHandler,
  errorHandler
} = require('./src/middleware/errorHandler.js');

const homeRoutes = require('./src/routes/homeRoutes.js')
const routes = require('./src/routes/index.js'); 
const authRoutes = require('./src/routes/authRoutes.js');
const dashboardRoutes = require('./src/routes/dashboardRoutes.js');
const contactRoutes = require('./src/routes/contactRoutes.js');
const examRoutes = require('./src/routes/examRoutes.js');
const forgotPasswordRoutes = require('./src/routes/forgotPasswordRoutes.js');
const statisticsRoutes = require('./src/routes/statisticsRoutes.js');
const smsRoutes = require('./src/routes/smsRoutes.js');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session(sessionConfig));

// Authentication
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use('/', homeRoutes)
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', contactRoutes);
app.use('/', forgotPasswordRoutes);
app.use('/', examRoutes);
app.use('/', statisticsRoutes);
app.use('/', smsRoutes);
app.use('/', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});