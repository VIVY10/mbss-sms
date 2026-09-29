const { query, connectionQuery } = require("../utils/db.js");
// ==================== RESULT FILTERS ====================

exports.getResultFilters = () =>
  Promise.all([
    query(`
      SELECT
        tm.termid,
        tm.termnumber,
        yr.yearname
      FROM terms AS tm
      JOIN schoolyear AS yr
        ON tm.yearid = yr.schoolyearid
    `),

    query(`
      SELECT
        schoolyearid,
        yearname
      FROM schoolyear
    `),

    query(`
      SELECT
        examid,
        exam_title
      FROM exams
    `),
  ]);

// ==================== GET STUDENT RESULTS ====================
exports.getStudentResults = (termid, classid, subjectcode, examid) =>
  query(
    `
    SELECT
      su.subjectcode,
      su.subjectname,
      s.examno,
      IFNULL(sr.score, 'Absent') AS score,
      s.fname,
      s.middlename,
      s.lname,
      s.gender,
      yl.levelname,
      c.class,
      ex.exam_title,
      ex.examid,
      tm.termname
    FROM student_results sr
    JOIN studentclass sc
      ON sc.studentclassid = sr.studentclassid
    JOIN students s 
      ON s.examno = sc.examno
    JOIN subjects su 
      ON su.subjectcode = sr.subjectcode
    JOIN terms AS tm
      ON tm.termid = sc.termid
    JOIN schoolyear sy 
      ON sy.schoolyearid = tm.yearid
    JOIN class c 
      ON c.classid = sc.classid
    JOIN yearlevel yl
      ON yl.levelorder = c.levelid
    LEFT JOIN exams ex
      ON ex.examid = sr.examid
    WHERE sr.subjectcode = ?
      AND sr.examid = ?
      AND tm.termid = ?
      AND sc.classid = ?
    ORDER BY su.subjectcode
    `,
    [subjectcode, examid, termid, classid, examid],
  );

// ==================== GET STUDENT RESULTS ====================
exports.getStudentResultsByLevel = (
  schoolyear,
  term,
  yearlevel,
  examid,
  examno,
) => {
  let sql = `
    SELECT
        cs.subjectcode,
        su.subjectname,

        s.examno,
        s.fname,
        s.middlename,
        s.lname,
        s.gender,

        g.phonenumber,
        g.guardian_alt_phone,

        yl.levelname,
        c.class,

        ex.examid,
        ex.exam_title,

        tm.termid,
        tm.termname,

        sy.schoolyearid,
        sy.yearname,

        sr.score

    FROM studentclass sc

    JOIN students s
        ON s.examno = sc.examno

    JOIN class c
        ON c.classid = sc.classid

    JOIN yearlevel yl
        ON yl.levelorder = c.levelid

    JOIN terms tm
        ON tm.termid = sc.termid

    JOIN schoolyear sy
        ON sy.schoolyearid = tm.yearid

    /* Every subject belonging to this class */
    JOIN class_subjects cs
        ON cs.classid = sc.classid

    JOIN subjects su
        ON su.subjectcode = cs.subjectcode

    /* Result is optional */
    LEFT JOIN student_results sr
        ON sr.studentclassid = sc.studentclassid
        AND sr.subjectcode = cs.subjectcode
        AND sr.examid = ?

    /* Selected examination */
    JOIN exams ex
        ON ex.examid = ?

    LEFT JOIN studentguardian stg
        ON stg.examno = s.examno

    LEFT JOIN guardian g
        ON g.guardian_nrc_no = stg.guardianid

    WHERE sc.termid = ?
      AND sc.yearid = ?
  `;

  const params = [examid, examid, term, schoolyear];

  // If a specific level is requested
  if (yearlevel != null) {
    sql += `  AND yl.levelorder = ?`;
    params.push(yearlevel);
  }

  // If a specific pupil is requested
  if (examno != null) {
    sql += ` AND s.examno = ?`;
    params.push(examno);
  }

  sql += `
    ORDER BY
        cs.subjectcode,
        s.fname,
        s.lname;
  `;

  return query(sql, params);
};

// ==================== GET STUDENT PROFILE ====================

exports.getProfile = (examno) =>
  query(
    `
    SELECT
      s.fname,
      s.lname,
      s.examno,
      s.profilePicture,
      c.grade,
      c.section

    FROM students AS s

    JOIN studentclass AS sc
      ON s.examno = sc.examno

    JOIN class AS c
      ON c.classid = sc.classid

    WHERE s.examno = ?
    `,
    [examno],
  );

// ==================== DELETE RESULT ====================

exports.deleteResult = (data) =>
  query(
    `
    DELETE FROM student_results
    WHERE examno = ?
      AND subjectcode = ?
      AND examid = ?
      AND score = ?
    `,
    [data.id, data.subjectcode, data.examid, data.score],
  );

// ==================== UPDATE RESULT ====================

exports.updateResult = (data) =>
  query(
    `
    UPDATE student_results
    SET score = ?
    WHERE examno = ?
      AND examid = ?
      AND subjectcode = ?
    `,
    [data.score, data.id, data.examid, data.subjectcode],
  );

exports.getExams = () =>
  query(
    `SELECT examid, exam_title
     FROM exams`,
  );

exports.getMissingMarks = (examid, termid, yearid, class_subject_id) =>
  query(
    `
    SELECT 
    s.examno,
    s.fname,
    s.lname,
    sc.classid,
    sc.studentclassid,
    cs.class_subject_id,
    cs.subjectcode,
    sub.subjectname
FROM 
    students s
    INNER JOIN studentclass sc ON s.examno = sc.examno
    INNER JOIN class c ON sc.classid = c.classid
    INNER JOIN class_subjects cs ON sc.classid = cs.classid
    INNER JOIN subjects sub ON cs.subjectcode = sub.subjectcode
    LEFT JOIN student_results sr ON 
        sc.studentclassid = sr.studentclassid 
        AND cs.subjectcode = sr.subjectcode 
        AND sr.examid = ?
WHERE 
    sc.status = 'active'
    AND sc.termid = ?
    AND sc.yearid = ?
    AND cs.class_subject_id = ?
    AND sr.student_resultsid IS NULL
ORDER BY 
    sc.classid, s.lname, s.fname;
    `,
    [examid, termid, yearid, class_subject_id],
  );

// Helper function to validate sequential exam entry
exports.validateAllStudentsCanEnterMarks = async (
  examid,
  subjectCode,
  studentIds,
  connection,
) => {
  // ---------------------------------------------------------
  // 1. Validate input
  // ---------------------------------------------------------
  if (
    !examid ||
    !subjectCode ||
    !Array.isArray(studentIds) ||
    studentIds.length === 0
  ) {
    return {
      valid: false,
      code: "INVALID_INPUT",
      message: "Exam, subject, and student information are required.",
    };
  }

  // Remove duplicates
  studentIds = [...new Set(studentIds)];

  // ---------------------------------------------------------
  // 2. Get current exam
  // ---------------------------------------------------------
  const examResult = await connectionQuery(
    connection,
    `
      SELECT
        examid,
        exam_title,
        sequence_no,
        status
      FROM exams
      WHERE examid = ?
        AND status = 'active'
      LIMIT 1
    `,
    [examid],
  );

  const examRows = Array.isArray(examResult?.[0]) ? examResult[0] : examResult;

  const exam = examRows?.[0];

  if (!exam) {
    return {
      valid: false,
      code: "EXAM_NOT_FOUND",
      message: "The selected exam was not found or is inactive.",
    };
  }

  // ---------------------------------------------------------
  // 3. Validate sequence number
  // ---------------------------------------------------------
  const examOrder = Number(exam.sequence_no);

  if (!Number.isInteger(examOrder) || examOrder < 1) {
    return {
      valid: false,
      code: "INVALID_EXAM_SEQUENCE",
      message: `Invalid sequence number configured for "${exam.exam_title}".`,
      data: {
        examid: exam.examid,
        exam_title: exam.exam_title,
        sequence_no: exam.sequence_no,
      },
    };
  }

  // ---------------------------------------------------------
  // 4. First exam - no previous marks required
  // ---------------------------------------------------------
  if (examOrder === 1) {
    return {
      valid: true,
      code: "VALID",
      message: "Students can enter marks for this exam.",
      data: {
        examid: exam.examid,
        exam_title: exam.exam_title,
        sequence_no: examOrder,
      },
    };
  }

  // ---------------------------------------------------------
  // 5. Get previous active exams
  // ---------------------------------------------------------
  const previousExamsResult = await connectionQuery(
    connection,
    `
      SELECT
        examid,
        exam_title,
        sequence_no
      FROM exams
      WHERE status = 'active'
        AND sequence_no < ?
      ORDER BY sequence_no ASC
    `,
    [examOrder],
  );

  const previousExams = Array.isArray(previousExamsResult?.[0])
    ? previousExamsResult[0]
    : previousExamsResult;

  // ---------------------------------------------------------
  // 6. No previous exams
  // ---------------------------------------------------------
  if (!previousExams || previousExams.length === 0) {
    return {
      valid: false,
      code: "PREVIOUS_EXAM_NOT_FOUND",
      message: `Cannot enter marks for "${exam.exam_title}" because the previous exam is not configured.`,
      data: {
        examid: exam.examid,
        exam_title: exam.exam_title,
        sequence_no: examOrder,
        required_previous_sequence: examOrder - 1,
      },
    };
  }

  // ---------------------------------------------------------
  // 7. Create placeholders for students
  // ---------------------------------------------------------
  const placeholders = studentIds.map(() => "?").join(",");

  // ---------------------------------------------------------
  // 8. Find missing previous marks
  // ---------------------------------------------------------
  const missingMarksResult = await connectionQuery(
    connection,
    `
      SELECT
        sc.studentclassid,
        e.examid,
        e.exam_title,
        e.sequence_no

      FROM studentclass sc

      CROSS JOIN exams e

      LEFT JOIN student_results sr
        ON sr.studentclassid = sc.studentclassid
        AND sr.subjectcode = ?
        AND sr.examid = e.examid
        AND sr.score IS NOT NULL

      WHERE sc.studentclassid IN (${placeholders})
        AND sc.status = 'active'

        AND e.status = 'active'
        AND e.sequence_no < ?

        AND sr.studentclassid IS NULL

      ORDER BY
        sc.studentclassid,
        e.sequence_no ASC
    `,
    [subjectCode, ...studentIds, examOrder],
  );

  const missingMarks = Array.isArray(missingMarksResult?.[0])
    ? missingMarksResult[0]
    : missingMarksResult;

  // ---------------------------------------------------------
  // 9. Everything is valid
  // ---------------------------------------------------------
  if (!missingMarks || missingMarks.length === 0) {
    return {
      valid: true,
      code: "VALID",
      message: "Students can enter marks for this exam.",
      data: {
        examid: exam.examid,
        exam_title: exam.exam_title,
        sequence_no: examOrder,
      },
    };
  }

  // ---------------------------------------------------------
  // 10. Group missing exams by student
  // ---------------------------------------------------------
  const studentMissingMap = new Map();

  for (const row of missingMarks) {
    if (!studentMissingMap.has(row.studentclassid)) {
      studentMissingMap.set(row.studentclassid, []);
    }

    studentMissingMap.get(row.studentclassid).push({
      examid: row.examid,
      exam_title: row.exam_title,
      sequence_no: Number(row.sequence_no),
    });
  }

  // ---------------------------------------------------------
  // 11. Build structured student errors
  // ---------------------------------------------------------
  const students = [];

  for (const [studentclassid, exams] of studentMissingMap.entries()) {
    exams.sort((a, b) => a.sequence_no - b.sequence_no);

    students.push({
      studentclassid,
      missing_exams: exams,
    });
  }

  // ---------------------------------------------------------
  // 12. Return JSON-friendly validation response
  // ---------------------------------------------------------
  return {
    valid: false,
    code: "SEQUENTIAL_EXAM_REQUIRED",

    message:
      `Marks cannot be entered for "${exam.exam_title}" ` +
      `until all previous exams have marks.`,

    data: {
      examid: exam.examid,
      exam_title: exam.exam_title,
      sequence_no: examOrder,
      students,
    },
  };
};

exports.getExistingMarks = (connection, examid, subjectCode, studentIds) => {
  connectionQuery(
    connection,
    `SELECT studentclassid FROM student_results 
     WHERE examid = ? AND subjectcode = ? AND studentclassid IN (?) AND score IS NOT NULL`,
    [examid, subjectCode, studentIds],
  );
};

exports.insertMarks = (connection, count, values) => {
  const placeholders = Array(count).fill("(?, ?, ?, ?, ?)").join(", ");

  connectionQuery(
    connection,
    `INSERT INTO student_results (studentclassid, subjectcode, examid, score, entered_by) 
     VALUES ${placeholders}`,
    values,
  );
};

exports.updateExistingMarks = (
  connection,
  mark,
  entered_by,
  examid,
  subjectCode,
  studentclassid,
) => {
  connectionQuery(
    connection,
    `UPDATE student_results 
     SET score = ?, entered_by = ?, updated_at = CURRENT_TIMESTAMP()
     WHERE examid = ? AND subjectcode = ? AND studentclassid = ?`,
    [mark, entered_by, examid, subjectCode, studentclassid],
  );
};

exports.getTeacherClasses = (teacherid) =>
  query(
    `SELECT
            s.subjectname,
            cs.subjectcode,
            c.classid,
            c.grade,
            c.class
        FROM class_subjects AS cs
        JOIN class AS c
            ON cs.classid = c.classid
        JOIN subjects AS s
            ON cs.subjectcode = s.subjectcode
        WHERE cs.teacherid = ?
        ORDER BY c.grade, c.class, s.subjectname
    `,
    [teacherid],
  );

/**
 * Get school terms and their school years.
 */
exports.getTerms = () =>
  query(`
        SELECT
            t.termid,
            t.termnumber,
            sy.schoolyearid,
            sy.yearname
        FROM terms AS t
        JOIN schoolyear AS sy
            ON sy.schoolyearid = t.yearid
        ORDER BY sy.yearname, t.termnumber
    `);

/**
 * Get student results for a teacher's
 * allocated class and subject.
 */
exports.getClassResults = ({
  examid,
  classid,
  subjectcode,
  teacherid,
  termid,
  schoolyearid,
}) =>
  query(
    `
        SELECT
            s.id,
            s.fname,
            s.lname,
            s.gender,
            c.grade,
            c.class,
            su.subjectname,
            ex.exam_title,
            ex.examid,
            tm.termnumber AS term,
            sy.yearname,
            sr.score,
            sr.subjectcode,
            c.classid
        FROM students AS s

        JOIN student_results AS sr
            ON sr.examno = s.examno

        JOIN subjects AS su
            ON su.subjectcode = sr.subjectcode

        JOIN studentclass AS sc
            ON sc.examno = s.id

        JOIN class AS c
            ON c.classid = sc.classid

        JOIN terms AS tm
            ON tm.termid = c.termid

        JOIN schoolyear AS sy
            ON sy.schoolyearid = tm.yearid

        JOIN exams AS ex
            ON ex.examid = sr.examid

        JOIN class_subjects AS cs
            ON cs.classid = c.classid
            AND cs.subjectcode = sr.subjectcode

        WHERE sr.examid = ?
          AND c.classid = ?
          AND sr.subjectcode = ?
          AND cs.teacherid = ?
          AND tm.termid = ?
          AND sy.schoolyearid = ?

        ORDER BY s.id
    `,
    [examid, classid, subjectcode, teacherid, termid, schoolyearid],
  );

exports.getResultClasses = () =>
  query(`
    SELECT
      s.subjectname,
      cs.subjectcode,
      cs.classid,
      c.class,
      yl.levelname,
      t.teacherid,
      t.fname,
      t.middlename,
      t.lname
    FROM class_subjects AS cs
    JOIN class AS c
      ON cs.classid = c.classid
    JOIN yearlevel yl 
      ON yl.levelorder = c.levelid
    JOIN subjects AS s
      ON s.subjectcode = cs.subjectcode
    JOIN teaching_allocations ta 
      ON ta.class_subject_id = cs.class_subject_id
    JOIN teachers t 
      ON t.teacherid = ta.teacherid
    ORDER BY
      c.class,
      s.subjectname
    `);
