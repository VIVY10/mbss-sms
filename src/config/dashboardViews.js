// module.exports = {
//     admin: {
//         view: "admin/adminDashboard",
//         dataKey: "user"
//     },

//     teacher: {
//         view: "teacher/teacherDashboard",
//         dataKey: "user",
        
//     },

//     HOD: {
//         view: "hod/hod-dashboard",
//         dataKey: "user",
//     },

//     Student: {
//         view: "pupil/pupilDashboard",
//         dataKey: "pupil"
//     }
// };


const dashboardService = require("../services/dashboardService");
const dashboardController = require("../controllers/dashboardController")

module.exports = {

  admin: {
    view: "admin/adminDashboard",
    dataKey: "user",

    getStats: () =>
      dashboardService.getAdminDashboardStats()
  },

  teacher: {
    view: "teacher/teacher-dashboard",
    dataKey: "teacher",

    getStats: (teacher) =>
      dashboardController.getTeacherDashboardStats(teacher.teacherid)
  },

  HOD: {
    view: "hod/hod-dashboard",
    dataKey: "user",

    getStats: (user) =>
      dashboardController.getHodDashboardStats(user.teacherid)
  },

  Student: {
    view: "pupil/pupilDashboard",
    dataKey: "pupil",

    getStats: (user) =>
      dashboardService.getStudentDashboardStats(user.id)
  }
};