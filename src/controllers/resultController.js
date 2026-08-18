const { matchedData } = require("express-validator");

const service = require("../services/resultService.js");

const resultService = require("../services/resultService");

// ==================== STUDENT RESULTS PAGE ====================

exports.page = async (req, res) => {
  const [term, year, exam] = await service.getFilters();

  if (!year.length) {
    return res.send("Error fetching support information");
  }

  if (!exam.length) {
    return res.render("./response/response", {
      message: "No record found.",
    });
  }

  res.render("./pupil/studentResults", {
    term,
    year,
    exam,
    user: req.user,
  });
};

// ==================== SEARCH RESULTS ====================

exports.search = async (req, res) => {
  const { year, term, exam } = matchedData(req);

  const results = await service.getStudentResults(
    exam,
    req.user.id,
    term,
    year,
  );

  if (!results.length) {
    return res.render("./response/response", {
      message: "Record not found.",
    });
  }

  res.render("./pupil/resultsReport1", {
    results,
    user: req.user,
  });
};

// ==================== PUPIL PROFILE ====================

exports.profile = async (req, res) => {
  const rows = await service.getProfile(req.user.id);

  if (!rows.length) {
    return res.send("No ID information");
  }

  res.render("./pupil/profileCard", {
    results: rows[0],
    pupil: req.user,
  });
};

// ==================== DELETE RESULT ====================

exports.deleteResult = async (req, res) => {
  const { id, subjectcode, examid, score } = req.body.data;

  try {
    await service.deleteResult({
      id,
      subjectcode,
      examid,
      score,
    });

    res.status(200).json("success");
  } catch (error) {
    res.status(error.status || 500).json(error.message);
  }
};

// ==================== UPDATE RESULT ====================

exports.updateResult = async (req, res) => {
  try {
    await service.updateResult(req.body);

    res.status(200).json("success");
  } catch (error) {
    res.status(error.status || 500).json(error.message);
  }
};

exports.resultsEntry = async (req, res, next) => {
  try {
    const teacherid = req.user.id;

    const { foundClass, examType } =
      await resultService.getMarksEntryData(teacherid);

    if (!foundClass.length) {
      return res.render("./response/response", {
        message: "You have not been allocated classes yet",
      });
    }

    if (!examType.length) {
      return res.render("./response/response", {
        message: "No records found",
      });
    }

    return res.render("./exam/enterMarks", {
      foundClass,
      examType,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDetails = async (req, res, next) => {
  try {
    // const data = matchedData(req);

    const { subjectcode, classid, examtype, yearid, termid } = req.body;

    const studentInfo = await resultService.getMissingMarks({
      teacherid: req.user.id,
      classid: classid,
      subjectcode: subjectcode,
      examid: examtype,
    });

    if (!studentInfo.length) {
      return res.render("./response/response", {
        message: "No Missing Marks. Register More Pupils In your Subject",
      });
    }

    return res.render("./exam/marksEntry", {
      studentInfo,
      subjectcode,
      examtype,
      yearid,
      termid,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

exports.enterMarks = async (req, res) => {
  try {
    // Extract data
    const { termid, yearid, examid, subjectcode, examData } = matchedData(req);

    // Call service to process marks
    const result = await resultService.processStudentMarks(
      termid,
      yearid,
      examid,
      subjectcode,
      examData,
    );

    return res.status(200).json({
      message: "Results entered successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error in enterMarks controller:", error);

    // Handle specific error types
    if (error.message.includes("Invalid")) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Internal error. Please try again.",
    });
  }
};

/**
 * GET /classInfo
 *
 * Display teacher's classes, subjects,
 * examinations and terms.
 */
exports.page = async(req, res) => {
  try {
    if (req.user.usertype !== "Teacher") {
      return res.render("./response/response", {
        message: "Invalid Request",
      });
    }

    const data = await resultService.getClassInfoPage(req.user.id);

    if (!data.foundClass.length) {
      return res.render("./response/response", {
        message: "No class records found.",
      });
    }

    if (!data.examType.length) {
      return res.render("./response/response", {
        message: "No examination records found.",
      });
    }

    if (!data.term.length) {
      return res.render("./response/response", {
        message: "No term records found.",
      });
    }

    return res.render("./exam/studentResults", {
      foundClass: data.foundClass,
      examType: data.examType,
      term: data.term,
      user: req.user,
    });
  } catch (error) {
    console.error("Class information error:", error);

    return res.status(500).render("./response/response", {
      message: "Database error.",
    });
  }
};

/**
 * POST /classInfo
 *
 * Retrieve results for a particular:
 * teacher + class + subject + exam + term + year.
 */
exports.getResults = async (req, res) => {
  try {
    if (req.user.usertype !== "Teacher") {
      return res.status(403).json({
        message: "Invalid request.",
      });
    }

    // const data = matchedData(req);

    const data = req.body;

    // console.log(data)

    const results = await resultService.getClassResults({
      teacherid: req.user.id,

      examid: data.examtype,

      classid: data.selectClassid,

      subjectcode: data.subjectcode,

      termid: data.term,

      schoolyearid: data.year,
    });

    if (!results.length) {
      return res.status(404).json({
        message: "No records found.",
      });
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error("Get class results error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "Database error.",
    });
  }
};
