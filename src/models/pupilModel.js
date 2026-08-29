const { query, connectionQuery } = require("../utils/db.js");

// ==================== PUPIL LIST SQL ====================

const pupilListSql = `
  SELECT
    s.fname,
    s.middlename,
    s.lname,
    s.examno,
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
    g.guardian_nrc_no,
    g.fname AS guardianFname,
    g.lname AS guardianLname,
    g.phonenumber
  FROM students AS s
  JOIN studentclass sc
    ON sc.examno = s.examno
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
    ON stg.examno = s.examno
  JOIN guardian g
    ON g.guardian_nrc_no = stg.guardianid
`;
 
// ==================== FIND PUPIL ====================

exports.findByExamNo = (examno) =>
  query("SELECT examno FROM students WHERE examno = ?", [examno]);

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
      JOIN yearlevel yl ON yl.levelorder = c.levelid`,
    ),

    query(
      `SELECT guardiantypeid,
              guardiantypename AS relationship
       FROM guardiantype`,
    ),

    query("SELECT schoolyearid, yearname FROM schoolyear WHERE status = ?", [
      "OPEN",
    ]),

    query("SELECT * FROM terms WHERE status = ?", ["OPEN"]),

    query("SELECT * FROM studentstatus"),

    query("SELECT * FROM sponsor"),

    query("SELECT * FROM ovcstatus"),
  ]);
};

// ==================== GET ALL PUPILS ====================

exports.getAll = () => query(pupilListSql);

// ==================== SEARCH PUPILS ====================

exports.search = (examNumber) =>
  query(`${pupilListSql} WHERE s.examno = ?`, [examNumber]);

// ==================== GET EDIT DATA ====================

exports.getEditData = async (id) => {
  return Promise.all([
    query("SELECT classid, grade, class FROM class"),

    query(
      `SELECT guardiantypeid,
              guardiantypename AS relationship
       FROM guardiantype`,
    ),

    query("SELECT schoolyearid, yearname FROM schoolyear"),

    query("SELECT * FROM yearlevel"),

    query("SELECT * FROM studentstatus"),

    query("SELECT * FROM sponsor"),

    query("SELECT * FROM ovcstatus"),

    query(
      `SELECT
         s.examno,
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
         g.guardian_nrc_no, 
         g.fname AS guardianFname,
         g.lname AS guardianLname,
         g.phonenumber,
         gt.guardiantypename,
         gt.guardiantypeid
       FROM students AS s
       JOIN studentclass AS sc
         ON sc.examno = s.examno
       JOIN class AS c
         ON c.classid = sc.classid
       JOIN sponsor AS sp
         ON s.sponsor = sp.sponsorID
       JOIN studentstatus AS st
         ON st.studentStatusID = s.studentstatus
       JOIN ovcstatus AS ovc
         ON s.ovcstatus = ovc.ovcstatusid
       JOIN studentguardian AS sg
         ON sg.examno = s.examno
       JOIN guardian AS g
         ON g.guardian_nrc_no = sg.guardianid
       JOIN guardiantype AS gt
         ON gt.guardiantypeid = sg.guardiantypeid
       WHERE s.examno = ?`,
      [id],
    ),
  ]);
};

// ==================== CREATE STUDENT ====================

exports.createStudent = (connection, data) =>
  connectionQuery(
    connection,
    `INSERT INTO students
      ( 
        examno,
        fname,
        middlename,
        lname,
        dob,
        studentnrcno,
        gender,
        profilePicture,
        ovcstatus,
        sponsor,
        studentstatus,
        birthplace,
        nationality,
        religion,
        previous_school,
        phone,
        email,
        address,
        password
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.examno,
      data.fname,
      data.middlename,
      data.lname,
      data.dob,
      data.studentnrcno,
      data.gender,
      data.profilePicture,
      data.ovcstatus,
      data.sponsor,
      data.studentstatus,
      data.birthplace,
      data.nationality,
      data.religion,
      data.previous_school,
      data.studentPhoneNumber,
      data.email,
      data.address,
      data.hashedPassword
    ],
  );

// ==================== FIND STUDENT ON CONNECTION ====================

exports.findStudentOnConnection = (connection, examno) =>
  connectionQuery(connection, "SELECT examno FROM students WHERE examno = ?", [examno]);

// ==================== ADD YEAR LEVEL ====================

exports.addYearLevel = (connection, examno, yearlevel, schoolyear) =>
  connectionQuery(
    connection,
    `INSERT INTO studentyearlevel
      (examno, levelid, yearid)
      VALUES (?, ?, ?)`,
    [examno, yearlevel, schoolyear],
  );

// ==================== ADD CLASS ====================
exports.addClass = async (
  connection,
  examno,
  classid,
  termid,
  yearid,
  enrollment_type,
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
    [examno, classid, termid, yearid, enrollment_type],
  );

  return result.insertId;
};

// ==================== ADD REPORTING ====================
exports.addReporting = (
  connection,
  studentclassid,
  reporting_status,
  reported_by,
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
    [studentclassid, reporting_status, reported_by],
  );

// ==================== FIND GUARDIAN ====================

exports.findGuardian = (connection, guardian_nrc_no) =>
  connectionQuery(connection, "SELECT guardian_nrc_no FROM guardian WHERE guardian_nrc_no = ?", [
    guardian_nrc_no,
  ]);
 
// ==================== CREATE GUARDIAN ====================

exports.createGuardian = (connection, data) =>
  connectionQuery(
    connection,
    `INSERT INTO guardian
      (
        guardian_nrc_no,
        fname,
        lname,        
        guardian_occupation,
        phonenumber,
        guardian_alt_phone,
        email,
        address

      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.guardian_nrc_no, data.guardianFname, data.guardianLname, data.guardian_occupation,  data.phoneNumber, data.guardian_alt_phone, data.guardian_email, data.guardian_address],
  );

// ==================== LINK GUARDIAN ====================

exports.linkGuardian = (connection, data) =>
  connectionQuery(
    connection,
    `INSERT INTO studentguardian
      (
        examno,
        guardiantypeid,
        guardianid
      )
      VALUES (?, ?, ?)`,
    [data.examno, data.relationship, data.guardian_nrc_no],
  );

// ==================== UPDATE STUDENT ====================

exports.updateStudent = async (connection, data) => {
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
     WHERE examno = ?`,
    [
      data.fname,
      data.lname,
      data.gender,
      data.ovcstatus,
      data.sponsor,
      data.studentstatus,
      data.examno,
    ],
  );

  await connectionQuery(
    connection,
    `UPDATE studentyearlevel
     SET levelid = ?
     WHERE examno = ?`,
    [data.yearlevel, data.examno],
  );

  await connectionQuery(
    connection,
    `UPDATE studentclass
     SET classid = ?
     WHERE examno = ?`,
    [data.classid, data.examno],
  );
};

// ==================== UPSERT GUARDIAN ====================

exports.upsertGuardianAndRelationship = async (connection, data) => {
  const guardian = await exports.findGuardian(connection, data.guardian_nrc_no);

  if (guardian.length > 0) {
    await connectionQuery(
      connection,
      `UPDATE guardian
       SET
         fname = ?,
         lname = ?,
         phonenumber = ?
       WHERE guardian_nrc_no = ?`,
      [data.guardianFname, data.guardianLname, data.phoneNumber, data.guardian_nrc_no],
    );
  } else {
    await exports.createGuardian(connection, data);
  }

  const relationship = await connectionQuery(
    connection,
    "SELECT * FROM studentguardian WHERE examno = ?",
    [data.examno],
  );

  if (relationship.length > 0) {
    await connectionQuery(
      connection,
      `UPDATE studentguardian
       SET
         guardiantypeid = ?,
         guardianid = ?
       WHERE examno = ?`,
      [data.relationship, data.guardian_nrc_no, data.examno],
    );
  } else {
    await exports.linkGuardian(connection, data);
  }
};

// ==================== PROFILE PICTURE ====================

exports.getProfilePicture = (examno) =>
  query("SELECT profilePicture FROM students WHERE examno = ?", [examno]);

// ==================== DELETE STUDENT ====================

exports.deleteStudent = (examno) =>
  query("DELETE FROM students WHERE examno = ?", [examno]);

// ==================== DELETE ORPHANED GUARDIANS ====================

exports.deleteOrphanedGuardians = () =>
  query(`
    DELETE g
    FROM guardian g
    LEFT JOIN studentguardian stg
      ON g.guardian_nrc_no = stg.guardianid
    WHERE stg.guardianid IS NULL
  `);

exports.findEnrollmentOnConnection = (connection, examno, schoolyear, termid ) => 
  connectionQuery(
  connection,`
        SELECT
            sc.studentclassid,
            sc.examno,
            sc.classid,
            sc.termid,
            sc.yearid
        FROM studentclass sc
        WHERE sc.examno = ?
          AND sc.yearid = ?
          AND sc.termid = ?
        LIMIT 1
    `, [examno, schoolyear, termid]
)

exports.findReturningStudent = (examno) => {
  const sql = `
      SELECT
          s.examno,
          s.fname,
          s.middlename,
          s.lname,
          s.gender,
          s.dob,
          s.email,
          s.phone AS studentPhoneNumber,
          s.birthplace,
          s.nationality,
          s.religion,
          s.studentnrcno,
          s.previous_school,
          s.address,
          s.status,
          
          ovc.ovcstatusid,
          ovc.ovcstatus,
          
          sts.studentStatusID,
          sts.studentStatus,
          
          sp.sponsorID,
          sp.sponsorName,

          sc.classid,
          sc.termid,
          sc.yearid,

          c.class,
          c.levelid,
          
          g.guardian_nrc_no,
          g.fname AS guardianFname,
          g.lname AS guardianLname,
          g.phonenumber AS phoneNumber,
          g.email AS guardian_email,
          g.address AS guardian_address,
          
          gt.guardiantypeid,
          gt.guardiantypename AS relationship,

          tm.termname,
          
          sy.schoolyearid,
          sy.yearname,

          yl.levelname

      FROM students s

      LEFT JOIN studentclass sc
          ON sc.examno = s.examno
          
      LEFT JOIN ovcstatus ovc
      	  ON ovc.ovcstatusid = s.ovcstatus
          
      LEFT JOIN studentstatus sts
      	  ON sts.studentStatusID = s.studentstatus
          
      LEFT JOIN sponsor sp
      	  ON sp.sponsorID = s.sponsor

      LEFT JOIN class c
          ON c.classid = sc.classid

      LEFT JOIN terms tm
		      ON tm.termid = sc.termid
      LEFT JOIN schoolyear sy
      	  ON sy.schoolyearid = tm.yearid

      LEFT JOIN yearlevel yl
          ON yl.levelorder = c.levelid

      LEFT JOIN studentguardian sg
          ON sg.examno = s.examno

      LEFT JOIN guardian g
          ON g.guardian_nrc_no = sg.guardianid
          
      LEFT JOIN guardiantype gt
      	  ON gt.guardiantypeid = sg.guardiantypeid

      WHERE s.examno = ?

      ORDER BY
          sc.yearid DESC,
          sc.termid DESC

      LIMIT 1;
    `;

  return query(sql, [examno]);
};
