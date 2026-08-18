const express = require('express');

const pupilRoutes = require('./pupilRoutes.js');
const teacherRoutes = require('./teacherRoutes.js');
const studentSubjectRoutes = require('./studentSubjectRoutes.js');
const resultRoutes = require('./resultRoutes.js');
const adminRoutes = require('./adminRoutes.js');
const router = express.Router();


router.use('/', pupilRoutes);
router.use('/', teacherRoutes);
router.use('/', studentSubjectRoutes);
router.use('/', resultRoutes);
router.use('/', adminRoutes);

module.exports = router;
