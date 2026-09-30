const express = require("express");
const router = express.Router();
const { authChecker, ensureRole } = require('../middleware/authChecker.js');
const controller = require("../controllers/marksMonitoringController");

const adminOnly = [authChecker, ensureRole('admin')];
const hodOnly = [authChecker, ensureRole('HOD')];
 
router.get("/marks-monitoring", authChecker, controller.page);
router.get("/marks-monitoring/summary", authChecker, controller.summary);
router.get("/marks-monitoring/rows", authChecker, controller.rows);
router.get("/marks-monitoring/classes", authChecker, controller.classes);
router.get("/marks-monitoring/missing-learners", authChecker, controller.missingLearners);
router.get("/marks-monitoring/interventions", authChecker, controller.interventions);
router.post("/marks-monitoring/interventions", authChecker, express.json(), controller.createIntervention);
router.patch("/marks-monitoring/interventions", authChecker, express.json(), controller.updateIntervention);
router.patch("/marks-monitoring/exam-deadline", authChecker, express.json(), controller.updateDeadline);

module.exports = router;
