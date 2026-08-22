// const userController = require('../controllers/userController');
// const schoolController = require('../controllers/schoolController');
// const districtController = require('../controllers/districtController');
// const attendanceController = require('../controllers/attendanceController')
// const assignmentController = require('../controllers/assignmentController');
// const reportController = require('../controllers/reportController');
const analyticsModel = require("../models/analyticsModel");
// exports.showAnalytics = async (req, res) => {
//   try {
//     const user_id = req.user.user_id;
//     const user = await userController.getUserById(user_id);
//     let districtUser = '';

//     if (user.category_name === 'DISTRICT') {
//       districtUser = await userController.getDistrictUsersById(user_id)
//     }

//     //deso or  district admin dashboard data
//     const districtSchools = await schoolController.countDistrictSchools(districtUser.district_id);
//     const districtUsers = await districtController.districtUsers(districtUser.district_id)
//     const todaysAttendance = await attendanceController.todayAttendanceDistrictSummary(districtUser.district_id)
//     const activeAssignmentsCount = await assignmentController.getActiveAssignmentsCount(1, districtUser.district_id);
//     const completedAssignmentsCount = await assignmentController.countCompletedAssignments(0, districtUser.district_id);
//     const districtReportCount = await reportController.countAllDistrictReports(districtUser.district_id);

//     return res.render('analytics/analytics',{
//         user,
//         districtSchools,
//         districtUsers,
//         todaysAttendance,
//         activeAssignmentsCount,
//         completedAssignmentsCount,
//         districtReportCount
//     });

//   } catch (err) {
//       return res.status(500).json({ message: 'Error loading page', error: err });
//   }
// };

exports.getUserActivity = async (user, type, start, end) => {
  try {
    const results = await analyticsModel.logUserActivity(
      user,
      type,
      start,
      end,
    );
    return results;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getHeatmap = async (limit = 20) => {
  try {
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const results = await analyticsModel.heatmap(safeLimit);
    return results;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
