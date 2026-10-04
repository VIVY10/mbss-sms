const dashboardModel = require("../models/dashboardModel");
const teacherModel = require('../models/teacherModel');
const examModel = require('../models/examModel');

exports.getHodDashboardStats = async (departmentid, termid) => {

  const [
    teachers,
    subjects,
    classSubjects,
    unallocatedSubjects,
    departmentTeachers,
    class_subjects
  ] = await Promise.all([
    dashboardModel.countDepartmentTeachers(departmentid),
    dashboardModel.countDepartmentSubjects(departmentid),
    dashboardModel.countDepartmentClasses(departmentid),
    dashboardModel.countUnallocatedSubjects(termid, departmentid),
    dashboardModel.getTermDepartmentTeachersStats(departmentid, termid),
    dashboardModel.class_subjects(termid, departmentid)
  ]);

  return {
    teachers,
    subjects,
    classSubjects,
    unallocatedSubjects,
    departmentTeachers,
    class_subjects
  };
};

exports.getdepartmentTeachers = async (departmentid, termid) => {

  const departmentTeachers = await  dashboardModel.getTermDepartmentTeachersStats(departmentid, termid)

  return departmentTeachers;
};