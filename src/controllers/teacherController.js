const { matchedData } = require("express-validator");

const teacherModel = require("../models/teacherModel.js");
const teacherService = require("../services/teacherService.js");
const adminModel = require("../models/adminModel.js");
const subjectModel = require("../models/subjectModel.js");
// ==================== DIRECTORIES ====================
const path = require("path");

const profileDirectory = path.join(__dirname, "../../public/images/profile");

const backupDirectory = path.join(__dirname, "../../public/images/backup");

// ==================== TEACHER REGISTRATION ====================

exports.showRegistration = (req, res) => {
  res.render("./teacher/registerTeacher.ejs", {
    user: req.user,
  });
};

exports.register = async (req, res) => {
  await teacherService.registerTeacher({
    data: matchedData(req),
    file: req.file,
  });

  res.redirect("/registerTeacher");
};

// ==================== TEACHERS ====================

exports.viewTeachers = async (req, res) => {
  const teachers = await teacherModel.getAll();
  const total = [];

  res.render("./teacher/index", {
    teachers,
    user: req.user,
  });
};

exports.findTeacher = async (req, res) => {
  const { teacherid } = req.params;

  const [teacher] = await teacherModel.findById(teacherid);
  const departments = await teacherModel.findTeacherDepartment(teacherid);
  const subjects = await teacherModel.getTeacherSubjects(teacherid);
  const allocations = await teacherModel.getTeacherSubjectAllocations(teacherid);
  const allocationHistory = [];
  const availableClasses = [];
  const availableClassSubjects = await subjectModel.getClassSubjects();
  const availableDepartments = await adminModel.getDepartments();
  const availableSubjects = await subjectModel.getAll();

  const teacherSubjectCodes = new Set(
    subjects.map((ts) => ts.subjectcode),
  );

  const availableTeacherClassSubjects = availableClassSubjects.filter((cs) =>
    teacherSubjectCodes.has(cs.subjectcode),
  );

  res.render("./teacher/teacher-profile", {
    teacher,
    departments,
    subjects,
    allocations,
    allocationHistory,
    availableClasses,
    availableTeacherClassSubjects,
    availableDepartments,
    availableSubjects,
    user: req.user,
  });
};

exports.viewTeachers2 = async (req, res) => {
  const results = await teacherModel.getAll();

  res.render("./teacher/viewRegTeachers", {
    results,
    user: req.user,
  });
};

// ==================== SUBJECTS TAUGHT ====================
exports.createTeachingAllocation = async (req, res) => {
    try {
        const { teacherid, class_subject_id } = req.body;

        // Get the currently open term
        const foundTerm = await adminModel.get_Open_Terms();

        if (!foundTerm || foundTerm.length === 0) {
            return res.status(400).json({
                success: false,
                message: "There is currently no open term."
            });
        }

        const termid = foundTerm[0].termid;

        // Create teaching allocation
        const result = await teacherService.create_teaching_allocations(
            teacherid,
            class_subject_id,
            termid,
            req.user.teacherid
        );

        return res.status(result.status).json(result);

    } catch (err) {
        console.error("Create teaching allocation error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to create teaching allocation."
        });
    }
};


exports.subjectsTaught = async (req, res) => {
  const response = await teacherModel.getSubjectsTaught(req.user.id);

  if (!response.length) {
    return res.send("No subjects allocated for you");
  }

  res.render("./teacher/checkSubjectsTaught", {
    response,
    user: req.user,
  });
};

// ==================== UNALLOCATED SUBJECT ALLOCATION ====================

exports.unallocatedSubjectAllocation = async (req, res) => {
  const { department, records } = await teacherService.getSubjectAllocation(
    req.user.id,
    false,
  );

  if (!department) {
    return res.send("No Department Found");
  }

  if (!records.length) {
    return res.send("Done with allocation. Check your allocation");
  }

  res.render("./pupil/allocateClass", {
    foundClass: records,
    user: req.user,
    teacher: false,
  });
};

// ==================== SUBJECT ALLOCATION ====================

exports.subjectAllocation = async (req, res) => {
  const { department, records } = await teacherService.getSubjectAllocation(
    req.user.id,
    true,
  );

  if (!department) {
    return res.render("./response/response", {
      message: "You have not been allocated Department yet. Confirm with Admin",
    });
  }

  if (!records.length) {
    return res.send(
      "<h1>You have not yet allocated classes. Allocate teachers Subjects</h1>",
    );
  }

  res.render("./pupil/allocateClass", {
    foundClass: records,
    user: req.user,
  });
};

// ==================== ALLOCATE SUBJECT ====================
exports.assignTeacherSubject = async (req, res) => {
  const { teacherid, subjectcode } = req.body;
  const approved_by = req.user.teacherid;

  try {
    const result = await teacherService.assignSubject(
      teacherid,
      subjectcode,
      approved_by,
    );

    return res.status(result.status).json({
      teacherid: teacherid,
      success: result.success,
      message: result.message,
    });
  } catch (err) {
    console.error("Subject allocation error:", err);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while allocating the subject.",
    });
  }
};

// ==================== REGISTERED PUPILS ====================

exports.registeredPupils = async (req, res) => {
  const { subjectcode, classid } = req.body;

  const results = await teacherModel.getRegisteredPupils(subjectcode, classid);

  res.render("./pupil/studentSubjectList", {
    results,
    user: req.user,
  });
};

// ==================== DELETE TEACHER ====================

exports.softDeleteTeachers = async (req, res) => {
  await teacherService.softDeleteTeacher(
    req.query.teacherid
  );
  res.redirect("/viewTeachers");
};

// ==================== UPDATE TEACHER ====================

exports.updateTeacher = (req, res) => {
  if (req.user?.userType === "HOD" || req.user?.usertype === "HOD") {
    return res.status(501).send("Teacher update is not implemented.");
  }

  return res.redirect("/login");
};

// ==================== LOCK TEACHER ACCOUNT ====================
exports.lockTeacherAccount = async (req, res, next) => {
  try {
    const { username } = req.query;

    await teacherService.lockAccount(req, res, username);

    return res.redirect("/viewTeachers");
  } catch (error) {
    req.flash("error", error.message);
    return res.redirect("/viewTeachers");
  }
};

// ==================== UNLOCK TEACHER ACCOUNT ====================
exports.unlockTeacherAccount = async (req, res, next) => {
  try {
    const { username } = req.query;

    await teacherService.unlockAccount(username);

    return res.redirect("/viewTeachers");
  } catch (error) {
    console.log(error);

    return res.redirect("/viewTeachers");
  }
};
 