const express = require('express');

const {
  authChecker,
  ensureRole
} = require('../middleware/authChecker.js');

const { validate } = require('../middleware/validateRequest.js');

const {
  createExamValidationRules
} = require('../validation/validationRules.js');

const controller = require('../controllers/examController.js');

const router = express.Router();

router.get('/createExam', authChecker, ensureRole, controller.showCreateExam);
router.post('/createExam', authChecker, ensureRole, createExamValidationRules(), validate, controller.createExam);
router.get('/exams', authChecker, controller.listExams);
router.post('/deleteExam', authChecker, ensureRole, controller.deleteExam);

module.exports = router;
