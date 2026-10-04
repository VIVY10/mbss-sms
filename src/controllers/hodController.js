const dashboardViews = require("../config/dashboardViews");
const adminModel = require("../models/adminModel");
// const { countUnallocatedSubjects } = require("../models/dashboardModel");
// const dashboardService = require("../services/dashboardService");
const subjectModel = require("../models/subjectModel");
const hodService = require("../services/hodService.js");

exports.showHodClasses = async (req, res) => {
  const user = req.user;

  const dashboard = dashboardViews["teacher"];

  if (!dashboard) {
    return res.redirect("/");
  }

  const stats = dashboard.getStats ? await dashboard.getStats(user) : {};

  return res.render(dashboard.view, {
    [dashboard.dataKey]: user,

    stats,
  });
};

exports.departmentTeachers = async (req, res) => {
  try {
    const teacherid = req.user.teacherid;

    const foundDepartment =
      await adminModel.findActiveHodByTeacherId(teacherid);
    const currentTerm = await adminModel.get_Open_Terms();
    const currentYear = await adminModel.get_Open_schoolYear();

    let departmentid = "";

    if (foundDepartment && foundDepartment.length > 0) {
      departmentid = foundDepartment[0].departmentid;
    }

    const termid = currentTerm[0].termid;

    const stats = {
      currentYear: currentYear[0],
      currentTerm: currentTerm[0],
    };

    const departmentTeachers = await hodService.getdepartmentTeachers(
      departmentid,
      termid,
    );

    res.render("./hod/teachers", {
      stats,
      departmentTeachers,
      user: req.user,
    });
  } catch (err) {
    // console.log(err);
    throw err;
  }
};

exports.subjectAllocations = async (req, res) => {
  try {
    const teacherid = req.user.teacherid;

    const foundDepartment =
      await adminModel.findActiveHodByTeacherId(teacherid);
    const currentTerm = await adminModel.get_Open_Terms();
    const currentYear = await adminModel.get_Open_schoolYear();

    let departmentid = "";

    if (foundDepartment && foundDepartment.length > 0) {
      departmentid = foundDepartment[0].departmentid;
    }

    const termid = currentTerm[0].termid;

    const stats = {
      currentYear: currentYear[0],
      currentTerm: currentTerm[0],
    };

    const allocations = await hodService.getClassAllocations(
      termid,
      departmentid,
    );

    const subjectsWithoutTeacherAllocations = allocations.filter(
      (item) => item.allocation_status === "Not Allocated",
    );

    res.render("./hod/subject-allocations", {
      stats,
      allocations,
      subjectsWithoutTeacherAllocations,
      user: req.user,
    });
  } catch (err) {
    // console.log(err);
    throw err;
  }
};

exports.classSubjects = async (req, res) => {
  try {
    const teacherid = req.user.teacherid;

    const foundDepartment =
      await adminModel.findActiveHodByTeacherId(teacherid);
    const currentTerm = await adminModel.get_Open_Terms();
    const currentYear = await adminModel.get_Open_schoolYear();

    let departmentid = "";

    if (foundDepartment && foundDepartment.length > 0) {
      departmentid = foundDepartment[0].departmentid;
    }

    const termid = currentTerm[0].termid;

    const stats = {
      currentYear: currentYear[0],
      currentTerm: currentTerm[0],
    };

    const allocations = await hodService.getClassAllocations(
      termid,
      departmentid,
    );

    const departmentSubjects = await subjectModel.getDepartmentSubjects(departmentid)

    res.render("./hod/department-subjects", {
      stats,
      allocations,
      departmentSubjects,
      user: req.user,
    });
  } catch (err) {
    // console.log(err);
    throw err;
  }
};


exports.marks = async (req, res) => {
  try {
    const teacherid = req.user.teacherid;

    const foundDepartment =
      await adminModel.findActiveHodByTeacherId(teacherid);
    const currentTerm = await adminModel.get_Open_Terms();
    const currentYear = await adminModel.get_Open_schoolYear();

    let departmentid = "";

    if (foundDepartment && foundDepartment.length > 0) {
      departmentid = foundDepartment[0].departmentid;
    }

    const termid = currentTerm[0].termid;

    const stats = {
      currentYear: currentYear[0],
      currentTerm: currentTerm[0],
    };

    const marksSchedule = []

    res.render("./hod/marks", {
      stats,
      marksSchedule,
      user: req.user,
    });
  } catch (err) {
    // console.log(err);
    throw err;
  }
};


exports.results = async (req, res) => {
  try {
    const teacherid = req.user.teacherid;

    const foundDepartment =
      await adminModel.findActiveHodByTeacherId(teacherid);
    const currentTerm = await adminModel.get_Open_Terms();
    const currentYear = await adminModel.get_Open_schoolYear();

    let departmentid = "";

    if (foundDepartment && foundDepartment.length > 0) {
      departmentid = foundDepartment[0].departmentid;
    }

    const termid = currentTerm[0].termid;

    const stats = {
      currentYear: currentYear[0],
      currentTerm: currentTerm[0],
    };


    res.render("./hod/results", {
      stats,
      user: req.user,
    });
  } catch (err) {
    // console.log(err);
    throw err;
  }
};
 