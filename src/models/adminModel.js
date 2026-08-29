const { query } = require('../utils/db.js');


// ==================== SCHOOL YEARS ====================

exports.getSchoolYears = () =>
  query('SELECT * FROM schoolyear');


exports.findSchoolYear = (yearid) =>
  query(
    'SELECT * FROM schoolyear WHERE schoolyearid = ?',
    [yearid]
  );


exports.createSchoolYear = (data) =>
  query(
    `INSERT INTO schoolyear
     (yearname, startdate, enddate)
     VALUES (?, ?, ?)`,
    [
      data.yearname,
      data.startdate,
      data.enddate
    ]
  );


exports.deleteSchoolYear = (id) =>
  query(
    'DELETE FROM schoolyear WHERE schoolyearid = ?',
    [id]
  );


// ==================== TERMS ====================

exports.getTerms = () =>
  query(`
    SELECT
      tm.termid,
      sy.yearname,
      tm.termname,
      tm.status,
      tm.startdate,
      tm.enddate
    FROM terms AS tm
    JOIN schoolyear AS sy
      ON sy.schoolyearid = tm.yearid
  `);

  exports.getTermById = (termid) =>
  query(`
    SELECT
      tm.termid,
      sy.yearname,
      tm.termname,
      tm.status,
      tm.startdate,
      tm.enddate
    FROM terms AS tm
    JOIN schoolyear AS sy
      ON sy.schoolyearid = tm.yearid
    WHERE tm.termid = ?
  `, [termid]);

  exports.get_Open_Terms = () =>
  query(`
    SELECT
      tm.termid,
      sy.yearname,
      tm.termname,
      tm.status,
      tm.startdate,
      tm.enddate
    FROM terms AS tm
    JOIN schoolyear AS sy
      ON sy.schoolyearid = tm.yearid
    WHERE tm.status = ?
  `, ['OPEN']);


exports.getSchoolYearsBasic = () =>
  query(
    'SELECT * FROM schoolyear'
  );


exports.findSchoolYearById = (yearid) =>
  query(
    'SELECT schoolyearid FROM schoolyear WHERE schoolyearid = ?',
    [yearid]
  );

  exports.findSchoolYearAndTermnumber = (yearid, termnumber) =>
  query(
    'SELECT yearid, termnumber FROM terms WHERE yearid = ? AND termnumber = ?',
    [yearid, termnumber]
  );


exports.findTermNumber = (termnumber) =>
  query(
    'SELECT termnumber FROM terms WHERE termnumber = ?',
    [termnumber]
  );


exports.createTerm = (data) =>
  query(
    `INSERT INTO terms
     (yearid, termnumber, termname, startdate, enddate)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.yearid,
      data.termnumber,
      data.termname,
      data.startdate,
      data.enddate
    ]
  );


exports.deleteTerm = (id) =>
  query(
    'DELETE FROM terms WHERE termid = ?',
    [id]
  );


  exports.openTerm = (termid, opened_by) =>
  query(
    `UPDATE terms
      SET
        status = 'open',
        closed_at = CURRENT_TIMESTAMP,
        closed_by = ?
      WHERE termid = ?
        AND (status = 'closed' OR status = 'upcoming')`,
    [opened_by, termid]
  );


  exports.closeTerm = (termid, closed_by) =>
  query(
    `UPDATE terms
      SET
        status = 'closed',
        closed_at = CURRENT_TIMESTAMP,
        closed_by = ?
      WHERE termid = ?
        AND status = 'open'`,
    [closed_by, termid]
  );


// ==================== CLASSES ====================

exports.getClasses = () =>
  query(`
    SELECT
      c.classid,
      c.class,
      yl.levelorder,
      yl.levelname,
      yl.nextlevelorder,
      c.status
    FROM class AS c
    JOIN yearlevel AS yl
      ON c.levelid = yl.levelorder
  `);


exports.getClassOptions = () =>
  Promise.all([
    query(
      'SELECT termid, termnumber FROM terms'
    ),
    query(
      'SELECT * FROM yearlevel'
    )
  ]);


exports.findClass = (
  grade,
  section,
  termid
) =>
  query(
    `SELECT *
     FROM class
     WHERE grade = ?
       AND section = ?
       AND termid = ?`,
    [
      grade,
      section,
      termid
    ]
  );


exports.createClass = (data) =>
  query(
    `INSERT INTO class
     (termid, grade, section)
     VALUES (?, ?, ?)`,
    [
      data.termid,
      data.grade,
      data.section
    ]
  );


exports.deleteClass = (id) =>
  query(
    'DELETE FROM class WHERE classid = ?',
    [id]
  );


// ==================== DEPARTMENTS ====================
 
exports.getDepartments = () =>
  query(
    'SELECT * FROM department'
  );


exports.findDepartment = (name) =>
  query(
    'SELECT * FROM department WHERE departmentname = ?',
    [name]
  );


exports.createDepartment = (name) =>
  query(
    `INSERT INTO department
     (departmentname)
     VALUES (?)`,
    [name]
  );


exports.deleteDepartment = (id) =>
  query(
    'DELETE FROM department WHERE departmentid = ?',
    [id]
  );


// ==================== HOD ====================

exports.getHodOptions = () =>
  Promise.all([
    query(
      `SELECT teacherid, fname, lname
       FROM teachers
       WHERE usertype = ?`,
      ['HOD']
    ),

    query(
      'SELECT * FROM department'
    )
  ]);


exports.createTeacherDepartment = (
  teacherid,
  departmentid
) =>
  query(
    `INSERT INTO teacher_department
     (teacherid, departmentid)
     VALUES (?, ?)`,
    [
      teacherid,
      departmentid
    ]
  );


exports.getHods = () =>
  query(
    `
    SELECT
     t.teacherid,
     t.employee_no,
     t.fname,
     t.middlename,
     t.lname,
     t.gender,
     t.email,
     d.departmentid,
     d.departmentname
     FROM hod_appointment hd 
     JOIN teachers t
     ON t.teacherid = hd.teacherid
     JOIN department d
     ON d.departmentid = hd.departmentid
    `
  );


// ==================== TEACHER ALLOCATION ====================

exports.getTeacherAllocationOptions = () =>
  Promise.all([
    query(
      `SELECT teacherid, fname, lname
       FROM teachers
       WHERE usertype = ?`,
      ['Teacher']
    ),

    query(
      'SELECT * FROM department'
    )
  ]);


exports.getDepartmentTeachers = (teacherId) =>
  query(
    `SELECT dp.departmentname
     FROM teacher_department AS td
     JOIN department AS dp
       ON td.departmentid = dp.departmentid
     WHERE td.teacherid = ?`,
    [teacherId]
  );


exports.getTeachersInDepartment = (
  departmentName
) =>
  query(
    `SELECT
       trs.fname,
       trs.lname,
       dp.departmentname
     FROM teacher_department AS td
     JOIN teachers AS trs
       ON td.teacherid = trs.teacherid
     JOIN department AS dp
       ON dp.departmentid = td.departmentid
     WHERE dp.departmentname = ?
       AND trs.usertype = ?`,
    [
      departmentName,
      'Teacher'
    ]
  );


// ==================== GUARDIAN TYPES ====================

exports.getGuardianTypes = () =>
  query(
    'SELECT * FROM guardiantype'
  );


exports.findGuardianType = (name) =>
  query(
    `SELECT guardiantypename
     FROM guardiantype
     WHERE guardiantypename = ?`,
    [name]
  );


exports.createGuardianType = (name) =>
  query(
    `INSERT INTO guardiantype
     (guardiantypename)
     VALUES (?)`,
    [name]
  );


exports.deleteGuardianType = (id) =>
  query(
    `DELETE FROM guardiantype
     WHERE guardiantypeid = ?`,
    [id]
  );