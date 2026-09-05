const bcrypt = require("bcrypt");
const teacherModel = require("../models/teacherModel");
const subjectModel = require("../models/subjectModel");
const authModel = require("../models/authModel");
const fs = require("fs").promises;
const path = require("path");
const { removeFileIfExists } = require("../utils/fileUtils.js");
const { response } = require("express");
const {
  getConnection,
  beginTransaction,
  commit,
  rollback,
} = require("../utils/db.js");

async function registerTeacher({ data, file }) {
  const username = data.username.toLowerCase();
  const fname = data.Fname.toUpperCase();
  const lname = data.Lname.toUpperCase();
  const email = data.email.toLowerCase();

  const existing = await teacherModel.findByUsername(username);

  const existingEmail = await teacherModel.findByEmail(email);

  const existingEmployeeNo = await teacherModel.findByEmployeeNo(
    data.employee_no,
  );

  if (data.usertype === "ADMIN") {
    const admins = await teacherModel.countAdmins();

    if (admins.length) {
      throw new Error("You must have only one Admin in the system.");
    }
  }

  if (existing.length) {
    throw new Error("Username already exists.");
  }

  if (existingEmail.length) {
    throw new Error("Email already exists.");
  }

  if (existingEmployeeNo.length) {
    throw new Error("EmployeeNo already exists.");
  }

  const password = await bcrypt.hash(data.password, 10);

  return teacherModel.create({
    usertype: data.usertype,
    username,
    fname,
    lname,
    email,
    password,
    gender: data.gender,
    profilePicture: file?.filename ?? null,
    employee_no: data.employee_no,
    middlename: data.otherNames,
    phone: data.phoneNumber,
    employment_date: data.employmentDate,
  });
}

async function getSubjectAllocation(teacherId, allocated) {
  const department = await teacherModel.getDepartment(teacherId);

  if (!department.length) {
    return {
      department: null,
      records: [],
    };
  }

  const departmentId = department[0].departmentid;

  const records = allocated
    ? await teacherModel.getAllocatedByDepartment(departmentId)
    : await teacherModel.getUnallocatedByDepartment(departmentId);

  return {
    department: department[0],
    records,
  };
}

async function create_teaching_allocations(
    teacherid,
    class_subject_id,
    termid,
    allocated_by 
) {
    try {
        // Check whether the teacher is already allocated
        const results =
            await teacherModel.getCreateTeacherAllocationsOptions(
                teacherid,
                class_subject_id,
                termid
            );

        if (results && results.length > 0) {
            return {
                success: false,
                status: 409,
                message: "Teacher is already allocated to this class subject."
            };
        }

        // Create allocation
        const allocation =
            await teacherModel.createTeachingAllocations(
                teacherid,
                class_subject_id,
                termid,
                allocated_by
            );

        if (!allocation) {
            return {
                success: false,
                status: 500,
                message: "Teacher class allocation failed."
            };
        }

        return {
            success: true,
            status: 201,
            message: "Teacher class allocation was successful.",
            data: allocation
        };

    } catch (err) {
        console.error("Teaching allocation error:", err);

        return {
            success: false,
            status: 500,
            message: "An error occurred while creating the teaching allocation."
        };
    }
}


async function assignSubject(teacherid, subjectcode, approved_by) {

    // 1. Find the subject
    const subject = await subjectModel.findByCode(subjectcode);

    if (!subject || subject.length === 0) {
        return {
            success: false,
            status: 404,
            message: "Subject not found."
        };
    }

    // 2. Find departments assigned to the teacher
    const teacherDepartments =
        await teacherModel.findTeacherDepartment(teacherid);

    if (!teacherDepartments || teacherDepartments.length === 0) {
        return {
            success: false,
            status: 409,
            message:
                "Allocate the teacher to a department before assigning subjects."
        };
    }

    // 3. Check whether teacher belongs to subject's department
    const belongsToDepartment = teacherDepartments.some(
        (department) =>
            Number(department.departmentid) ===
            Number(subject[0].departmentid)
    );

    if (!belongsToDepartment) {
        return {
            success: false,
            status: 403,
            message:
                "Teacher cannot be assigned this subject because the teacher is not allocated to its department."
        };
    }

    // 4. Prevent duplicate subject allocation
    const existing =
        await teacherModel.findTeacherAssignedSubject(
            teacherid,
            subjectcode
        );

    if (existing.length > 0) {
        return {
            success: false,
            status: 409,
            message:
                "Teacher is already allocated to this subject."
        };
    }

    // 5. Assign subject
    await teacherModel.assignTeacherSubject(
        teacherid,
        subjectcode,
        approved_by
    );

    return {
        success: true,
        status: 201,
        message:
            "Subject successfully allocated to teacher."
    };
}


// ========================= partial deletion of teacher =========================
async function softDeleteTeacher(teacherid) {
    // Start a database transaction
    const connection = await getConnection();
    
    try {
        await beginTransaction(connection);
        
        // 1. Find teacher
        const teacher = await teacherModel.findByIdOnConnection(teacherid, connection);
        
        if (!teacher || teacher.length === 0) {
            throw new Error("Teacher not found.");
        }
        
        const teacherData = teacher[0];

        // console.log(teacherData.usertype)
        
        // 2. Prevent deletion of the last admin
        if (teacherData.usertype === "admin") {
            const [adminCount] = await teacherModel.countAdminsOnConnection(connection);

            // console.log(adminCount.count <= 1)
            
            if (adminCount.count <= 1) {
                throw new Error("Cannot delete the last admin user. At least one admin must remain.");
            }
        }
        
        // 3. Check if teacher has active assignments
        const hasActiveAssignments = await teacherModel.hasActiveAssignments(teacherid, connection);
        
        if (hasActiveAssignments) {
            // Option A: Throw error and let user decide
            // throw new Error("Teacher has active assignments. Please reassign or end them first.");
            
            // Option B: Automatically end active assignments
            await teacherModel.endActiveAssignments(teacherid, connection);
        }
        
        // 4. Perform soft deletes in the correct order
        await teacherModel.softDeleteById(teacherid, connection);
        await teacherModel.softDeleteClassTeacherAppointment(teacherid, connection);
        await teacherModel.softDeleteHodAppointment(teacherid, connection);
        await teacherModel.softDeleteTeacherDepartment(teacherid, connection);
        await teacherModel.softDeleteTeacherSubject(teacherid, connection);
        await teacherModel.softDeleteTeacherAllocations(teacherid, connection);
        
        // 5. Log the action
        // await teacherModel.logTeacherDeletion(teacherid, {
        //     deleted_by: getCurrentUserId(),
        //     reason: 'Manual soft delete',
        //     timestamp: new Date()
        // }, connection);
        
        // Commit transaction
         await commit(connection);
        
        return {
            success: true,
            message: `Teacher ${teacherData.fname} ${teacherData.lname} has been deactivated successfully.`,
            teacherId: teacherid
        };
        
    } catch (error) {
        // Rollback on error
        if (connection) {
            await rollback(connection);
        }
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}


// ====================PERMANENTLY DELETE TEACHER NOT FULLY IMPLEMENTED===============================
async function deleteTeacher(username, profileDirectory, backupDirectory) {
  const teacher = await teacherModel.findByUsername(username);
  const profilePicture = teacher[0]?.profilePicture;

  const imagePath = profilePicture
    ? path.join(profileDirectory, profilePicture)
    : null;

  const backupPath = profilePicture
    ? path.join(backupDirectory, profilePicture)
    : null;

  if (!teacher.length) {
    throw new Error("Teacher not found.");
  }

  if (teacher[0].usertype === "Admin") {
    const admins = await teacherModel.countAdmins();

    if (admins.length <= 1) {
      throw new Error("You must have at least one Admin in the system.");
    }
  }

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
    await teacherModel.deleteByUsername(username);
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


// ====================reactivate teacher account ===========================
async function reactivate_teacher(teacherid) {
    // Start a database transaction
    const connection = await getConnection();
    
    try {
        await beginTransaction(connection);
        
        // 1. Find teacher
        const teacher = await teacherModel.findByIdOnConnection(teacherid, connection);
        
        if (!teacher || teacher.length === 0) {
            throw new Error("Teacher not found.");
        }
        
        const teacherData = teacher[0];

        // console.log(teacherData.usertype)
        
        // 4. Perform soft deletes in the correct order
        await teacherModel.activateById(teacherid, connection);

        await teacherModel.activeTeacherDepartment(teacherid, connection);
        await teacherModel.activateTeacherSubject(teacherid, connection);
        
        // 5. Log the action
        // await teacherModel.logTeacherDeletion(teacherid, {
        //     deleted_by: getCurrentUserId(),
        //     reason: 'Manual soft delete',
        //     timestamp: new Date()
        // }, connection);
        
        // Commit transaction
         await commit(connection);
        
        return {
            success: true,
            message: `Teacher ${teacherData.fname} ${teacherData.lname} has been deactivated successfully.`,
            teacherId: teacherid
        };
        
    } catch (error) {
        // Rollback on error
        if (connection) {
            await rollback(connection);
        }
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}




async function lockAccount(req, res, username) {
  const users = await teacherModel.findByUsername(username);

  if (!users.length) {
    return response(res, "user not found.");
  }

  const account = users[0];

  // Prevent self-locking
  if (Number(account.teacherid) === Number(req.user.teacherid)) {
    return response(res, "You cannot lock your own account.");
  }

  // If the account is an Admin, ensure another active Admin remains
  if (account.usertype === "admin") {
    const activeAdminCount = await teacherModel.countAdmins();

    if (activeAdminCount <= 1) {
      return response(
        res,
        "This account cannot be locked because it is the last active Administrator account.",
      );
    }
  }

  return await authModel.disableLogin(account.teacherid);
}



async function unlockAccount(username) {
  const teacher = await teacherModel.findByUsername(username);

  if (!teacher.length) {
    return response(res, "Teacher not found.");
  }

  return authModel.enableLogin(teacher[0].teacherid);
}

module.exports = {
  registerTeacher,
  getSubjectAllocation,
  create_teaching_allocations,
  assignSubject,
  softDeleteTeacher,
  reactivate_teacher,
  deleteTeacher,
  lockAccount,
  unlockAccount,
};
