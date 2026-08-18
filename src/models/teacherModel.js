const { query } = require('../utils/db.js');


// ==================== FIND TEACHER ====================

exports.findByUsername = (username) =>
  query(
    `
    SELECT
      usertype,
      username
    FROM teachers
    WHERE username = ?
    `,
    [username]
  );


// ==================== CREATE TEACHER ====================

exports.create = (data) =>
  query(
    `
    INSERT INTO teachers
      (
        usertype,
        username,
        Fname,
        Lname,
        email,
        password,
        gender,
        profilePicture
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.usertype,
      data.username,
      data.fname,
      data.lname,
      data.email,
      data.password,
      data.gender,
      data.profilePicture
    ]
  );


// ==================== GET ALL TEACHERS ====================
exports.getAll = () =>
  query(
    `
    SELECT
      id,
      fname,
      lname,
      gender,
      username,
      usertype,
      email,
      time_created
    FROM teachers
    `
  );


// ==================== SUBJECTS TAUGHT ====================

exports.getSubjectsTaught = (teacherId) =>
  query(
    `
    SELECT
      s.subjectname,
      cs.classid,
      cs.subjectcode,
      c.grade,
      c.class

    FROM class_subjects AS cs

    JOIN subjects AS s
      ON s.subjectcode = cs.subjectcode

    JOIN class AS c
      ON c.classid = cs.classid

    WHERE cs.teacherid = ?
    `,
    [teacherId]
  );


// ==================== GET TEACHER DEPARTMENT ====================

exports.getDepartment = (teacherId) =>
  query(
    `
    SELECT
      td.teacherid,
      dp.departmentid,
      dp.departmentname

    FROM teacher_department AS td

    JOIN department AS dp
      ON td.departmentid = dp.departmentid

    WHERE td.teacherid = ?
    `,
    [teacherId]
  );


// ==================== UNALLOCATED SUBJECTS ====================

exports.getUnallocatedByDepartment = (departmentId) =>
  query(
    `
    SELECT
      cs.class_subjectsid AS classsubjectid,
      cs.classid,
      c.grade,
      c.class,
      cs.subjectcode,
      cs.teacherid,
      d.departmentname,
      s.departmentid,
      s.subjectname

    FROM class_subjects AS cs

    JOIN class AS c
      ON c.classid = cs.classid

    JOIN subjects AS s
      ON s.subjectcode = cs.subjectcode

    JOIN department AS d
      ON s.departmentid = d.departmentid

    WHERE cs.teacherid IS NULL
      AND s.departmentid = ?
    `,
    [departmentId]
  );


// ==================== ALLOCATED SUBJECTS ====================

exports.getAllocatedByDepartment = (departmentId) =>
  query(
    `
    SELECT
      cs.class_subjectsid AS classsubjectid,
      cs.classid,
      c.grade,
      c.class,
      cs.subjectcode,
      cs.teacherid,
      d.departmentname,
      s.departmentid,
      t.fname,
      t.lname,
      s.subjectname

    FROM class_subjects AS cs

    JOIN class AS c
      ON c.classid = cs.classid

    JOIN subjects AS s
      ON s.subjectcode = cs.subjectcode

    JOIN teachers AS t
      ON t.id = cs.teacherid

    JOIN department AS d
      ON s.departmentid = d.departmentid

    WHERE cs.teacherid IS NOT NULL
      AND s.departmentid = ?
    `,
    [departmentId]
  );


// ==================== ALLOCATION DETAILS ====================

exports.getAllocationDetails = (
  classSubjectId,
  departmentId
) =>
  Promise.all([
    query(
      `
      SELECT
        cs.class_subjectsid AS classsubjectid,
        s.subjectname,
        c.grade,
        c.class

      FROM class_subjects AS cs

      JOIN class AS c
        ON c.classid = cs.classid

      JOIN subjects AS s
        ON s.subjectcode = cs.subjectcode

      WHERE cs.class_subjectsid = ?
      `,
      [classSubjectId]
    ),

    query(
      `
      SELECT
        t.id,
        t.fname,
        t.lname

      FROM teacher_department AS td

      JOIN teachers AS t
        ON t.id = td.teacherid

      WHERE td.departmentid = ?
        AND t.usertype = ?
      `,
      [
        departmentId,
        'Teacher'
      ]
    )
  ]);


// ==================== ALLOCATE SUBJECT ====================

exports.allocateSubject = (
  teacher,
  subjectId
) =>
  query(
    `
    UPDATE class_subjects
    SET teacherid = ?
    WHERE class_subjectsid = ?
    `,
    [
      teacher,
      subjectId
    ]
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
      ON s.id = sc.examno

    WHERE ss.subjectcode = ?
      AND sc.classid = ?
    `,
    [
      subjectcode,
      classid
    ]
  );


// ==================== COUNT ADMINS ====================

exports.countAdmins = () =>
  query(
    `
    SELECT username
    FROM teachers
    WHERE usertype = ?
    `,
    ['Admin']
  );


// ==================== DELETE TEACHER ====================

exports.deleteByUsername = (username) =>
  query(
    `
    DELETE FROM teachers
    WHERE username = ?
    `,
    [username]
  );