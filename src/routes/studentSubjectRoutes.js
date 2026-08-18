const express = require('express');

const { authChecker } = require('../middleware/authChecker.js');
const { validate } = require('../middleware/validateRequest.js');
//const { studentSubjectValidationRules } = require('../schema/validationRules.js');

const controller = require('../controllers/studentSubjectController.js');

const router = express.Router();

router.get('/studentSubject', authChecker, controller.page);
router.post('/studentSubject', authChecker, controller.students);
router.post('/EnrollStudentSubject', authChecker, controller.enroll);
router.get('/mySubjects', authChecker, controller.mySubjects);

module.exports = router;
