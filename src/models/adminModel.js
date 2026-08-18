const { query } = require('../utils/db.js');


// ==================== SCHOOL YEARS ====================

exports.getSchoolYears = () =>
  query('SELECT * FROM schoolyear');


exports.findSchoolYear = (yearname) =>
  query(
    'SELECT * FROM schoolyear WHERE yearname = ?',
    [yearname]
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
      tm.termnumber,
      tm.startdate,
      tm.enddate
    FROM terms AS tm
    JOIN schoolyear AS sy
      ON sy.schoolyearid = tm.yearid
  `);


exports.getSchoolYearsBasic = () =>
  query(
    'SELECT schoolyearid, yearname FROM schoolyear'
  );


exports.findSchoolYearId = (yearname) =>
  query(
    'SELECT schoolyearid FROM schoolyear WHERE yearname = ?',
    [yearname]
  );


exports.findTermNumber = (termnumber) =>
  query(
    'SELECT termnumber FROM terms WHERE termnumber = ?',
    [termnumber]
  );


exports.createTerm = (data) =>
  query(
    `INSERT INTO terms
     (yearid, termnumber, startdate, enddate)
     VALUES (?, ?, ?, ?)`,
    [
      data.schoolyearid,
      data.termnumber,
      data.startdate,
      data.enddate
    ]
  );


exports.deleteTerm = (id) =>
  query(
    'DELETE FROM terms WHERE termid = ?',
    [id]
  );


// ==================== CLASSES ====================

exports.getClasses = () =>
  query(`
    SELECT
      c.classid,
      tm.termnumber,
      c.grade,
      c.section
    FROM class AS c
    JOIN terms AS tm
      ON tm.termid = c.termid
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
      `SELECT id, fname, lname
       FROM teachers
       WHERE usertype = ?`,
      ['HOD']
    ),

    query(
      'SELECT * FROM department'
    )
  ]);


exports.findTeacherDepartment = (
  teacherid,
  departmentid
) =>
  query(
    `SELECT teacherid
     FROM teacher_department
     WHERE teacherid = ?
       AND departmentid = ?`,
    [
      teacherid,
      departmentid
    ]
  );


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
    `SELECT
       trs.id,
       trs.fname,
       trs.lname,
       dp.departmentname
     FROM teacher_department AS td
     JOIN teachers AS trs
       ON td.teacherid = trs.id
     JOIN department AS dp
       ON dp.departmentid = td.departmentid
     WHERE trs.usertype = ?`,
    ['HOD']
  );


// ==================== TEACHER ALLOCATION ====================

exports.getTeacherAllocationOptions = () =>
  Promise.all([
    query(
      `SELECT id, fname, lname
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
       ON td.teacherid = trs.id
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