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
const adminOnly = [authChecker, ensureRole('admin')];

router.get('/createExam', adminOnly, controller.showCreateExam);
router.post('/createExam', adminOnly, createExamValidationRules(), validate, controller.createExam);
router.get('/exams', adminOnly, controller.listExams);
router.post('/deleteExam', adminOnly, controller.deleteExam);

module.exports = router;
