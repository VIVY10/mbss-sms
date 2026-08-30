const dashboardViews = require("../config/dashboardViews");

exports.showDashboard = (req, res) => {
    const user = req.user;
    let dashboard = "";

    if(req.user.usertype === 'admin'){
      dashboard = dashboardViews['admin'];   
    }

    // const getHod = await 
     

    if (!dashboard) {
        return res.redirect("/login");
    }

    return res.render(dashboard.view, {
        [dashboard.dataKey]: user
    });
};

exports.ourTeam = (req, res) => {
  res.render('./main/ourteam');
};

exports.gallery = (req, res) => {
  res.render('./main/gallery');
};

exports.academics = (req, res) => {
  res.render('./main/academic');
};