const { query, connectionQuery } = require("../utils/db.js");

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
    WHERE teacherid = ? AND status != "left"
    `,
    [teacherid],
  );

// Find teacher by ID (with connection for transactions)
exports.findByIdOnConnection = (teacherid, connection = null) =>
  connectionQuery(
    connection,
    `SELECT * FROM teachers WHERE teacherid = ?`,
    [teacherid, "left"],
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
exports.createTeachingAllocations = (
  teacherid,
  class_subject_id,
  termid,
  allocated_by,
) =>
  query(
    `
  INSERT INTO teaching_allocations(teacherid, class_subject_id, termid, allocated_by)
  VALUES(?, ?, ?, ?)
  `,
    [teacherid, class_subject_id, termid, allocated_by],
  );

exports.getCreateTeacherAllocationsOptions = (
  teacherid,
  class_subject_id,
  termid,
) =>
  query(
    `
    SELECT
      ta.allocation_id,
      ta.class_subject_id,
      ta.teacherid,
      ta.termid,
      ta.allocated_by
    FROM teaching_allocations ta
    WHERE ta.teacherid = ?
    AND ta.class_subject_id = ?
    AND ta.termid = ?
    `,
    [teacherid, class_subject_id, termid],
  );

exports.getTeacherSubjectAllocations = (teacherid) =>
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
      c.classid,
      c.status,
      yl.levelname,
      yl.levelorder,
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
    [teacherid],
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

// Count admins (excluding the one being deleted)
exports.countAdminsOnConnection = (connection = null) =>
  connectionQuery(
    connection,
    `SELECT COUNT(*) as count FROM teachers WHERE usertype = "admin" AND status = "active"`,
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

// Soft delete teaching allocations
exports.softDeleteTeacherAllocations = (teacherid, connection = null) =>
  connectionQuery(
    connection,
    `UPDATE teaching_allocations
            SET status = ?, 
              end_date = NOW() 
            WHERE teacherid = ? AND status = ?
          `,
    ["ended", teacherid, "active"],
  );

// Check if teacher has active assignments
exports.hasActiveAssignments = async(teacherid, connection = null) => {
  // Check various active assignments
  const classAssignments = connectionQuery(
    connection,
    'SELECT COUNT(*) as count FROM class_teacher_assignment WHERE teacherid = ? AND status = "ACTIVE"',
    [teacherid],
  );

  const hodAppointments = connectionQuery(
    connection,
    'SELECT COUNT(*) as count FROM hod_appointment WHERE teacherid = ? AND status = "active"',
    [teacherid],
  );

  const teachingAllocations = connectionQuery(
    connection,
    "SELECT COUNT(*) as count FROM teaching_allocations WHERE teacherid = ? AND end_date IS NULL",
    [teacherid],
  );

  const total =
    classAssignments.count +
    hodAppointments.count +
    teachingAllocations.count;

  return total > 0;
};

// End active assignments
exports.endActiveAssignments = async(teacherid, connection = null) => {
  const now = new Date();

  // End class teacher assignments
  connectionQuery(
    connection,
    `UPDATE class_teacher_assignment 
             SET status = 'ENDED', ended_at = ? 
             WHERE teacherid = ? AND status = 'ACTIVE'`,
    [now, teacherid],
  );

  // End HOD appointments
  connectionQuery(
    connection,
    `UPDATE hod_appointment 
             SET status = 'ended', end_date = ? 
             WHERE teacherid = ? AND status = 'active'`,
    [now, teacherid],
  );

  // End teaching allocations (set end date to now)
  connectionQuery(
    connection,
    `UPDATE teaching_allocations 
             SET end_date = ? 
             WHERE teacherid = ? AND end_date IS NULL`,
    [now, teacherid],
  );
};

// Soft delete teacher
exports.softDeleteById = (teacherid, connection = null) => 
  connectionQuery(
    connection,
    `UPDATE teachers 
             SET status = 'left', 
                 is_locked = 1,
                 updated_at = NOW() 
             WHERE teacherid = ?`,
    [teacherid],
  );

// Soft delete class teacher appointments
exports.softDeleteClassTeacherAppointment = (teacherid, connection = null) => 
  connectionQuery(
    connection,
    `UPDATE class_teacher_assignment 
             SET status = 'CANCELLED', 
                 ended_at = NOW() 
             WHERE teacherid = ? AND status = 'ACTIVE'`,
    [teacherid],
  );

// Soft delete HOD appointments
exports.softDeleteHodAppointment = (teacherid, connection = null) => 
  connectionQuery(
    connection,
    `UPDATE hod_appointment 
             SET status = 'cancelled', 
                 end_date = NOW() 
             WHERE teacherid = ? AND status = 'active'`,
    [teacherid],
  );

// Soft delete teacher departments
exports.softDeleteTeacherDepartment = (teacherid, connection = null) => 
  connectionQuery(
    connection,
    `UPDATE teacher_department 
             SET status = 'ended', 
                 end_date = NOW() 
             WHERE teacherid = ? AND status = 'active'`,
    [teacherid],
  );

// Soft delete teacher subjects
exports.softDeleteTeacherSubject = (teacherid, connection = null) => 
  connectionQuery(
    connection,
    `UPDATE teacher_subject 
             SET status = 'inactive' 
             WHERE teacherid = ? AND status = 'approved'`,
    [teacherid],
  );

// Log teacher deletion
exports.logTeacherDeletion = (teacherid, data, connection = null) =>
  connectionQuery(
    connection,
    `INSERT INTO teacher_audit_logs 
             (teacherid, action, details, performed_by, performed_at) 
             VALUES (?, 'SOFT_DELETE', ?, ?, ?)`,
    [teacherid, JSON.stringify(data), data.deleted_by, data.timestamp],
  );
