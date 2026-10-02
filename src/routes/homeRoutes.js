// routes/homeRoutes.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("main/index");
});

router.get("/about", (req, res) => {
  res.render("./main/about");
});

router.get("/academics", (req, res) => {
  res.render("./main/academics");
});

router.get("/boarding", (req, res) => {
  res.render("./main/boarding");
});

router.get("/admissions", (req, res) => {
  res.render("./main/admissions");
});

router.get("/news", (req, res) => {
  res.render("./main/news");
});
 
module.exports = router;
