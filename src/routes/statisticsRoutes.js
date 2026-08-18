const express = require('express');
const controller = require('../controllers/statisticsController.js');

const router = express.Router();

router.post('/checkStudentNumber', controller.studentCount);
router.post('/checkTeacherNumber', controller.teacherCount);
router.post('/checkSubjectNumber', controller.subjectCount);

module.exports = router;