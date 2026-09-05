const bcrypt = require("bcrypt");
const path = require("path");
// const fs = require('fs');
const fs = require("fs").promises;

const {
  getConnection,
  beginTransaction,
  commit,
  rollback,
} = require("../utils/db.js");

const pupilModel = require("../models/pupilModel.js");
const { removeFileIfExists } = require("../utils/fileUtils.js");

// BEGIN TRANSACTION
// Create student
// Create yearly level
// Create term enrolment
// Create reporting record
// COMMIT

async function getRegistrationData() {
  const [
    foundClass,
    guardiantype,
    schoolyear,
    foundTerm,
    studentstatus,
    sponsor,
    ovcstatus,
  ] = await pupilModel.getRegistrationOptions();

  return {
    foundClass,
    guardiantype,
    schoolyear,
    foundTerm,
    studentstatus,
    sponsor,
    ovcstatus,
  };
}

async function registerPupil({
  reported_by,
  reporting_status,
  enrollment_type,
  data,
  file,
  profileDirectory,
}) {
  const connection = await getConnection();

  const profilePicture = file?.filename ?? null;

  const imagePath = profilePicture
    ? path.join(profileDirectory, profilePicture)
    : null;

  try {
    await beginTransaction(connection);

    const existing = await pupilModel.findStudentOnConnection(
      connection,
      data.examno,
    );

    if (existing.length) {
      return {
        message:
          "Student already in the system. Update student records instead.",
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await pupilModel.createStudent(connection, {
      ...data,
      hashedPassword,
      profilePicture,
    });

    await pupilModel.addYearLevel(
      connection,
      data.examno,
      data.yearlevel,
      data.schoolyear,
    );

    const studentclassid = await pupilModel.addClass(
      connection,
      data.examno,
      data.classid,
      data.termid,
      data.schoolyear,
      enrollment_type,
    );

    await pupilModel.addReporting(
      connection,
      studentclassid,
      reporting_status,
      reported_by,
    );

    const guardian = await pupilModel.findGuardian(
      connection,
      data.guardian_nrc_no,
    );

    if (!guardian.length) {
      await pupilModel.createGuardian(connection, data);
    }

    await pupilModel.linkGuardian(connection, data);

    await commit(connection);

    return {
      message: "Student successfully registered",
    };
  } catch (err) {
    console.log(err);
    await rollback(connection);

    if (imagePath) {
      await removeFileIfExists(imagePath).catch(() => {});
    }

    throw err;
  } finally {
    connection.release();
  }
}

async function registerReturningPupil({ reported_by, reporting_status, data }) {
  const connection = await getConnection();

  try {
    await beginTransaction(connection);

    /*
     * 1. Find existing student
     */
    const existing = await pupilModel.findStudentOnConnection(
      connection,
      data.examno,
    );

    if (!existing.length) {
      return {
        message: "Student was not found. Please search for the student first.",
      };
    }

    const student = existing[0];

    /*
     * 2. Check whether student is allowed to return
     */
    if (
      student.status &&
      ["graduated", "transferred", "withdrawn", "left"].includes(
        String(student.status).toLowerCase(),
      )
    ) {
      return {
        message: `Student cannot be enrolled because their status is ${student.status}.`,
      };
    }

    /*
     * 3. Prevent duplicate enrollment
     *
     * A student should not have two studentclass records
     * for the same academic year and term.
     */
    const existingEnrollment = await pupilModel.findEnrollmentOnConnection(
      connection,
      data.examno,
      data.schoolyear,
      data.termid,
    );

    if (existingEnrollment.length) {
      return {
        message: "Student is already enrolled for this academic year and term",
      };
    }

    /*
     * 4. Add the student to the new class
     */
    const studentclassid = await pupilModel.addClass(
      connection,
      data.examno,
      data.classid,
      data.termid,
      data.schoolyear,
      data.enrollment_type,
    );

    /*
     * 5. Record reporting
     */
    await pupilModel.addReporting(
      connection,
      studentclassid,
      reporting_status,
      reported_by,
    );

    /*
     * 6. Update current student information
     *
     */
    // await pupilModel.updateReturningStudent(connection, data.examno, {
    //   studentstatus: data.studentstatus,
    //   sponsor: data.sponsor,
    //   ovcstatus: data.ovcstatus,
    //   studentPhoneNumber: data.studentPhoneNumber,
    //   email: data.email,
    //   address: data.address,
    // });

    /*
     * 7. Guardian
     */
    // const guardian = await pupilModel.findGuardian(connection, data.guardian_nrc_no);

    // if (!guardian.length) {
    //   await pupilModel.createGuardian(connection, data);
    // }

    // await pupilModel.linkGuardian(connection, data);

    await commit(connection);

    return {
      message: "Returning student successfully enrolled",
      studentclassid,
    };
  } catch (err) {
    console.log(err);

    await rollback(connection);

    throw err;
  } finally {
    connection.release();
  }
}

async function changeStudentClass(
  examno,
  termid,
  yearid,
  previousStudentClassid,
  newClassid,
  enrollment_type,
  reported_by,
  reporting_status,
) {
  const connection = await getConnection();

  try {
    await beginTransaction(connection);

    await pupilModel.deactivateStudentClass(connection, previousStudentClassid);

    const studentclassid = await pupilModel.addClass(
      connection,
      examno,
      newClassid,
      termid,
      yearid,
      enrollment_type,
    );

    await pupilModel.addReporting(
      connection,
      studentclassid,
      reporting_status,
      reported_by,
    );

    await commit(connection);

    return {
      message: "Student class successfully updated",
    };
  } catch (err) {
    console.log(err);
    await rollback(connection);
    throw err;
  } finally {
    connection.release();
  }
}

async function updatePupil(data) {
  const connection = await getConnection();

  try {
    await beginTransaction(connection);

    await pupilModel.updateStudent(connection, data);

    await pupilModel.upsertGuardianAndRelationship(connection, data);

    await commit(connection);

    return {
      message: "Student record successfully updated",
    };
  } catch (error) {
    await rollback(connection);
    throw error;
  } finally {
    connection.release();
  }
}

async function deletePupil(examNumber, profileDirectory, backupDirectory) {
  const pictureRows = await pupilModel.getProfilePicture(examNumber);
  const profilePicture = pictureRows[0]?.profilePicture;

  const imagePath = profilePicture
    ? path.join(profileDirectory, profilePicture)
    : null;

  const backupPath = profilePicture
    ? path.join(backupDirectory, profilePicture)
    : null;

  // Back up the profile picture before deleting
  if (imagePath) {
    try {
      await fs.mkdir(backupDirectory, { recursive: true });
      await fs.copyFile(imagePath, backupPath);
      await removeFileIfExists(imagePath);
    } catch (error) {
      throw new Error(`Unable to back up profile picture: ${error.message}`);
    }
  }

  try {
    await pupilModel.deleteStudent(examNumber);
    await pupilModel.deleteOrphanedGuardians();

    if (backupPath) {
      await removeFileIfExists(backupPath);
    }
  } catch (error) {
    if (imagePath && backupPath) {
      await fs.copyFile(backupPath, imagePath).catch(() => {});
    }
    throw error;
  }
}

module.exports = {
  getRegistrationData,
  registerPupil,
  registerReturningPupil,
  changeStudentClass,
  updatePupil,
  deletePupil,
};
