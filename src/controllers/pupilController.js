const pupilService = require("../services/pupilService.js");
const pupilModel = require("../models/pupilModel.js");

// ==================== DIRECTORIES ====================
const path = require("path");
const { matchedData } = require("express-validator");

const profileDirectory = path.join(__dirname, "../public/images/profile");

const backupDirectory = path.join(__dirname, "../public/images/backup");

// ==================== CHECK EXAM NUMBER ====================

exports.checkExamNo = async (req, res) => {
  const { examno } = matchedData(req);

  const results = await pupilModel.findByExamNo(examno);

  if (results.length) {
    return res.send(
      "<span style='color:red'> Sorry student already exists.</span> " +
        "<script>$('#next1').prop('disabled',true);</script>",
    );
  }

  return res.send(
    "<span style='color:green'> Student available for Registration.</span> " +
      "<script>$('#next1').prop('disabled',false);</script>",
  );
};

// ==================== REGISTRATION ====================

exports.showRegistration = async (req, res) => {
  const data = await pupilService.getRegistrationData();

  if (Object.values(data).some((value) => !value?.length)) {
    return res.redirect("/Dashboard");
  }

  return res.render("./pupil/register.ejs", {
    ...data,
    user: req.user,
  });
};

exports.register = async (req, res) => {
  const data = matchedData(req).toLower();

  const result = await pupilService.registerPupil({
    data,
    file: req.file,
    profileDirectory,
  });

  return res.status(200).json(result);
};

// ==================== VIEW PUPILS ====================

exports.viewPupils = async (req, res) => {
  const results = await pupilModel.getAll();
  
  return res.render("./pupil/searchList", {
    results,
    user: req.user,
  });
};

exports.searchPage = (req, res) => {
  return res.render("./pupil/searchPupil", {
    user: req.user,
  });
};

exports.searchPupil = async (req, res) => {
  const { examno } = matchedData(req);

  const results = await pupilModel.search(examno);

  return res.render("./pupil/searchList", {
    results,
    user: req.user,
  });
};

// ==================== EDIT PUPIL ====================

exports.editPage = async (req, res) => {
  const [
    foundClass,
    guardiantype,
    schoolyear,
    yearlevel,
    studentstatus,
    sponsor,
    ovcstatus,
    studentData,
  ] = await pupilModel.getEditData(req.params.id);

  if (
    ![
      foundClass,
      guardiantype,
      schoolyear,
      yearlevel,
      studentstatus,
      sponsor,
      ovcstatus,
      studentData,
    ].every((value) => value.length)
  ) {
    return res.redirect("/Dashboard");
  }

  return res.render("./pupil/updatePupilRecord.ejs", {
    guardiantype,
    foundClass,
    schoolyear,
    yearlevel,
    studentstatus,
    sponsor,
    ovcstatus,
    studentData,
    user: req.user,
  });
};

// ==================== UPDATE PUPIL ====================

exports.update = async (req, res) => {
  const data = matchedData(req);

  await pupilService.updatePupil(data);

  return res.status(200).json({
    message: "Student record successfully updated",
  });
};

// ==================== DELETE PUPIL ====================

exports.deletePupil = async (req, res) => {
  await pupilService.deletePupil(
    req.params.id,
    profileDirectory,
    backupDirectory,
  );

  return res.redirect("/viewPupils");
};
