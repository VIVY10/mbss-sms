const dashboardViews = require("../config/dashboardViews");

exports.showDashboard = (req, res) => {
    const user = req.user;

    const dashboard = dashboardViews[req.user.usertype];
    

    if (!dashboard) {
        return res.redirect("/login");
    }

    return res.render(dashboard.view, {
        [dashboard.dataKey]: user
    });
};

// exports.studentDashboard = (req, res) => {
//   if (
//     req.isAuthenticated?.() &&
//     req.user?.usertype === 'Student'
//   ) {
//     return res.render('./pupil/pupilDashboard', {
//       pupil: req.user
//     });
//   }

//   res.redirect('/studentLogin');
// };

exports.ourTeam = (req, res) => {
  res.render('./main/ourteam');
};

exports.gallery = (req, res) => {
  res.render('./main/gallery');
};

exports.academics = (req, res) => {
  res.render('./main/academic');
};