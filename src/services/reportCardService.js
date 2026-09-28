// services/reportCardService.js
const util = require("util");
const adminModel = require("../models/adminModel.js");
const examModel = require("../models/examModel.js");
const smsModel = require("../models/smsModel.js");
const pupilModel = require("../models/pupilModel.js");
const resultsModel = require("../models/resultModel.js");
/* ---------------------------------------------------------
     Grade / remark tables (single source of truth)
     --------------------------------------------------------- */
const GRADE_TABLE = [
  { min: 85, grade: "A+", remark: "Excellent" },
  { min: 75, grade: "A", remark: "Excellent" },
  { min: 65, grade: "B+", remark: "Very Good" },
  { min: 60, grade: "B", remark: "Good" },
  { min: 50, grade: "C+", remark: "Fair" },
  { min: 40, grade: "C", remark: "Fair" },
  { min: 0, grade: "F", remark: "Work Hard" },
];

function gradeFor(score) {
  const num = Number(score);
  if (!Number.isFinite(num)) {
    return { grade: "—", remark: "Absent", passed: false };
  }
  const row = GRADE_TABLE.find((g) => num >= g.min);
  return { ...row, passed: num >= 40 };
}

/* ---------------------------------------------------------
     Fetch a single student's full report card
     --------------------------------------------------------- */
async function getReportCard({ examno, examid, termid, schoolyearid, levelorder }) {
  const rows = await resultsModel.getStudentResultsByLevel(
    schoolyearid,
    termid,
    levelorder,
    examid,
  );

  if (!rows.length) return null;

  const student = {
    examno: rows[0].examno,
    fname: rows[0].fname,
    lname: rows[0].lname,
    gender: rows[0].gender,
    level: rows[0].levelname,
    className: rows[0].class,
    yearname: rows[0].yearname,
    termnumber: rows[0].termname,
    exam_title: rows[0].exam_title,
  };

  const subjects = rows.map((r) => {
    const scoreNum =
      r.score === null || r.score === undefined ? null : Number(r.score);
    const { grade, remark, passed } = gradeFor(scoreNum);
    return {
      subjectcode: r.subjectcode,
      subjectname: r.subjectname,
      score: scoreNum,
      scoreDisplay: scoreNum === null ? "Absent" : scoreNum,
      grade,
      remark,
      passed,
    };
  });

  const totalScore = subjects.reduce((sum, s) => sum + (s.score ?? 0), 0);
  const maxScore = subjects.length * 100;
  const average = subjects.length
    ? (totalScore / subjects.length).toFixed(1)
    : "0.0";
  const subjectsPassed = subjects.filter((s) => s.passed).length;
  const overallGrade = gradeFor(Number(average));

  // Overall status
  const status =
    subjectsPassed >= Math.ceil(subjects.length / 2) ? "Promoted" : "Repeat";

  // TODO: position in class — replace with a real query if you have one
  const position = null;

  return {
    student,
    subjects,
    summary: {
      totalScore,
      maxScore,
      average,
      subjectsPassed,
      totalSubjects: subjects.length,
      overallGrade: overallGrade.grade,
      overallRemark: overallGrade.remark,
      status,
      position,
      teacherComment: buildComment(Number(average)),
    },
  };
}

function buildComment(average) {
  if (average >= 85) return "Outstanding performance. Keep it up!";
  if (average >= 75) return "Excellent work. A model student.";
  if (average >= 65) return "Very good. Consistent effort shown.";
  if (average >= 55) return "Good. Aim higher next term.";
  if (average >= 45) return "Fair. More practice is needed.";
  if (average >= 40) return "Pass. Significant improvement required.";
  return "Needs to work much harder.";
}

async function getBulkReportCards({
  levelorder,
  examid,
  termid,
  schoolyearid,
}) {
  const list = await pupilModel.findEnrollmentByLevel(levelorder);
  const cards = [];
  for (const { examno } of list) {
    const card = await getReportCard({ examno, examid, termid, schoolyearid, levelorder });
    if (card) cards.push(card);
  }
  return cards;
}

/* ---------------------------------------------------------
     Lookups for the generation UI
     --------------------------------------------------------- */
async function getLookups() {
  const [schoolyears, terms, exams, yearlevels] = await Promise.all([
    await adminModel.getSchoolYears(),
    await adminModel.getTerms(),
    await examModel.findAll(),
    await smsModel.getYearLevels(),
  ]);

  return { schoolyears, terms, exams, yearlevels };
}

module.exports = {
  getReportCard,
  getBulkReportCards,
  getLookups,
  gradeFor,
};
