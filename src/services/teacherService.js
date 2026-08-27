const bcrypt = require("bcrypt");
const teacherModel = require("../models/teacherModel");
const authModel = require("../models/authModel");
const fs = require('fs').promises;
const path = require('path');
const { removeFileIfExists } = require('../utils/fileUtils.js');
const { response } = require("express");
 
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
      await removeFileIfExists(imagePath)
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
      return response(res, "This account cannot be locked because it is the last active Administrator account.");
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
  deleteTeacher,
  lockAccount,
  unlockAccount,
};
