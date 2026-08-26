const pool = require('../config/db.js');


// ==================== SCHOOL YEARS ====================

exports.getSchoolYears = async () => {
  const [rows] = await pool.query(
    'SELECT schoolyearid, yearname FROM schoolyear'
  );

  return rows;
};


// ==================== TERMS ====================

exports.getTerms = async () => {
  const [rows] = await pool.query(
    'SELECT termid, termnumber FROM terms'
  );

  return rows;
};


// ==================== YEAR LEVELS ====================

exports.getYearLevels = async () => {
  const [rows] = await pool.query(
    'SELECT levelorder, levelname FROM yearlevel'
  );

  return rows;
};


// ==================== EXAMS ====================

exports.getExams = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM exams'
  );

  return rows;
};


// ==================== GET RESULTS ====================

exports.getResults = async ({
  examid,
  term,
  schoolyear,
  yearlevel
}) => {
  const [rows] = await pool.query(
    `
    SELECT
      st.examno,
      st.fname,
      st.lname,
      sub.subjectcode,
      sub.subjectname,
      IFNULL(sr.score, 'Absent') AS score,
      IFNULL(ex.exam_title, '') AS exam_title,
      c.grade,
      c.section,
      sy.yearname,
      tm.termnumber,
      g.phonenumber

    FROM students AS st

    JOIN studentclass AS sc
      ON st.examno = sc.examno

    JOIN class AS c
      ON sc.classid = c.classid

    JOIN terms AS tm
      ON c.termid = tm.termid

    JOIN schoolyear AS sy
      ON tm.yearid = sy.schoolyearid

    JOIN class_subjects AS cs
      ON cs.classid = c.classid

    JOIN subjects AS sub
      ON cs.subjectcode = sub.subjectcode

    JOIN studentguardian AS stg
      ON stg.examno = st.examno

    JOIN guardian AS g
      ON g.guardian_nrc_no = stg.guardianid

    LEFT JOIN student_results AS sr
      ON st.examno = sr.examno
      AND sr.subjectcode = sub.subjectcode
      AND sr.examid = ?

    LEFT JOIN exams AS ex
      ON ex.examid = sr.examid

    WHERE tm.termid = ?
      AND sy.schoolyearid = ?
      AND c.grade = ?

    ORDER BY st.examno, sub.subjectcode
    `,
    [
      examid,
      term,
      schoolyear,
      yearlevel
    ]
  );

  return rows;
};