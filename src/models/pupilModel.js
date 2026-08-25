const {
  query,
  connectionQuery
} = require('../utils/db.js');


// ==================== PUPIL LIST SQL ====================

const pupilListSql = `
  SELECT
    s.fname,
    s.middlename,
    s.lname,
    s.id,
    s.dob,
    s.gender,
    s.enrollmentdate,
    s.status,
    c.classid,
    c.class,
    yl.levelorder,
    yl.levelname,
    yl.nextlevelorder,
    sp.sponsorName AS sponsor,
    st.studentStatus AS studentstatus,
    ovc.ovcstatus AS ovcstatus,
    g.nrc_no,
    g.fname AS guardianFname,
    g.lname AS guardianLname,
    g.phonenumber
  FROM students AS s
  JOIN studentclass sc
    ON sc.examno = s.id
  JOIN class c
    ON c.classid = sc.classid
  JOIN yearlevel yl 
    ON yl.levelorder = c.levelid
  JOIN sponsor AS sp
    ON s.sponsor = sp.sponsorID
  JOIN studentstatus AS st
    ON st.studentStatusID = s.studentstatus
  JOIN ovcstatus AS ovc
    ON s.ovcstatus = ovc.ovcstatusid
  JOIN studentguardian AS stg
    ON stg.examno = s.id
  JOIN guardian g
    ON g.nrc_no = stg.guardianid
`;


// ==================== FIND PUPIL ====================

exports.findByExamNo = (examno) =>
  query(
    'SELECT id FROM students WHERE id = ?',
    [examno]
  );


// ==================== REGISTRATION OPTIONS ====================

exports.getRegistrationOptions = async () => {
  return Promise.all([
    query(
      `SELECT 
          c.classid,  
          c.levelid,
          yl.levelorder,
          yl.levelname,
          yl.nextlevelorder,
          class
      FROM class c
      JOIN yearlevel yl ON yl.levelorder = c.levelid`
    ),

    query(
      `SELECT guardiantypeid,
              guardiantypename AS relationship
       FROM guardiantype`
    ),

    query(
      'SELECT schoolyearid, yearname FROM schoolyear WHERE status = ?', ['OPEN']
    ),

    query(
      'SELECT * FROM terms WHERE status = ?', ['OPEN']
    ),

    query(
      'SELECT * FROM studentstatus'
    ),

    query(
      'SELECT * FROM sponsor'
    ),

    query(
      'SELECT * FROM ovcstatus'
    )
  ]);
};


// ==================== GET ALL PUPILS ====================

exports.getAll = () =>
  query(pupilListSql);


// ==================== SEARCH PUPILS ====================

exports.search = (examNumber) =>
  query(
    `${pupilListSql} WHERE s.id = ?`,
    [examNumber]
  );


// ==================== GET EDIT DATA ====================

exports.getEditData = async (id) => {
  return Promise.all([
    query(
      'SELECT classid, grade, class FROM class'
    ),

    query(
      `SELECT guardiantypeid,
              guardiantypename AS relationship
       FROM guardiantype`
    ),

    query(
      'SELECT schoolyearid, yearname FROM schoolyear'
    ),

    query(
      'SELECT * FROM yearlevel'
    ),

    query(
      'SELECT * FROM studentstatus'
    ),

    query(
      'SELECT * FROM sponsor'
    ),

    query(
      'SELECT * FROM ovcstatus'
    ),

    query(
      `SELECT
         s.id,
         s.fname,
         s.lname,
         s.dob,
         s.gender,
         sc.studentclassid,
         c.classid,
         c.grade,
         c.class,
         s.sponsor AS sponsorID,
         sp.sponsorName,
         s.studentstatus AS studentStatusID,
         st.studentStatus,
         s.ovcstatus AS ovcstatusid,
         ovc.ovcstatus,
         g.nrc_no,
         g.fname AS guardianFname,
         g.lname AS guardianLname,
         g.phonenumber,
         gt.guardiantypename,
         gt.guardiantypeid
       FROM students AS s
       JOIN studentclass AS sc
         ON sc.examno = s.id
       JOIN class AS c
         ON c.classid = sc.classid
       JOIN sponsor AS sp
         ON s.sponsor = sp.sponsorID
       JOIN studentstatus AS st
         ON st.studentStatusID = s.studentstatus
       JOIN ovcstatus AS ovc
         ON s.ovcstatus = ovc.ovcstatusid
       JOIN studentguardian AS sg
         ON sg.examno = s.id
       JOIN guardian AS g
         ON g.nrc_no = sg.guardianid
       JOIN guardiantype AS gt
         ON gt.guardiantypeid = sg.guardiantypeid
       WHERE s.id = ?`,
      [id]
    )
  ]);
};


// ==================== CREATE STUDENT ====================

exports.createStudent = (connection, data) =>
  connectionQuery(
    connection,
    `INSERT INTO students
      (
        id,
        fname,
        middlename,
        lname,
        password,
        dob,
        gender,
        profilePicture,
        ovcStatus,
        sponsor,
        studentStatus,
        status,
        usertype,
        phone,
        email
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'pupil', ?, ?)`,
    [
      data.examno,
      data.fname,
      data.middlename,
      data.lname,
      data.hashedPassword,
      data.dob,
      data.gender,
      data.profilePicture,
      data.ovcstatus,
      data.sponsor,
      data.studentstatus,
      data.studentPhoneNumber,
      data.email
    ]
  );


// ==================== FIND STUDENT ON CONNECTION ====================

exports.findStudentOnConnection = (
  connection,
  examno
) =>
  connectionQuery(
    connection,
    'SELECT id FROM students WHERE id = ?',
    [examno]
  );


// ==================== ADD YEAR LEVEL ====================

exports.addYearLevel = (
  connection,
  examno,
  yearlevel,
  schoolyear
) =>
  connectionQuery(
    connection,
    `INSERT INTO studentyearlevel
      (examno, levelid, yearid)
      VALUES (?, ?, ?)`,
    [
      examno,
      yearlevel,
      schoolyear
    ]
  );


// ==================== ADD CLASS ====================

// exports.addClass = (
//   connection,
//   examno,
//   classid,
//   termid,
//   yearid,
//   enrollment_type
// ) =>
//   connectionQuery(
//     connection,
//     `INSERT INTO studentclass
//       (examno, classid, termid, yearid, enrollment_type)
//       VALUES (?, ?, ?, ?, ?)`,
//     [
//       examno,
//       classid,
//       termid,
//       yearid,
//       enrollment_type
//     ]
//   );

exports.addClass = async (
    connection,
    examno,
    classid,
    termid,
    yearid,
    enrollment_type
) => {
    const result = await connectionQuery(
        connection,
        `INSERT INTO studentclass
        (
            examno,
            classid,
            termid,
            yearid,
            enrollment_type
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            examno,
            classid,
            termid,
            yearid,
            enrollment_type
        ]
    );

    return result.insertId;
};

// ==================== ADD REPORTING ====================
exports.addReporting = (
    connection,
    studentclassid,
    reporting_status,
    reported_by
) =>
    connectionQuery(
        connection,
        `INSERT INTO student_reporting
        (
            studentclassid,
            status,
            reported_by
        )
        VALUES (?, ?, ?)`,
        [
            studentclassid,
            reporting_status,
            reported_by
        ]
    );

// ==================== FIND GUARDIAN ====================

exports.findGuardian = (
  connection,
  nrcno
) =>
  connectionQuery(
    connection,
    'SELECT nrc_no FROM guardian WHERE nrc_no = ?',
    [nrcno]
  );


// ==================== CREATE GUARDIAN ====================

exports.createGuardian = (
  connection,
  data
) =>
  connectionQuery(
    connection,
    `INSERT INTO guardian
      (
        nrc_no,
        fname,
        lname,
        phonenumber
      )
      VALUES (?, ?, ?, ?)`,
    [
      data.nrcno,
      data.guardianFname,
      data.guardianLname,
      data.phoneNumber
    ]
  );


// ==================== LINK GUARDIAN ====================

exports.linkGuardian = (
  connection,
  data
) =>
  connectionQuery(
    connection,
    `INSERT INTO studentguardian
      (
        examno,
        guardiantypeid,
        guardianid
      )
      VALUES (?, ?, ?)`,
    [
      data.examno,
      data.relationship,
      data.nrcno
    ]
  );


// ==================== UPDATE STUDENT ====================

exports.updateStudent = async (
  connection,
  data
) => {
  await connectionQuery(
    connection,
    `UPDATE students
     SET
       fname = ?,
       lname = ?,
       gender = ?,
       ovcstatus = ?,
       sponsor = ?,
       studentstatus = ?
     WHERE id = ?`,
    [
      data.fname,
      data.lname,
      data.gender,
      data.ovcstatus,
      data.sponsor,
      data.studentstatus,
      data.examno
    ]
  );

  await connectionQuery(
    connection,
    `UPDATE studentyearlevel
     SET levelid = ?
     WHERE examno = ?`,
    [
      data.yearlevel,
      data.examno
    ]
  );

  await connectionQuery(
    connection,
    `UPDATE studentclass
     SET classid = ?
     WHERE examno = ?`,
    [
      data.classid,
      data.examno
    ]
  );
};


// ==================== UPSERT GUARDIAN ====================

exports.upsertGuardianAndRelationship = async (
  connection,
  data
) => {
  const guardian =
    await exports.findGuardian(
      connection,
      data.nrcno
    );

  if (guardian.length > 0) {
    await connectionQuery(
      connection,
      `UPDATE guardian
       SET
         fname = ?,
         lname = ?,
         phonenumber = ?
       WHERE nrc_no = ?`,
      [
        data.guardianFname,
        data.guardianLname,
        data.phoneNumber,
        data.nrcno
      ]
    );
  } else {
    await exports.createGuardian(
      connection,
      data
    );
  }

  const relationship =
    await connectionQuery(
      connection,
      'SELECT * FROM studentguardian WHERE examno = ?',
      [data.examno]
    );

  if (relationship.length > 0) {
    await connectionQuery(
      connection,
      `UPDATE studentguardian
       SET
         guardiantypeid = ?,
         guardianid = ?
       WHERE examno = ?`,
      [
        data.relationship,
        data.nrcno,
        data.examno
      ]
    );
  } else {
    await exports.linkGuardian(
      connection,
      data
    );
  }
};


// ==================== PROFILE PICTURE ====================

exports.getProfilePicture = (examno) =>
  query(
    'SELECT profilePicture FROM students WHERE id = ?',
    [examno]
  );


// ==================== DELETE STUDENT ====================

exports.deleteStudent = (examno) =>
  query(
    'DELETE FROM students WHERE id = ?',
    [examno]
  );


// ==================== DELETE ORPHANED GUARDIANS ====================

exports.deleteOrphanedGuardians = () =>
  query(`
    DELETE g
    FROM guardian g
    LEFT JOIN studentguardian stg
      ON g.nrc_no = stg.guardianid
    WHERE stg.guardianid IS NULL
  `);