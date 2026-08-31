const express = require("express");
const passport = require("passport");

const controller = require("../controllers/authController");

const router = express.Router();

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }

  return controller.showStaffLogin(req, res);
});
 
router.post(
  "/login",
  passport.authenticate("staff", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  }),
);

router.get("/studentLogin", controller.showStudentLogin);

router.post(
  "/studentLogin",
  passport.authenticate("pupil", {
    successRedirect: "/dashboard",
    failureRedirect: "/studentLogin",
    failureFlash: true,
  }),
);

router.get("/logout", controller.logout);

module.exports = router;
