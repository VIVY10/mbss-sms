const authChecker = (req, res, next) => {
   if (req.isAuthenticated()) {
       next();
   } else {
       res.redirect("/login");
   }
};


// Middleware: Role-Based Access Control
const ensureRole = (allowedRoles) => (req, res, next) => {
    if (req.isAuthenticated() && allowedRoles.includes(req.user.usertype)) {
      return next();
    }
    req.flash("error", "Access denied. Unauthorized role.");
    res.redirect("/login");
  };
  

module.exports = {
   authChecker,
   ensureRole,
};
