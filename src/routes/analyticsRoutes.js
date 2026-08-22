const express = require('express');
const router = express.Router();
// const assignmentController = require('../controllers/assignmentController');
// const attendanceController = require('../controllers/attendanceController');
// const districtController = require('../controllers/districtController');
// const performanceController = require('../controllers/performanceController');
// const provinceController = require('../controllers/provinceController');
// const reportController = require('../controllers/reportController');
// const schoolController = require('../controllers/schoolController');
// const userController = require('../controllers/userController');
const analyticsController = require('../controllers/analyticsController');
const analyticsModel = require('../models/analyticsModel');
const { authChecker, ensureRole } = require('../middleware/authChecker'); 
const { validate } = require('../middleware/validateRequest.js');
const { getReportValidators, heartbeatValidators, durationValidators } = require('../validation/analytics.js');
const { matchedData } = require('express-validator');

// router.get('/show', authChecker, analyticsController.showAnalytics)

const adminOnly = [authChecker, ensureRole('admin')];

router.get('/logs', ...adminOnly, validate, 
    async (req, res) => {
        res.render('./analytics/user_logs')
    })


router.get('/user-activity', ...adminOnly, getReportValidators(),
    validate,
    async (req, res) => {  
        try {
            const data = matchedData(req);

            const { user = "", type = "", start = "", end = "" } = data;
            const results = await analyticsController.getUserActivity(user, type, start, end);            
            return res.json(results);

        } catch (err) {
            return res.status(500).json({ error: "Failed to load activity logs" });
        }
    });


router.post('/heartbeat', authChecker,
    ensureRole('admin'), heartbeatValidators(), validate,
    async (req, res) => {
        try {
            const data = matchedData(req)
            const { page, duration } = data;
            await analyticsModel.updateUserDuration(req, page || req.originalUrl, duration || 0);
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(500);
        } 
    });

router.post('/exit', authChecker,
    ensureRole('admin'), heartbeatValidators(), validate,
    async (req, res) => {
        try {
            const body = matchedData(req) || {}; // <-- prevent undefined

            const page = body.page || req.originalUrl || "unknown";
            const duration = Number(body.duration) || 0;

            await analyticsModel.updateUserDuration(req, page, duration, true);

            res.sendStatus(200);

        } catch (err) {
            res.sendStatus(500);
        }
    });


router.post('/pause', authChecker,
    ensureRole('admin'), durationValidators(), validate,
    async (req, res) => {
        try {
            const data = matchedData(req)
            const { duration } = data;
            await analyticsModel.updateUserDuration(req, req.originalUrl, duration || 0);
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(500);
        }
    });


router.get('/heatmap', ...adminOnly, async (req, res) => {
    try {
        const rows = await analyticsController.getHeatmap();

        return res.json(rows);

    } catch (err) {
        console.error("Heatmap route error:", err);

        return res.status(500).json({
            error: "Failed to load heatmap"
        });
    }
});


router.get('/export-csv', authChecker,
    ensureRole('admin'),
    validate,
    async (req, res) => {
        try {
            const csv = await analyticsModel.exportCSV();
            res.setHeader('Content-Disposition', 'attachment; filename="analytics.csv"');
            res.setHeader('Content-Type', 'text/csv');
            res.send(csv);
        } catch (err) {
            res.sendStatus(500);
        }
    });


// router.get('/totalDistrictUsers', authenticateUser('/api/auth/login'), districtController.districtUsers)
// router.get('/totalSchools', authenticateUser('/api/auth/login'), schoolController.countAllSchools)
// router.get('/totalDistrictReports', authenticateUser('/api/auth/login'), reportController.countAllReports)
// router.get('/totalCompletedAssignments', authenticateUser, assignmentController.countCompletedAssignments)
// router.get('/totalActiveAssignments', authenticateUser, assignmentController.countActiveAssignments)
// router.get('/totalAssignments', authenticateUser, assignmentController.countAllAssignments)


module.exports = router;