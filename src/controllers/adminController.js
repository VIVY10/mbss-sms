const { matchedData } = require("express-validator");

const model = require("../models/adminModel.js");
const subjectModel = require("../models/subjectModel.js");
const service = require("../services/adminService.js");
const { query } = require("../config/db.js");

const response = (res, message) => {
  res.render("./response/response", { message });
};

// ==================== SCHOOL YEARS ====================

exports.schoolYears = async (req, res) => {
  const results = await model.getSchoolYears();

  res.render("./admin/schoolyears", {
    results,
    user: req.user,
  });
};

exports.schoolYearPage = (req, res) => {
  res.render("./admin/schoolYear", {
    user: req.user,
  });
};

exports.createSchoolYear = async (req, res) => {
  try {
    await service.createSchoolYear(matchedData(req));
    res.redirect("./schoolyears");
  } catch (e) {
    res.redirect("./schoolyears");
  }
};

exports.deleteYear = async (req, res) => {
  try {
    await model.deleteSchoolYear(req.body.schoolyearid);
    res.redirect("/schoolYears");
  } catch (err) {
    response(res, "Database error.");
  }
};

// ==================== TERMS ====================
exports.get_terms = async (req, res) => {
  const results = await model.get_Open_Terms();
  return res.json(results);
};

exports.terms = async (req, res) => {
  const results = await model.getTerms();

  res.render("./admin/terms", {
    results,
    user: req.user,
  });
};

exports.addTermPage = async (req, res) => {
  const results = await model.getSchoolYearsBasic();

  res.render("./admin/addTerm", {
    results,
    user: req.user,
  });
};

exports.addTerm = async (req, res) => {
  try {
    await service.createTerm(matchedData(req));
    res.redirect("/terms");
  } catch (e) {
    response(res, e.message || "Database error.");
  }
};

exports.deleteTerm = async (req, res) => {
  try {
    const { termid } = req.query;
    await model.deleteTerm(termid);
    res.redirect("/terms");
  } catch {
    response(res, "Database error.");
  }
};

exports.openTerm = async (req, res) => {
  try {
    const opened_by = req.user.teacherid;
    const { termid } = req.query;

    if (!termid) {
      return response(res, "Term ID is required.");
    }

    const term = await model.getTermById(termid);

    // No term found
    if (!term || term.length === 0) {
      return response(res, "Term does not exist.");
    }

    const currentTerm = term[0];

    console.log(currentTerm.status);

    // Already open
    if (currentTerm.status === "open") {
      return response(res, "Term is already open.");
    }

    // Allow opening only if status is "closed" or "upcoming"
    if (!["closed", "upcoming"].includes(currentTerm.status)) {
      return response(res, "Term cannot be opened. Only closed or upcoming terms can be opened.");
    }

    await model.openTerm(termid, opened_by);

    return res.redirect("/terms");
  } catch (err) {
    console.error(err);

    return response(res, "Database error.");
  }
};

exports.closeTerm = async (req, res) => {
  try {
    const closed_by = req.user.id;
    const { termid } = req.query;

    if (!termid) {
      return response(res, "Term ID is required.");
    }

    const term = await model.getTermById(termid);

    // No term found
    if (!term || term.length === 0) {
      return response(res, "Term does not exist.");
    }

    const currentTerm = term[0];

    // Already open
    if (currentTerm.status === "closed") {
      return response(res, "Term is already closed.");
    }

    // Only open terms can be closed
    if (currentTerm.status !== "open") {
      return response(res, "Term cannot be closed.");
    }

    await model.closeTerm(termid, closed_by);

    return res.redirect("/terms");
  } catch (err) {
    console.error(err);

    return response(res, "Database error.");
  }
};

// ==================== CLASSES ====================

exports.classes = async (req, res) => {
  const results = await model.getClasses();

  res.render("./class/class", {
    results,
    user: req.user,
  });
};

exports.addClassPage = async (req, res) => {
  const [termData, yearLevelData] = await model.getClassOptions();

  if (!termData.length) {
    return response(
      res,
      "No School Term Registered. Create school term to create a class.",
    );
  }

  if (!yearLevelData.length) {
    return response(res, "Register School Year level First");
  }

  res.render("./class/createClass", {
    termData,
    yearLevelData,
    user: req.user,
  });
};

exports.addClass = async (req, res) => {
  try {
    await service.createClass(matchedData(req));
    res.redirect("/get_class");
  } catch (e) {
    response(res, e.message || "Database error.");
  }
};

exports.deleteClass = async (req, res) => {
  try {
    await model.deleteClass(req.body.classid);
    res.redirect("/get_class");
  } catch {
    response(res, "Database error.");
  }
};

// ==================== SUBJECTS ====================

exports.createSubjectPage = async (req, res) => {
  const results = await model.getDepartments();

  if (!results.length) {
    return res.send("There are no available departments.");
  }

  res.render("./admin/createSubject", {
    results,
    user: req.user,
  });
};

exports.createSubject = async (req, res) => {
  try {
    await service.createSubject(matchedData(req));
    res.redirect("/viewSubjects");
  } catch (e) {
    response(res, e.message || "Database error.");
  }
};

exports.viewSubjects = async (req, res) => {
  const results = await subjectModel.getAll();

  if (!results.length) {
    return res.send("No subjects found");
  }

  res.render("./admin/viewSubjects", {
    results,
    user: req.user,
  });
};

exports.deleteSubject = async (req, res) => {
  try {
    await subjectModel.deleteByCode(req.body.subjectcode);
    res.redirect("/viewSubjects");
  } catch {
    response(res, "Database error.");
  }
};

// ==================== DEPARTMENTS ====================

exports.createDepartmentPage = (req, res) => {
  res.render("./admin/createDepartment", {
    user: req.user,
  });
};

exports.createDepartment = async (req, res) => {
  try {
    const { departmentname } = matchedData(req);

    await service.createDepartment(departmentname);

    res.redirect("/viewDepartment");
  } catch (e) {
    response(res, e.message || "Database error.");
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await model.deleteDepartment(req.body.departmentid);
    res.redirect("/viewDepartment");
  } catch {
    response(res, "Database error.");
  }
};

exports.viewDepartment = async (req, res) => {
  const results = await model.getDepartments();

  res.render("./admin/viewDepartment", {
    results,
    user: req.user,
  });
};

// ==================== HOD ====================

exports.createHodPage = async (req, res) => {
  const [hod, department] = await model.getHodOptions();

  if (!hod.length || !department.length) {
    return response(res, "No teachers in the system yet. Register More teachers")
  }

  res.render("./hod/createHod", {
    hod,
    department,
    user: req.user,
  });
};

exports.createHod = async (req, res) => {
  // const data = matchedData(req);
  const data = req.body;

  try {
    await service.createHod(data.hod, data.department);

    res.redirect("/Dashboard");
  } catch {
    res.redirect("/Dashboard");
  }
};

exports.viewHod = async (req, res) => {
  const results = await model.getHods();

  if (!results.length) {
    return response(res, "No HOD found");
  }
  res.render("./hod/viewHod", {
    results,
    user: req.user,
  });
};

// ==================== DEPARTMENT ALLOCATION ====================

exports.allocateDepartmentPage = async (req, res) => {
  const [foundTeacher, foundDepartment] =
    await model.getTeacherAllocationOptions();

  if (!foundTeacher.length) {
    return res.send("No Teachers in the system");
  }

  if (!foundDepartment.length) {
    return res.redirect("/Dashboard");
  }

  res.render("./admin/allocateTrDepartment", {
    foundTeacher,
    foundDepartment,
    user: req.user,
  });
};

exports.allocateDepartment = async (req, res) => {
  // const data = matchedData(req);
  const data = req.body;

  try {
    await service.allocateDepartment(data.teacher, data.department);

    res.redirect("/allocateDepartment");
  } catch {
    res.redirect("/allocateDepartment");
  }
};

exports.viewDepartmentTeachers = async (req, res) => {
  const departments = await model.getDepartmentTeachers(req.user.id);

  if (!departments.length) {
    return response(res, "You have not been allocated to a department.");
  }

  const results = await model.getTeachersInDepartment(
    departments[0].departmentname,
  );

  if (!results.length) {
    return res.send(
      "No Teachers allocated to your department. Contact your system Admin.",
    );
  }

  res.render("./hod/viewHod", {
    results,
    user: req.user,
  });
};

// ==================== GUARDIAN TYPES ====================

exports.addGuardianTypePage = (req, res) => {
  res.render("./admin/createGuardianType", {
    user: req.user,
  });
};

exports.addGuardianType = async (req, res) => {
  const { guardianType } = matchedData(req);

  if ((await model.findGuardianType(guardianType)).length) {
    return response(res, "Guardian Type exists.");
  }

  try {
    await model.createGuardianType(guardianType);
    res.redirect("/viewGuardianType");
  } catch {
    response(res, "Database error.");
  }
};

exports.viewGuardianType = async (req, res) => {
  try {
    const results = await model.getGuardianTypes();

    res.render("./admin/guardianType", {
      results,
      user: req.user,
    });
  } catch {
    response(res, "Database error.");
  }
};

exports.deleteGuardianType = async (req, res) => {
  try {
    await model.deleteGuardianType(req.body.guardiantypeid);

    res.redirect("/viewGuardianType");
  } catch {
    response(res, "Database error.");
  }
};

// ==================== CLASS SUBJECTS ====================

exports.addClassSubjectsPage = async (req, res) => {
  const foundSubject = await subjectModel.getSubjects();
  const foundClass = await model.getClasses();

  if (!foundClass.length) {
    return response(res, "No class record found");
  }

  if (!foundSubject.length) {
    return response(res, "Subject Record not found");
  }

  res.render("./class/addClassSubjects", {
    foundClass,
    foundSubject,
    user: req.user,
  });
};

exports.addClassSubjects = async (req, res) => {
  const data = matchedData(req);

  try {
    await service.addClassSubject(data.classid, data.subjectcode);

    res.redirect("/viewClassSubjects");
  } catch (e) {
    response(res, e.message || "Insertion database error");
  }
};

exports.viewClassSubjects = async (req, res) => {
  try {
    const results = await subjectModel.getClassSubjects();

    res.render("./admin/viewClassSubjects", {
      results,
      user: req.user,
    });
  } catch (err) {
    // console.log(err)
    response(res, "Database error");
  }
};

exports.unallocatedSubjects = async (req, res) => {
  const { termid } = req.query;

  const results = await subjectModel.getUnallocatedClassSubjects(termid);

  if (!results.length) {
    return response(
      res,
      "Subjects not allocated to Classes yet. Add Subjects to respective classes",
    );
  }

  res.render("./admin/unallocatedClassSubjects", {
    results,
    user: req.user,
  });
};

exports.classAllocation = async (req, res) => {
  const { termid } = req.query;

  const results = await subjectModel.getAllocatedClassSubjects(termid);

  if (!results.length) {
    return response(
      res,
      "Subjects not allocated to teachers yet. Consult HODs",
    );
  }

  res.render("./admin/subjectAllocation", {
    results,
    user: req.user,
  });
};

exports.deleteClassSubject = async (req, res) => {
  try {
    await subjectModel.deleteClassSubject(req.body.class_subject_id);

    res.redirect("/viewClassSubjects");
  } catch (err) {
    console.log(err);
    response(res, "Database error.");
  }
};
