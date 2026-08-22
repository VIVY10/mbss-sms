// routes/homeRoutes.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("main/index");
});

router.get("/about", (req, res) => {
  res.render("./main/about");
});
 
module.exports = router;
