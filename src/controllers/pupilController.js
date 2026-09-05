const pupilService = require("../services/pupilService.js");
const pupilModel = require("../models/pupilModel.js");
const adminModel = require("../models/adminModel.js");

// ==================== DIRECTORIES ====================
const path = require("path");
const { matchedData } = require("express-validator");

const profileDirectory = path.join(__dirname, "../../public/images/profile");

const backupDirectory = path.join(__dirname, "../../public/images/backup");

// ==================== CHECK EXAM NUMBER ====================

exports.checkExamNo = async (req, res) => {
  const { examno } = matchedData(req);

  const results = await pupilModel.findByExamNo(examno);

  if (results.length > 0) {
    return res.send({ message: "Sorry student already exists" });
  }
  return res.send({ message: " Student available for Registration." });
};

// ==================== REGISTRATION ====================

exports.showRegistration = async (req, res) => {
  const data = await pupilService.getRegistrationData();

  if (Object.values(data).some((value) => !value?.length)) {
    return res.redirect("/Dashboard");
  }

  return res.render("./pupil/student-registration.ejs", {
    ...data,
    user: req.user,
  });
};

exports.returningPupils = async (req, res) => {
  const data = await pupilService.getRegistrationData();

  if (Object.values(data).some((value) => !value?.length)) {
    return res.redirect("/Dashboard");
  }

  return res.render("./pupil/returningPupils.ejs", {
    ...data,
    user: req.user,
  });
};

exports.register = async (req, res) => {
  const data = matchedData(req);
  try {
    const reported_by = req.user.teacherid;
    const reporting_status = "reported";
    const enrollment_type = data.enrollment_type;

    let result;

    result = await pupilService.registerPupil({
      reported_by,
      reporting_status,
      enrollment_type,
      data,
      file: req.file,
      profileDirectory,
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error("Registration error:", err);

    return res.status(400).json({
      message: err.message || "Student registration failed.",
    });
  }
};

//============ returning pupils enrollment ========================
exports.registerReturningPupil = async (req, res) => {
  console.log("returning pupil");
  const data = matchedData(req);
  console.log(data);
  // const data = req.body;
  try {
    const reported_by = req.user.teacherid;
    const reporting_status = "reported";

    let result;

    result = await pupilService.registerReturningPupil({
      reported_by,
      reporting_status,
      data,
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error("Registration error:", err);

    return res.status(400).json({
      message: err.message || "Student registration failed.",
    });
  }
};

exports.changeClass = async (req, res) => {
  console.log(req.body);
  try {
    const { previousStudentClassid, newClassid } = req.body;
    const currentEnrollment = await pupilModel.findEnrollmentByStudentClassId(
      previousStudentClassid,
    );
    const term = await adminModel.get_Open_Terms();
    const year = await adminModel.get_Open_schoolYear();

    const termid = term[0].termid;
    const yearid = year[0].schoolyearid;
    const examno = currentEnrollment[0].examno;

    const enrollment_type = "returning";
    const reporting_status = "reported";
    const reported_by = req.user.teacherid;

    const result = await pupilService.changeStudentClass(
      examno,
      termid,
      yearid,
      previousStudentClassid,
      newClassid,
      enrollment_type,
      reported_by,
      reporting_status,
    );

    return res.status(201).json(result);
  } catch (err) {
    console.error("class update error:", err);

    return res.status(400).json({
      message: err.message || "Student class change failed.",
    });
  }
};

exports.searchReturningStudent = async (req, res) => {
  try {
    const { examno } = req.query;

    if (!examno) {
      return res.status(400).json({
        message: "Examination number is required.",
      });
    }

    // const connection = await getConnection();

    const student = await pupilModel.findReturningStudent(examno);

    //  console.log(student)

    if (!student.length) {
      return res.status(404).json({
        message: "No student was found with that examination number.",
      });
    }

    res.json({
      student: student[0],
    });
  } catch (err) {
    console.error("Returning student search error:", err);

    res.status(500).json({
      message: "Unable to search for student.",
    });
  }
};

// ==================== VIEW PUPILS ====================

exports.viewPupils = async (req, res) => {
  // get current date
  const currentDate = new Date();
  // extract current year
  const currentYear = currentDate.getFullYear();

  const students = await pupilModel.getAll2();
  const schoolyear = await adminModel.getSchoolYears();
  const foundTerm = await adminModel.getTerms();
  const [openTerm] = await adminModel.get_Open_Terms();
  const foundClass = await adminModel.getClasses();
  const [stats] = await pupilModel.statistics(currentYear, openTerm.termid);

  return res.render("./pupil/index", {
    students,
    schoolyear,
    foundTerm,
    foundClass,
    stats,
    user: req.user,
  });
};

exports.searchPage = (req, res) => {
  return res.render("./pupil/searchPupil", {
    user: req.user,
  });
};

exports.studentProfile = async (req, res) => {
  const { examno } = req.params;

  const [student] = await pupilModel.search(examno);
  const [currentEnrollment] = await pupilModel.findCurrentEnrollment(examno);
  const academicHistory = await pupilModel.findEnrollmentHistory(examno);
  const guardians = await pupilModel.getStudentGuardian(examno);
  const guardian = await pupilModel.getStudentGuardian(examno);
  const availableClasses = await adminModel.getClasses();

  return res.render("./pupil/profile", {
    student,
    currentEnrollment,
    academicHistory,
    availableClasses,
    guardians,
    guardian,
    user: req.user,
  });
};

// not worked on. fix later
exports.studentHistory = async (req, res) => {
  const { examno } = req.params;

  const [student] = await pupilModel.search(examno);

  return res.render("./pupil/profile", {
    student,
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
