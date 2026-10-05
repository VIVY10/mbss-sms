// const dashboardViews = require("../config/dashboardViews");
// const adminModel = require("../models/adminModel");
// // const { countUnallocatedSubjects } = require("../models/dashboardModel");
// const examService = require("../services/examService.js");
// const subjectModel = require("../models/subjectModel.js");
// const hodService = require("../services/hodService.js");

// exports.showHodClasses = async (req, res) => {
//   const user = req.user;

//   const dashboard = dashboardViews["teacher"];

//   if (!dashboard) {
//     return res.redirect("/");
//   }

//   const stats = dashboard.getStats ? await dashboard.getStats(user) : {};

//   return res.render(dashboard.view, {
//     [dashboard.dataKey]: user,

//     stats,
//   });
// };

// exports.departmentTeachers = async (req, res) => {
//   try {
//     const teacherid = req.user.teacherid;

//     const foundDepartment =
//       await adminModel.findActiveHodByTeacherId(teacherid);
//     const currentTerm = await adminModel.get_Open_Terms();
//     const currentYear = await adminModel.get_Open_schoolYear();

//     let departmentid = "";

//     if (foundDepartment && foundDepartment.length > 0) {
//       departmentid = foundDepartment[0].departmentid;
//     }

//     const termid = currentTerm[0].termid;

//     const stats = {
//       currentYear: currentYear[0],
//       currentTerm: currentTerm[0],
//     };

//     const departmentTeachers = await hodService.getdepartmentTeachers(
//       departmentid,
//       termid,
//     );

//     res.render("./hod/teachers", {
//       stats,
//       departmentTeachers,
//       user: req.user,
//     });
//   } catch (err) {
//     throw err;
//   }
// };

// exports.subjectAllocations = async (req, res) => {
//   try {
//     const teacherid = req.user.teacherid;

//     const foundDepartment =
//       await adminModel.findActiveHodByTeacherId(teacherid);
//     const currentTerm = await adminModel.get_Open_Terms();
//     const currentYear = await adminModel.get_Open_schoolYear();

//     let departmentid = "";

//     if (foundDepartment && foundDepartment.length > 0) {
//       departmentid = foundDepartment[0].departmentid;
//     }

//     const termid = currentTerm[0].termid;

//     const stats = {
//       currentYear: currentYear[0],
//       currentTerm: currentTerm[0],
//     };

//     const allocations = await hodService.getClassAllocations(
//       termid,
//       departmentid,
//     );

//     const subjectsWithoutTeacherAllocations = allocations.filter(
//       (item) => item.allocation_status === "Not Allocated",
//     );

//     res.render("./hod/subject-allocations", {
//       stats,
//       allocations,
//       subjectsWithoutTeacherAllocations,
//       user: req.user,
//     });
//   } catch (err) {
//     throw err;
//   }
// };

// exports.classSubjects = async (req, res) => {
//   try {
//     const teacherid = req.user.teacherid;

//     const foundDepartment =
//       await adminModel.findActiveHodByTeacherId(teacherid);
//     const currentTerm = await adminModel.get_Open_Terms();
//     const currentYear = await adminModel.get_Open_schoolYear();

//     let departmentid = "";

//     if (foundDepartment && foundDepartment.length > 0) {
//       departmentid = foundDepartment[0].departmentid;
//     }

//     const termid = currentTerm[0].termid;

//     const stats = {
//       currentYear: currentYear[0],
//       currentTerm: currentTerm[0],
//     };

//     const allocations = await hodService.getClassAllocations(
//       termid,
//       departmentid,
//     );

//     const departmentSubjects = await subjectModel.getDepartmentSubjects(departmentid)

//     res.render("./hod/department-subjects", {
//       stats,
//       allocations,
//       departmentSubjects,
//       user: req.user,
//     });
//   } catch (err) {
//     throw err;
//   }
// };


// exports.marks = async (req, res) => {
//   try {
//     const teacherid = req.user.teacherid;

//     const foundDepartment =
//       await adminModel.findActiveHodByTeacherId(teacherid);
//     const currentTerm = await adminModel.get_Open_Terms();
//     const currentYear = await adminModel.get_Open_schoolYear();

//     let departmentid = "";

//     if (foundDepartment && foundDepartment.length > 0) {
//       departmentid = foundDepartment[0].departmentid;
//     }

//     const termid = currentTerm[0].termid;

//     const stats = {
//       currentYear: currentYear[0],
//       currentTerm: currentTerm[0],
//     };

//     const marksSchedule = []

//     res.render("./hod/marks", {
//       stats,
//       marksSchedule,
//       user: req.user,
//     });
//   } catch (err) {
//     throw err;
//   }
// };


// exports.results = async (req, res) => {
//   try {
//     const teacherid = req.user.teacherid;

//     const foundDepartment =
//       await adminModel.findActiveHodByTeacherId(teacherid);
//     const currentTerm = await adminModel.get_Open_Terms();
//     const currentYear = await adminModel.get_Open_schoolYear();

//     let departmentid = "";

//     if (foundDepartment && foundDepartment.length > 0) {
//       departmentid = foundDepartment[0].departmentid;
//     }

//     const termid = currentTerm[0].termid;

//     const allocations = await hodService.getClassAllocations(
//       termid,
//       departmentid,
//     );

//     const examtype = await examService.getExams()

//     const stats = {
//       currentYear: currentYear,
//       currentTerm: currentTerm,
//       allocations: allocations,
//       examtype: examtype
//     };

//     res.render("./hod/results", {
//       stats,
//       user: req.user,
//     });
//   } catch (err) {
//     throw err;
//   }
// };


// exports.getResults = async(req, res) => {
//   const {examno, schoolyear, termid,  classid, examid, subjectcode} = req.query

//   const results = await hodService.getResults(schoolyear, termid, subjectcode, classid, examid, examno)

//   return res.status(201).json(results)
// }
 

const dashboardViews = require("../config/dashboardViews");
const adminModel = require("../models/adminModel");
const examService = require("../services/examService.js");
const subjectModel = require("../models/subjectModel.js");
const hodService = require("../services/hodService.js");


async function getHodDepartment(teacherid) {
  if (!teacherid) {
    return null;
  }

  const foundDepartment =
    await adminModel.findActiveHodByTeacherId(teacherid);

  if (!Array.isArray(foundDepartment) || foundDepartment.length === 0) {
    return null;
  }

  return foundDepartment[0];
}


async function getCurrentTerm() {
  const currentTerm = await adminModel.get_Open_Terms();

  if (!Array.isArray(currentTerm) || currentTerm.length === 0) {
    return null;
  }

  return currentTerm[0];
}


async function getCurrentSchoolYear() {
  const currentYear = await adminModel.get_Open_schoolYear();

  if (!Array.isArray(currentYear) || currentYear.length === 0) {
    return null;
  }

  return currentYear[0];
}


exports.showHodClasses = async (req, res) => {
  const user = req.user;

  const dashboard = dashboardViews["teacher"];

  if (!dashboard) {
    return res.redirect("/");
  }

  const stats = dashboard.getStats
    ? await dashboard.getStats(user)
    : {};

  return res.render(dashboard.view, {
    [dashboard.dataKey]: user,
    stats,
  });
};


exports.departmentTeachers = async (req, res) => {
  try {
    const teacherid = req.user?.teacherid;

    if (!teacherid) {
      return res.status(401).send("Unauthorized");
    }

    const department = await getHodDepartment(teacherid);
    const currentTerm = await getCurrentTerm();
    const currentYear = await getCurrentSchoolYear();

    if (!department) {
      return res.status(403).send(
        "No active department assignment was found for this HOD."
      );
    }

    if (!currentTerm) {
      return res.status(503).send(
        "There is currently no open academic term."
      );
    }

    if (!currentYear) {
      return res.status(503).send(
        "There is currently no open school year."
      );
    }

    const termid = department.termid || currentTerm.termid;

    const stats = {
      currentYear,
      currentTerm,
    };

    const departmentTeachers =
      await hodService.getdepartmentTeachers(
        department.departmentid,
        termid
      );

    return res.render("./hod/teachers", {
      stats,
      departmentTeachers,
      user: req.user,
    });

  } catch (err) {
    console.error("HOD department teachers error:", err);

    return res.status(500).send(
      "Unable to load department teachers."
    );
  }
};


exports.subjectAllocations = async (req, res) => {
  try {
    const teacherid = req.user?.teacherid;

    if (!teacherid) {
      return res.status(401).send("Unauthorized");
    }

    const department = await getHodDepartment(teacherid);
    const currentTerm = await getCurrentTerm();
    const currentYear = await getCurrentSchoolYear();

    if (!department) {
      return res.status(403).send(
        "No active department assignment was found for this HOD."
      );
    }

    if (!currentTerm) {
      return res.status(503).send(
        "There is currently no open academic term."
      );
    }

    if (!currentYear) {
      return res.status(503).send(
        "There is currently no open school year."
      );
    }

    const termid = currentTerm.termid;

    const stats = {
      currentYear,
      currentTerm,
    };

    const allocations =
      await hodService.getClassAllocations(
        termid,
        department.departmentid
      );

    const safeAllocations =
      Array.isArray(allocations)
        ? allocations
        : [];

    const subjectsWithoutTeacherAllocations =
      safeAllocations.filter(
        (item) =>
          item.allocation_status === "Not Allocated"
      );

    return res.render("./hod/subject-allocations", {
      stats,
      allocations: safeAllocations,
      subjectsWithoutTeacherAllocations,
      user: req.user,
    });

  } catch (err) {
    console.error("HOD subject allocations error:", err);

    return res.status(500).send(
      "Unable to load subject allocations."
    );
  }
};


exports.classSubjects = async (req, res) => {
  try {
    const teacherid = req.user?.teacherid;

    if (!teacherid) {
      return res.status(401).send("Unauthorized");
    }

    const department = await getHodDepartment(teacherid);
    const currentTerm = await getCurrentTerm();
    const currentYear = await getCurrentSchoolYear();

    if (!department) {
      return res.status(403).send(
        "No active department assignment was found for this HOD."
      );
    }

    if (!currentTerm) {
      return res.status(503).send(
        "There is currently no open academic term."
      );
    }

    if (!currentYear) {
      return res.status(503).send(
        "There is currently no open school year."
      );
    }

    const termid = currentTerm.termid;

    const stats = {
      currentYear,
      currentTerm,
    };

    const allocations =
      await hodService.getClassAllocations(
        termid,
        department.departmentid
      );

    const safeAllocations =
      Array.isArray(allocations)
        ? allocations
        : [];

    const departmentSubjects =
      await subjectModel.getDepartmentSubjects(
        department.departmentid
      );

    return res.render("./hod/department-subjects", {
      stats,
      allocations: safeAllocations,
      departmentSubjects: Array.isArray(departmentSubjects)
        ? departmentSubjects
        : [],
      user: req.user,
    });

  } catch (err) {
    console.error("HOD class subjects error:", err);

    return res.status(500).send(
      "Unable to load department subjects."
    );
  }
};


exports.marks = async (req, res) => {
  try {
    const teacherid = req.user?.teacherid;

    if (!teacherid) {
      return res.status(401).send("Unauthorized");
    }

    const department = await getHodDepartment(teacherid);
    const currentTerm = await getCurrentTerm();
    const currentYear = await getCurrentSchoolYear();

    if (!department) {
      return res.status(403).send(
        "No active department assignment was found for this HOD."
      );
    }

    if (!currentTerm) {
      return res.status(503).send(
        "There is currently no open academic term."
      );
    }

    if (!currentYear) {
      return res.status(503).send(
        "There is currently no open school year."
      );
    }

    const stats = {
      currentYear,
      currentTerm,
    };

    const marksSchedule = [];

    return res.render("./hod/marks", {
      stats,
      marksSchedule,
      user: req.user,
    });

  } catch (err) {
    console.error("HOD marks page error:", err);

    return res.status(500).send(
      "Unable to load marks page."
    );
  }
};


exports.results = async (req, res) => {
  try {
    const teacherid = req.user?.teacherid;

    if (!teacherid) {
      return res.status(401).send("Unauthorized");
    }

    const department = await getHodDepartment(teacherid);
    const currentTerm = await getCurrentTerm();
    const currentYear = await getCurrentSchoolYear();

    if (!department) {
      return res.status(403).send(
        "No active department assignment was found for this HOD."
      );
    }

    if (!currentTerm) {
      return res.status(503).send(
        "There is currently no open academic term."
      );
    }

    if (!currentYear) {
      return res.status(503).send(
        "There is currently no open school year."
      );
    }

    const termid = currentTerm.termid;

    const allocations =
      await hodService.getClassAllocations(
        termid,
        department.departmentid
      );

    const examtype = await examService.getExams();

    const stats = {
      currentYear: Array.isArray(currentYear) ? currentYear : [currentYear],
      currentTerm: Array.isArray(currentTerm) ? currentTerm : [currentTerm],
      allocations: Array.isArray(allocations)
        ? allocations
        : [],
      examtype: Array.isArray(examtype)
        ? examtype
        : [],
    };

    return res.render("./hod/results", {
      stats,
      user: req.user,
    });

  } catch (err) {
    console.error("HOD results page error:", err);

    return res.status(500).send(
      "Unable to load results page."
    );
  }
};



exports.getResults = async (req, res) => {
  try {
    // ---------------------------------------------------------
    // Authentication safety
    // ---------------------------------------------------------

    const teacherid = req.user?.teacherid;

    if (!teacherid) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    // ---------------------------------------------------------
    // Validate request parameters
    // ---------------------------------------------------------

    const {
      examno,
      schoolyear,
      termid,
      classid,
      examid,
      subjectcode,
    } = req.query;

    if (!schoolyear) {
      return res.status(400).json({
        success: false,
        message: "School year is required.",
      });
    }

    if (!termid) {
      return res.status(400).json({
        success: false,
        message: "Term is required.",
      });
    }

    if (!classid) {
      return res.status(400).json({
        success: false,
        message: "Class is required.",
      });
    }

    if (!subjectcode) {
      return res.status(400).json({
        success: false,
        message: "Subject is required.",
      });
    }

    if (!examid) {
      return res.status(400).json({
        success: false,
        message: "Examination is required.",
      });
    }

    // ---------------------------------------------------------
    // Numeric validation
    // ---------------------------------------------------------

    const schoolyearId = Number(schoolyear);
    const termId = Number(termid);
    const classId = Number(classid);
    const examId = Number(examid);

    if (
      !Number.isInteger(schoolyearId) ||
      schoolyearId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid school year.",
      });
    }

    if (
      !Number.isInteger(termId) ||
      termId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid term.",
      });
    }

    if (
      !Number.isInteger(classId) ||
      classId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid class.",
      });
    }

    if (
      !Number.isInteger(examId) ||
      examId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid examination.",
      });
    }

    // ---------------------------------------------------------
    // Validate subject
    // ---------------------------------------------------------

    const cleanSubjectcode =
      typeof subjectcode === "string"
        ? subjectcode.trim()
        : "";

    if (!cleanSubjectcode) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject.",
      });
    }

    // ---------------------------------------------------------
    // Optional pupil number
    // ---------------------------------------------------------

    let cleanExamno = null;

    if (
      examno !== undefined &&
      examno !== null &&
      String(examno).trim() !== ""
    ) {
      cleanExamno = String(examno).trim();

      // Basic length protection
      if (cleanExamno.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Invalid pupil examination number.",
        });
      }
    }

    // ---------------------------------------------------------
    // Verify that the requester is actually an active HOD
    // ---------------------------------------------------------

    const department =
      await getHodDepartment(teacherid);

    if (!department) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned as an active Head of Department.",
      });
    }

    // ---------------------------------------------------------
    // Verify requested term belongs to current/open context
    // ---------------------------------------------------------

    const currentTerm =
      await getCurrentTerm();

    if (!currentTerm) {
      return res.status(503).json({
        success: false,
        message:
          "There is currently no open academic term.",
      });
    }

    // ---------------------------------------------------------
    // Get results
    // ---------------------------------------------------------

    const results = await hodService.getResults(
      schoolyearId,
      termId,
      cleanSubjectcode,
      classId,
      examId,
      cleanExamno
    );

    // ---------------------------------------------------------
    // No results
    // ---------------------------------------------------------

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No results found.",
        results: [],
      });
    }

    // ---------------------------------------------------------
    // Successful response
    // ---------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Results retrieved successfully.",
      results,
    });

  } catch (err) {
    console.error("HOD get results error:", err);

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve results at this time.",
    });
  }
};