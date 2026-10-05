const dashboardModel = require("../models/dashboardModel");
const resultModel = require("../models/resultModel");
const examModel = require("../models/examModel");

exports.getHodDashboardStats = async (departmentid, termid) => {
  const [
    teachers,
    subjects,
    classSubjects,
    unallocatedSubjects,
    departmentTeachers,
    class_subjects,
  ] = await Promise.all([
    dashboardModel.countDepartmentTeachers(departmentid),
    dashboardModel.countDepartmentSubjects(departmentid),
    dashboardModel.countDepartmentClasses(departmentid),
    dashboardModel.countUnallocatedSubjects(termid, departmentid),
    dashboardModel.getTermDepartmentTeachersStats(departmentid, termid),
    dashboardModel.class_subjects(termid, departmentid),
  ]);

  return {
    teachers,
    subjects,
    classSubjects,
    unallocatedSubjects,
    departmentTeachers,
    class_subjects,
  };
};

exports.getdepartmentTeachers = async (departmentid, termid) => {
  const departmentTeachers =
    await dashboardModel.getTermDepartmentTeachersStats(departmentid, termid);

  return departmentTeachers;
};

exports.getClassAllocations = async (termid, departmentid) => {
  const results = await dashboardModel.department_teaching_allocation(
    termid,
    departmentid,
  );

  return results;
};


exports.getResults = async (schoolyear, term, subjectcode, classid, examid, examno = null) => {  
    const rows = await resultModel.getStudentResultsByClass(schoolyear, term, subjectcode, classid, examid, examno)
    if (!rows.length) return null;

    return rows;
};
