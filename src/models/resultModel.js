const { query } = require("../utils/db.js");

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

exports.getStudentResults = (examid, pupilId, termid, yearid) =>
  query(
    `
    SELECT
      sub.subjectcode,
      stsub.examno,
      IFNULL(sr.score, 'Absent') AS score,
      st.fname,
      st.lname,
      st.profilePicture,
      c.grade,
      c.section,
      ex.exam_title,
      sub.subjectname,
      sy.yearname

    FROM studentsubject AS stsub

    JOIN students AS st
      ON st.id = stsub.examno

    JOIN class AS c
      ON c.classid = (
        SELECT classid
        FROM studentclass
        WHERE examno = stsub.examno
        LIMIT 1
      )

    JOIN terms AS tm
      ON tm.termid = c.termid

    JOIN schoolyear AS sy
      ON sy.schoolyearid = tm.yearid

    JOIN class_subjects AS cs
      ON cs.classid = c.classid
      AND cs.subjectcode = stsub.subjectcode

    JOIN subjects AS sub
      ON sub.subjectcode = stsub.subjectcode

    LEFT JOIN student_results AS sr
      ON sr.examno = stsub.examno
      AND sr.subjectcode = stsub.subjectcode
      AND sr.examid = ?

    LEFT JOIN exams AS ex
      ON ex.examid = ?

    WHERE st.id = ?
      AND tm.termid = ?
      AND sy.schoolyearid = ?

    ORDER BY sub.subjectcode
    `,
    [examid, examid, pupilId, termid, yearid],
  );

// ==================== GET STUDENT PROFILE ====================

exports.getProfile = (examno) =>
  query(
    `
    SELECT
      s.fname,
      s.lname,
      s.id,
      s.profilePicture,
      c.grade,
      c.section

    FROM students AS s

    JOIN studentclass AS sc
      ON s.id = sc.examno

    JOIN class AS c
      ON c.classid = sc.classid

    WHERE s.id = ?
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

exports.getTeacherClass = (teacherid) =>
  query(
    `SELECT
        s.subjectname,
        cs.subjectcode,
        cs.classid,
        c.grade,
        c.class,
        tm.termid,
        tm.termnumber,
        sy.schoolyearid,
        sy.yearname
     FROM class_subjects AS cs
     JOIN class AS c
       ON cs.classid = c.classid
     JOIN terms as tm
       ON c.termid = tm.termid
     JOIN schoolyear sy
       ON sy.schoolyearid = tm.yearid
     JOIN subjects AS s
       ON cs.subjectcode = s.subjectcode
     WHERE cs.teacherid = ?`,
    [teacherid]
  );

exports.getExams = () =>
  query(
    `SELECT examid, exam_title
     FROM exams`,
  );

exports.getMissingMarks = async({ teacherid, classid, subjectcode, examid }) =>
  query(
    `
        SELECT DISTINCT
            s.id,
            s.fname,
            s.lname,
            sc.examno,
            sc.classid,
            c.grade,
            c.class,
            su.subjectcode,
            su.subjectname,
            cs.teacherid
        FROM class_subjects AS cs

        JOIN studentclass AS sc
            ON sc.classid = cs.classid

        JOIN students AS s
            ON s.id = sc.examno

        JOIN subjects AS su
            ON su.subjectcode = cs.subjectcode

        JOIN class AS c
            ON c.classid = sc.classid

        WHERE cs.teacherid = ?
          AND cs.classid = ?
          AND cs.subjectcode = ?

          AND NOT EXISTS (
              SELECT 1
              FROM student_results AS sr
              WHERE sr.examno = sc.examno
                AND sr.subjectcode = cs.subjectcode
                AND sr.examid = ?
          )

        ORDER BY s.id
        `,
    [teacherid, classid, subjectcode, examid],
  );

exports.insertStudentMarks = async (
  termid,
  yearid,
  examid,
  subjectcode,
  examData,
) => {
  try {
    const promises = examData.map(({ examno, score }) => {
      // Check if record exists
      const resp = query(
        `SELECT * FROM student_results 
            WHERE examno = ? AND subjectcode = ? AND examid = ? AND yearid = ? AND termid = ? AND score IS NOT NULL
          `,
        [examno, subjectcode, examid, yearid, termid],
      );

      if (resp.length > 0) {
        return resolve({
          status: "skipped",
          examno,
          message: "Record already exists",
        });
      }

      // Insert new record
      query(
        `
              INSERT INTO student_results (examno, subjectcode, examid, termid, yearid, score) 
              VALUES (?, ?, ?, ?, ?, ?)
            `,
        [examno, subjectcode, examid, termid, yearid, score],
      );
    });

    const results = await Promise.all(promises);

    return {
      message: "Record already exists",
    };
  } catch (error) {
    throw error;
  }
};
// Additional repository methods if needed
// exports.getStudentResults = async(examid, subjectcode) =>
//   query(`
//       SELECT * FROM student_results
//       WHERE examid = ? AND subjectcode = ?
//     `,[examid, subjectcode])

/**
 * Get classes and subjects allocated to a teacher.
 */
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
    [teacherid]
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
            ON sr.examno = s.id

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
