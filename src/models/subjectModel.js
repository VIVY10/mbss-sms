const { query } = require('../utils/db.js');


// ==================== SUBJECTS ====================

exports.getAll = () =>
  query('SELECT * FROM subjects');


// ==================== DEPARTMENTS ====================

exports.getDepartments = () =>
  query(
    `SELECT
       departmentid,
       departmentname
     FROM department`
  );


// ==================== FIND SUBJECT BY CODE ====================

exports.findByCode = (subjectcode) =>
  query(
    'SELECT * FROM subjects WHERE subjectcode = ?',
    [subjectcode]
  );


// ==================== CREATE SUBJECT ====================

exports.create = (data) =>
  query(
    `
    INSERT INTO subjects
      (subjectcode, departmentid, subjectname)
    VALUES (?, ?, ?)
    `,
    [
      data.subjectcode,
      data.department,
      data.subjectname
    ]
  );


// ==================== DELETE SUBJECT ====================

exports.deleteByCode = (subjectcode) =>
  query(
    'DELETE FROM subjects WHERE subjectcode = ?',
    [subjectcode]
  );


// ==================== CLASS SUBJECT OPTIONS ====================

exports.getClassSubjectOptions = () =>
  Promise.all([
    query(
      `
      SELECT
        c.grade,
        c.class,
        c.classid
      FROM class AS c
      GROUP BY c.classid
      ASC
      `
    ),

    query(
      `
      SELECT
        s.subjectcode,
        s.subjectname
      FROM subjects AS s
      ORDER BY s.subjectcode ASC
      `
    )
  ]);


// ==================== FIND CLASS SUBJECT ====================

exports.findClassSubject = (
  classid,
  subjectcode
) =>
  query(
    `
    SELECT
      classid,
      subjectcode
    FROM class_subjects
    WHERE classid = ?
      AND subjectcode = ?
    `,
    [
      classid,
      subjectcode
    ]
  );


// ==================== ADD CLASS SUBJECT ====================

exports.addClassSubject = (
  classid,
  subjectcode
) =>
  query(
    `
    INSERT INTO class_subjects
      (classid, subjectcode)
    VALUES (?, ?)
    `,
    [
      classid,
      subjectcode
    ]
  );


// ==================== GET CLASS SUBJECTS ====================

exports.getClassSubjects = () =>
  query(
    `
    SELECT
      c.classid,
      cs.class_subjectsid,
      cs.subjectcode,
      s.subjectname,
      c.grade,
      c.class

    FROM class_subjects AS cs

    JOIN subjects AS s
      ON cs.subjectcode = s.subjectcode

    JOIN class AS c
      ON cs.classid = c.classid

    ORDER BY s.subjectname
    `
  );


// ==================== UNALLOCATED CLASS SUBJECTS ====================

exports.getUnallocatedClassSubjects = () =>
  query(
    `
    SELECT DISTINCT
      st.classid,
      cs.class_subjectsid,
      cs.subjectcode,
      s.subjectname,
      c.grade,
      c.class,
      dp.departmentname,
      cs.teacherid

    FROM class_subjects AS cs

    JOIN subjects AS s
      ON cs.subjectcode = s.subjectcode

    JOIN studentclass AS st
      ON st.classid = cs.classid

    JOIN class AS c
      ON st.classid = c.classid

    JOIN department AS dp
      ON dp.departmentid = s.departmentid

    WHERE cs.teacherid IS NULL

    ORDER BY s.subjectname
    `
  );


// ==================== ALLOCATED CLASS SUBJECTS ====================

exports.getAllocatedClassSubjects = () =>
  query(
    `
    SELECT
      cs.classid,
      cs.class_subjectsid,
      cs.subjectcode,
      s.subjectname,
      c.grade,
      c.class,
      dp.departmentname,
      t.fname,
      t.lname

    FROM class_subjects AS cs

    JOIN subjects AS s
      ON cs.subjectcode = s.subjectcode

    JOIN class AS c
      ON cs.classid = c.classid

    JOIN department AS dp
      ON dp.departmentid = s.departmentid

    JOIN teachers AS t
      ON t.id = cs.teacherid

    ORDER BY s.subjectname
    `
  );


// ==================== DELETE CLASS SUBJECT ====================

exports.deleteClassSubject = (id) =>
  query(
    `
    DELETE FROM class_subjects
    WHERE class_subjectsid = ?
    `,
    [id]
  );