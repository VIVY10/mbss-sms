const pupilService = require("../services/pupilService.js");
const pupilModel = require("../models/pupilModel.js");

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

  // console.log(data)

  return res.render("./pupil/student-registration.ejs", {
    ...data,
    user: req.user,
  });
};

// exports.showRegistration = async (req, res) => {
//   const data = await pupilService.getRegistrationData();

//   if (Object.values(data).some((value) => !value?.length)) {
//     return res.redirect("/Dashboard");
//   }

//   return res.render("./pupil/student-registration.ejs", {
//     ...data,
//     user: req.user,
//   });
// };

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

// exports.register = async (req, res) => {
//   const data = matchedData(req);

//   const reported_by = req.user.id;
//   const reporting_status = "reported";
//   const enrollment_type = "new";

//   const result = await pupilService.registerPupil({
//     reported_by,
//     reporting_status,
//     enrollment_type,
//     data,
//     file: req.file,
//     profileDirectory,
//   });

//   return res.status(200).json(result);
// };

exports.register = async (req, res) => {
  // const data = matchedData(req);
  const data = req.body;
  //console.log(req.body)

  try {
    const reported_by = req.user.teacherid;
    const reporting_status = "reported";
    const enrollment_type = data.enrollment_type;

    let result;

    if (enrollment_type === "returning") {
      result = await pupilService.registerReturningPupil({
        reported_by,
        reporting_status,
        data,
      });
    } else {
      result = await pupilService.registerPupil({
        reported_by,
        reporting_status,
        enrollment_type,
        data,
        file: req.file,
        profileDirectory,
      });
    }

    return res.status(201).json(result);
  } catch (err) {
    console.error("Registration error:", err);

    return res.status(400).json({
      message: err.message || "Student registration failed.",
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
  const results = await pupilModel.getAll();

  return res.render("./pupil/searchList", {
    results,
    user: req.user,
  });
};

exports.students = async (req, res) => {
  const students = await pupilModel.getAll();
  console.log(students)

  return res.render("./pupil/index", {
    students,
    user: req.user,
  });
};

exports.searchPage = (req, res) => {
  return res.render("./pupil/searchPupil", {
    user: req.user,
  });
};

exports.searchStudent = async (req, res) => {
  const { examno } = req.params

  const student = await pupilModel.search(examno);

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
