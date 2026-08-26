const { query } = require('../utils/db.js');


// ==================== TEACHER SUBJECTS ====================

exports.getTeacherSubjects = (teacherid) =>
  query(
    `
    SELECT
      s.subjectname,
      cs.subjectcode,
      cs.classid,
      c.grade,
      c.class

    FROM class_subjects AS cs

    JOIN class AS c
      ON cs.classid = c.classid

    JOIN subjects AS s
      ON cs.subjectcode = s.subjectcode

    WHERE cs.teacherid = ?
    `,
    [teacherid]
  );


// ==================== TEACHER SUBJECTS FOR ENROLLMENT ====================

exports.getTeacherSubjectsForEnrollment = (teacherid) =>
  query(
    `
    SELECT
      su.subjectname,
      cs.subjectcode,
      cs.classid,
      c.grade,
      c.class

    FROM class_subjects AS cs

    JOIN subjects AS su
      ON cs.subjectcode = su.subjectcode

    JOIN class AS c
      ON c.classid = cs.classid

    WHERE cs.teacherid = ?
    `,
    [teacherid]
  );


// ==================== UNENROLLED STUDENTS ====================

exports.getUnenrolledStudents = (
  classid,
  subjectcode
) =>
  query(
    `
    SELECT
      s.fname,
      s.lname,
      sc.examno,
      sc.classid,
      sc.studentclassid

    FROM studentclass AS sc

    JOIN students AS s
      ON s.examno = sc.examno

    WHERE sc.classid = ?

      AND NOT EXISTS (
        SELECT
          ss.examno,
          ss.subjectcode

        FROM studentsubject AS ss

        WHERE sc.examno = ss.examno
          AND ss.subjectcode = ?
      )
    `,
    [
      classid,
      subjectcode
    ]
  );


// ==================== ENROLL STUDENT ====================

exports.enroll = (
  examno,
  subjectcode
) =>
  query(
    `
    INSERT INTO studentsubject
      (examno, subjectcode)
    VALUES (?, ?)
    `,
    [
      examno,
      subjectcode
    ]
  );


// ==================== MY SUBJECTS ====================

exports.getMySubjects = (examno) =>
  query(
    `
    SELECT
      ss.subjectcode,
      su.subjectname

    FROM studentsubject AS ss

    JOIN subjects AS su
      ON su.subjectcode = ss.subjectcode

    WHERE ss.examno = ?
    `,
    [examno]
  );


// ==================== REGISTERED PUPILS ====================

exports.getRegisteredPupils = (
  subjectcode,
  classid
) =>
  query(
    `
    SELECT DISTINCT
      ss.subjectcode,
      sc.classid,
      s.fname,
      s.lname,
      ss.examno,
      ss.studentsubjectid

    FROM studentsubject AS ss

    JOIN class_subjects AS cs
      ON ss.subjectcode = cs.subjectcode

    JOIN studentclass AS sc
      ON sc.examno = ss.examno

    JOIN students AS s
      ON s.examno = sc.examno

    WHERE ss.subjectcode = ?
      AND sc.classid = ?
    `,
    [
      subjectcode,
      classid
    ]
  );