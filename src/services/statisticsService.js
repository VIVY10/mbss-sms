const model = require('../models/statisticsModel');

const getStudentCount = model.getStudentCount;
const getTeacherCount = model.getTeacherCount;
const getSubjectCount = model.getSubjectCount;

module.exports = {
    getStudentCount,
    getTeacherCount,
    getSubjectCount
};