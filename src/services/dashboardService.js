// services/dashboardService.js

const dashboardModel = require("../models/dashboardModel");
const teacherModel = require('../models/teacherModel');
const examModel = require('../models/examModel');

exports.getAdminDashboardStats = async () => {

  const [
    students,
    teachers,
    departments,
    subjects,
    classes
  ] = await Promise.all([
    dashboardModel.countStudents(),
    dashboardModel.countTeachers(),
    dashboardModel.countDepartments(),
    dashboardModel.countSubjects(),
    dashboardModel.countClasses()
  ]);

  return {
    students,
    teachers,
    departments,
    subjects,
    classes
  };
};


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


exports.getTeacherDashboardStats = async (teacherid) => {

  const [
    allocations,
    examtype,
    // subjects,
    // classes
  ] = await Promise.all([
    teacherModel.getTeacherSubjectAllocations(teacherid),
    examModel.findAll(),
    // dashboardModel.countTeacherClasses(teacherid)
  ]);

  return {
    allocations,
    examtype,
    // subjects,
    // classes
  };
};


exports.getStudentDashboardStats = async (studentid) => {

  const results = await dashboardModel.getStudentDashboardStats(studentid);

  return results;
}