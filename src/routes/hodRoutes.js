const express = require("express");
const passport = require("passport");

const controller = require("../controllers/hodController.js");
const dashboardController = require("../controllers/dashboardController.js");
const { authChecker, ensureRole } = require("../middleware/authChecker.js");
const router = express.Router();

router.get("/hod/dashboard", authChecker, dashboardController.showDashboard);

router.get("/myClasses", authChecker, controller.showHodClasses);

// router.get("/hod/teachers", authChecker, controller.repartmentTeachers);

// router.get(
//   "/hod/subject-allocations",
//   authChecker,
//   controller.subjectAllocations,
// );

// router.get("/hod/class-subjects", authChecker, controller.classSubjects);

// router.get("/hod/marks", authChecker, controller.marks);

// router.get("/hod/results", authChecker, controller.results);

// router.get("/hod/progress", authChecker, controller.progress);

// router.get("/hod/reports", authChecker, controller.reports);

// router.get("/hod/analytics", authChecker, controller.analytics);

module.exports = router;
