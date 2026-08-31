const express = require('express');
const passport = require('passport');

const controller = require('../controllers/authController.js');
const dashboardController = require('../controllers/dashboardController.js');
const { authChecker } = require('../middleware/authChecker.js');
const router = express.Router();

router.get('/login', controller.showStaffLogin);

router.post(
  '/login',
  passport.authenticate('staff', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })
);

router.get('/studentLogin', controller.showStudentLogin);

router.post(
  '/studentLogin',
  passport.authenticate('pupil', {
    successRedirect: '/dashboard',
    failureRedirect: '/studentLogin',
    failureFlash: true
  })
);

router.get('/logout', controller.logout);

router.get("/dashboard", authChecker, dashboardController.showDashboard);

module.exports = router;