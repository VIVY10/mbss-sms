const { query } = require("../utils/db.js");

// ==================== FIND TEACHER ====================

exports.findByUsername = (username) =>
  query(
    `
    SELECT
      *
    FROM teachers
    WHERE username = ?
    `,
    [username],
  );

exports.findById = (teacherid) =>
  query(
    `
    SELECT
      *
    FROM teachers
    WHERE teacherid = ?
    `,
    [teacherid],
  );

exports.findByEmail = (email) =>
  query(
    `
    SELECT
      usertype,
      username,
      email
    FROM teachers
    WHERE email = ?
    `,
    [email],
  );

exports.findByEmployeeNo = (employee_no) =>
  query(
    `
    SELECT
      usertype,
      username,
      email
    FROM teachers
    WHERE employee_no = ?
    `,
    [employee_no],
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
        profilePicture,
        employee_no,
        middlename,
        phone,
        employment_date
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.usertype,
      data.username,
      data.fname,
      data.lname,
      data.email,
      data.password,
      data.gender,
      data.profilePicture,
      data.employee_no,
      data.middlename,
      data.phone,
      data.employment_date,
    ],
  );

// ==================== GET ALL TEACHERS ====================
exports.getAll = () =>
  query(
    `
    SELECT
      *
    FROM teachers
    `,
  );

// ==================== SUBJECTS TAUGHT ====================

exports.getTeacherSubjectAllocations = (teacherId) =>
  query(
    `
    SELECT
      ta.allocation_id,
      ta.class_subject_id,
      ta.teacherid,
      ta.termid,
      ta.allocated_by,
      s.subjectcode,
      s.subjectname,
      
      d.departmentid,
      d.departmentname,
      
      c.class,
      yl.levelname,
      t.termid,
      t.termname,      
      t.status,
      
      sy.schoolyearid,
      sy.yearname
      

    FROM teaching_allocations ta
    
    JOIN class_subjects cs
    ON cs.class_subject_id = ta.class_subject_id
    
    JOIN subjects AS s
      ON s.subjectcode = cs.subjectcode
      
     JOIN department d
     ON d.departmentid = s.departmentid

    JOIN class AS c
      ON c.classid = cs.classid
      
    JOIN yearlevel yl
    ON yl.levelorder = c.levelid
    
    JOIN terms t
    ON t.termid = ta.termid
    
    JOIN schoolyear sy
    ON sy.schoolyearid = t.yearid

    WHERE ta.teacherid = ?
    AND t.status = 'open'
    `,
    [teacherId],
  );

exports.getTeacherSubjects = (teacherid) =>
  query(
    `
      SELECT
        ts.teacher_subjectid,
        s.subjectcode,
        s.subjectname,
        s.subjectname,
        d.departmentid,
        d.departmentname
        
      FROM teacher_subject ts
      JOIN teachers t
      ON t.teacherid = ts.teacherid
      JOIN subjects s 
      ON s.subjectcode = ts.subjectcode
      
      JOIN department d 
      ON d.departmentid = s.departmentid
      
      WHERE t.teacherid = ?
      ORDER BY s.subjectcode ASC
      `,
    [teacherid],
  );

exports.findTeacherAssignedSubject = (teacherid, subjectcode) =>
  query(
    `
      SELECT
        ts.subjectcode,
        ts.teacherid
        
      FROM teacher_subject ts
      
      WHERE ts.teacherid = ?
      AND ts.subjectcode = ?
      `,
    [teacherid, subjectcode],
  );

// ==================== GET TEACHER DEPARTMENT ====================

// exports.getDepartment = (teacherId) =>
//   query(
//     `
//     SELECT
//       td.teacherid,
//       dp.departmentid,
//       dp.departmentname

//     FROM teacher_department AS td

//     JOIN department AS dp
//       ON td.departmentid = dp.departmentid

//     WHERE td.teacherid = ?
//     `,
//     [teacherId],
//   );

exports.findTeacherDepartment = (teacherid) =>
  query(
    `
    SELECT
        t.teacherid,
        t.fname,
        t.lname,        
        d.departmentid,
        d.departmentname,        
        td.teacher_departmentid,
        td.start_date
      FROM teacher_department td      
      JOIN department d
        ON d.departmentid = td.departmentid
      JOIN teachers t
        ON t.teacherid = td.teacherid
      WHERE t.teacherid = ?
    `,
    [teacherid],
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
    [departmentId],
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
      ON t.teacherid = cs.teacherid

    JOIN department AS d
      ON s.departmentid = d.departmentid

    WHERE cs.teacherid IS NOT NULL
      AND s.departmentid = ?
    `,
    [departmentId],
  );

// ==================== ALLOCATION DETAILS ====================

exports.getAllocationDetails = (classSubjectId, departmentId) =>
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
      [classSubjectId],
    ),

    query(
      `
      SELECT
        t.teacherid,
        t.fname,
        t.lname

      FROM teacher_department AS td

      JOIN teachers AS t
        ON t.teacherid = td.teacherid

      WHERE td.departmentid = ?
        AND t.usertype = ?
      `,
      [departmentId, "Teacher"],
    ),
  ]);

// ==================== ALLOCATE SUBJECT ====================

exports.assignTeacherSubject = (teacherid, subjectcode, approved_by) =>
  query(
    ` 
    INSERT INTO 
    teacher_subject(teacherid, subjectcode, approved_by) 
    VALUES(?, ?, ?)
    `,
    [teacherid, subjectcode, approved_by],
  );

// ==================== REGISTERED PUPILS ====================

exports.getRegisteredPupils = (subjectcode, classid) =>
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
    [subjectcode, classid],
  );

// ==================== COUNT ADMINS ====================

exports.countAdmins = () =>
  query(
    `
    SELECT username
    FROM teachers
    WHERE usertype = ?
    `,
    ["admin"],
  );

// ==================== DELETE TEACHER ====================

exports.deleteByUsername = (username) =>
  query(
    `
    DELETE FROM teachers
    WHERE username = ?
    `,
    [username],
  );
