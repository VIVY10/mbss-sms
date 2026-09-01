const dashboardViews = require("../config/dashboardViews");
const adminModel = require("../models/adminModel");
const { countUnallocatedSubjects } = require("../models/dashboardModel");
const dashboardService = require("../services/dashboardService");

exports.showDashboard = async (req, res) => {
  const user = req.user;

  let dashboard;

  if (user.usertype === "admin") {
    dashboard = dashboardViews.admin;
  } else {
    const teacher = await adminModel.findActiveHodByTeacherId(user.teacherid);

    // console.log(teacher);

    // Check if teacher exists and has hod_id
    if (teacher.length > 0 && teacher[0].hod_id) {
      dashboard = dashboardViews.HOD;
    } else {
      dashboard = dashboardViews["teacher"];
    }
  }

  if (!dashboard) {
    return res.redirect("/");
  }

  const stats = dashboard.getStats ? await dashboard.getStats(user) : {};

  return res.render(dashboard.view, {
    [dashboard.dataKey]: user,

    stats,
  });
};

exports.getHodDashboardStats = async (teacherid) => {
  try {
    const foundDepartment =
      await adminModel.findActiveHodByTeacherId(teacherid);
    const currentTerm = await adminModel.get_Open_Terms();
    const currentYear = await adminModel.get_Open_schoolYear();

    let departmentid = "";

    if (foundDepartment && foundDepartment.length > 0) {
      departmentid = foundDepartment[0].departmentid;
    }

    const termid = currentTerm[0].termid;

    const results = await dashboardService.getHodDashboardStats(
      departmentid,
      termid,
    );

    const stats = {
      teachers: results["teachers"][0].teachers,
      subjects: results["subjects"][0].subjects,
      classSubjects: results["classSubjects"][0].classSubjects,
      unallocatedSubjects:
        results["unallocatedSubjects"][0].unallocatedSubjects,
      departmentTeachers: results["departmentTeachers"],
      classStatuses: results["class_subjects"],

      currentYear: currentYear[0],
      currentTerm: currentTerm[0],
    };

    return stats;
  } catch (err) {
    console.log(err);
    throw err;
  }
};


exports.getTeacherDashboardStats = async (teacherid) => {
  try{
    const stats = await dashboardService.getTeacherDashboardStats(teacherid)
    // console.log(stats)

    return stats;

  } catch(err){
    console.log(err)
    throw err;
  }

}

exports.ourTeam = (req, res) => {
  res.render("./main/ourteam");
};

exports.gallery = (req, res) => {
  res.render("./main/gallery");
};

exports.academics = (req, res) => {
  res.render("./main/academic");
};
