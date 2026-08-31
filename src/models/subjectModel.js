const { query } = require("../utils/db.js");

// ==================== SUBJECTS ====================

exports.getAll = () =>
  query(`
        SELECT 
        s.subjectcode,
        s.subjectname,
        s.status AS subject_status,
        d.departmentname,
        d.status AS department_status
      FROM subjects AS s
      JOIN department AS d
        ON d.departmentid = s.departmentid
    `);

// ==================== DEPARTMENTS ====================

exports.getDepartments = () =>
  query(
    `SELECT
       departmentid,
       departmentname
     FROM department`,
  );

// ==================== FIND SUBJECT BY CODE ====================

exports.findByCode = (subjectcode) =>
  query("SELECT * FROM subjects WHERE subjectcode = ?", [subjectcode]);

// ==================== CREATE SUBJECT ====================

exports.create = (data) =>
  query(
    `
    INSERT INTO subjects
      (subjectcode, departmentid, subjectname)
    VALUES (?, ?, ?)
    `,
    [data.subjectcode, data.department, data.subjectname],
  );

// ==================== DELETE SUBJECT ====================

exports.deleteByCode = (subjectcode) =>
  query("DELETE FROM subjects WHERE subjectcode = ?", [subjectcode]);

// ==================== CLASS SUBJECT OPTIONS ====================

exports.getSubjects = () =>
    query(
      `
      SELECT
        s.subjectcode,
        s.subjectname
      FROM subjects AS s
      ORDER BY s.subjectcode ASC
      `
    )

// ==================== FIND CLASS SUBJECT ====================

exports.findClassSubject = (classid, subjectcode) =>
  query(
    `
    SELECT
      classid,
      subjectcode
    FROM class_subjects
    WHERE classid = ?
      AND subjectcode = ?
    `,
    [classid, subjectcode],
  );

// ==================== ADD CLASS SUBJECT ====================

exports.addClassSubject = (classid, subjectcode) =>
  query(
    `
    INSERT INTO class_subjects
      (classid, subjectcode)
    VALUES (?, ?)
    `,
    [classid, subjectcode],
  );

// ==================== GET CLASS SUBJECTS ====================

exports.getClassSubjects = () =>
  query(
    `
    SELECT
      c.classid,
      cs.class_subject_id,
      cs.subjectcode,
      s.subjectname,
      c.levelid,
      c.class,
      yl.levelname

    FROM class_subjects AS cs

    JOIN subjects AS s
      ON cs.subjectcode = s.subjectcode

    JOIN class AS c
      ON cs.classid = c.classid
      
    JOIN yearlevel yl
      ON yl.levelorder = c.levelid

    ORDER BY s.subjectname
    `,
  );

// ==================== UNALLOCATED CLASS SUBJECTS ====================

exports.getUnallocatedClassSubjects = (termid) =>
  query(
    `
    SELECT 
        cs.class_subject_id,
        c.classid,
        c.class,
        yl.levelname,
        s.subjectcode,
        s.subjectname,
        d.departmentname,
        t.termid,
        t.termname
    FROM class_subjects cs
    INNER JOIN class c ON cs.classid = c.classid
    INNER JOIN yearlevel yl ON c.levelid = yl.levelorder
    INNER JOIN subjects s ON cs.subjectcode = s.subjectcode
    INNER JOIN department d ON d.departmentid = s.departmentid
    CROSS JOIN terms t
    WHERE t.termid = ? -- Replace with the specific term ID (e.g., 1)
      AND t.status = 'OPEN' -- Optional: only consider open terms
      AND NOT EXISTS (
          SELECT 1 
          FROM teaching_allocations ta
          WHERE ta.class_subject_id = cs.class_subject_id
            AND ta.termid = t.termid
      )
    ORDER BY yl.levelorder, c.class, s.subjectname;
    `,
    [termid]
  );

// ==================== ALLOCATED CLASS SUBJECTS ====================

exports.getAllocatedClassSubjects = (termid) =>
  query(
    `
    SELECT 
        cs.class_subject_id,
        c.classid,
        c.class,
        yl.levelname,
        s.subjectcode,
        s.subjectname,
        d.departmentname,
        t.termid,
        t.termname,
        ta.allocation_id,
        ta.teacherid,
        CONCAT(tchr.fname, ' ', tchr.lname) AS teacher_name,
        ta.start_date,
        ta.end_date,
        ta.allocated_by,
        CONCAT(alloc.fname, ' ', alloc.lname) AS allocated_by_name
    FROM class_subjects cs
    INNER JOIN class c ON cs.classid = c.classid
    INNER JOIN yearlevel yl ON c.levelid = yl.levelorder
    INNER JOIN subjects s ON cs.subjectcode = s.subjectcode
    INNER JOIN department d ON d.departmentid = s.departmentid
    INNER JOIN teaching_allocations ta ON cs.class_subject_id = ta.class_subject_id
    INNER JOIN terms t ON ta.termid = t.termid
    INNER JOIN teachers tchr ON ta.teacherid = tchr.teacherid
    LEFT JOIN teachers alloc ON ta.allocated_by = alloc.teacherid
    WHERE t.termid = ? 
      AND t.status = 'OPEN' 
    ORDER BY yl.levelorder, c.class, s.subjectname;
    `,
    [termid]
  );


// ==================== ALLOCATED CLASS SUBJECTS ====================

exports.teaching_allocation = (termid) =>{
  query(`
      SELECT 
          cs.class_subject_id,
          c.classid,
          c.class,
          yl.levelname,
          s.subjectcode,
          s.subjectname,
          d.departmentname,
          t.termid,
          t.termname,
          CASE 
              WHEN ta.allocation_id IS NOT NULL THEN 'ALLOCATED'
              ELSE 'NOT ALLOCATED'
          END AS allocation_status,
          ta.teacherid,
          CONCAT(tchr.fname, ' ', tchr.lname) AS teacher_name,
          ta.start_date,
          ta.end_date
      FROM class_subjects cs
      INNER JOIN class c ON cs.classid = c.classid
      INNER JOIN yearlevel yl ON c.levelid = yl.levelorder
      INNER JOIN subjects s ON cs.subjectcode = s.subjectcode
      INNER JOIN department d ON d.departmentid = s.departmentid
      CROSS JOIN terms t
      LEFT JOIN teaching_allocations ta ON cs.class_subject_id = ta.class_subject_id 
          AND ta.termid = t.termid
      LEFT JOIN teachers tchr ON ta.teacherid = tchr.teacherid
      WHERE t.termid = ? 
        AND t.status = 'OPEN'
      ORDER BY allocation_status DESC, yl.levelorder, c.class, s.subjectname;
    `, 
    [termid]
  )
}



// ==================== DELETE CLASS SUBJECT ====================

exports.deleteClassSubject = (id) =>
  query(
    `
    DELETE FROM class_subjects
    WHERE class_subject_id = ?
    `,
    [id],
  );
