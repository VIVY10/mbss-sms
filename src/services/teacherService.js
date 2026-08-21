const bcrypt = require("bcrypt");
const teacherModel = require("../models/teacherModel");
const authModel = require("../models/authModel");

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

async function deleteTeacher(username) {
  const teacher = await teacherModel.findByUsername(username);

  if (!teacher.length) {
    throw new Error("Teacher not found.");
  }

  if (teacher[0].usertype === "Admin") {
    const admins = await teacherModel.countAdmins();

    if (admins.length <= 1) {
      throw new Error("You must have at least one Admin in the system.");
    }
  }

  return teacherModel.deleteByUsername(username);
}


async function lockAccount(username) {
  const teacher = await teacherModel.findByUsername(username);

  if (!teacher.length) {
    throw new Error("Teacher not found.");
  }

  if (teacher[0].usertype === "Admin") {
      throw new Error("You must have at least one active Admin in the system.");    
  }

    if (teacher[0].usertype === req.user.usertype) {
      throw new Error("You can not lock yourself out of the system as admin");    
  }

  return authModel.disableLogin(username)
}

module.exports = {
  registerTeacher,
  getSubjectAllocation,
  deleteTeacher,
  lockAccount
};
