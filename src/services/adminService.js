const { response } = require("express");
const model = require("../models/adminModel.js");
const subjectModel = require("../models/subjectModel.js");
const teacherModel = require("../models/teacherModel");

async function createSchoolYear(data) {
  if ((await model.findSchoolYear(data.yearname)).length) {
    throw new Error("School year already exists.");
  }

  return model.createSchoolYear(data);
}

async function createTerm(data) {
  const results = await model.findSchoolYearAndTermnumber(
    data.yearid,
    data.termnumber,
  );

  if (results.length && results.length) {
    throw new Error("Term exists.");
  }

  return model.createTerm({
    ...data,
  });
}

async function createClass(data) {
  if ((await model.findClass(data.grade, data.class, data.termid)).length) {
    throw new Error("Class already in the system.");
  }

  return model.createClass({
    ...data,
    section: data.class,
  });
}

async function createSubject(data) {
  if ((await subjectModel.findByCode(data.subjectcode)).length) {
    throw new Error("Subject Name exists in the system");
  }

  return subjectModel.create(data);
}

async function createDepartment(name) {
  if ((await model.findDepartment(name)).length) {
    throw new Error("department name exists in the database.");
  }

  return model.createDepartment(name);
}


async function createHod(
    teacherid,
    departmentid,
    YearOfAppointment,
    appointed_by
) {

    // 1. Verify that the teacher belongs to the department
    const teacherDepartment = await model.findTeacherDepartment(
        teacherid,
        departmentid
    );

    if (!teacherDepartment || teacherDepartment.length === 0) {
        return {message: "This teacher is not allocated to the selected department."}
    }

    // 2. Check whether the department already has a HOD
    const existingHod = await model.getDepartmentHodByDepartment(departmentid);


    if (existingHod && existingHod.length > 0) {
        return {message: "This department already has a HOD."};
    }

    // 3. Check whether this teacher is already HOD
    const teacherExistingHod = await model.getDepartmentHod(
        teacherid,
        departmentid
    );


    if (teacherExistingHod && teacherExistingHod.length > 0) {
        return {
            message: "This teacher is already assigned as HOD of this department."
        };
    }

    // 4. Create HOD appointment
    await model.createDepartmentHod(
        teacherid,
        departmentid,
        YearOfAppointment,
        appointed_by
    );

    return {
        success: true,
        status: 201,
        message:
            "Teacher successfully appointed as HOD."
    };
}


async function allocateDepartment(teacherid, departmentid) {
  const results = await model.findTeacherDepartmentAllocationOptions(
    teacherid,
    departmentid,
  );

  if (results.length > 0) {
    return {message: "Teacher is already assigned to this department."};
  }

  await model.createTeacherDepartment(teacherid, departmentid);

  return {message: "Teacher successfully assigned to department."};
}

async function addClassSubject(classid, subjectcode) {
  if ((await subjectModel.findClassSubject(classid, subjectcode)).length) {
    throw new Error("subject exists in this class.");
  }

  return subjectModel.addClassSubject(classid, subjectcode);
}

module.exports = {
  createSchoolYear,
  createTerm,
  createClass,
  createSubject,
  createDepartment,
  createHod,
  allocateDepartment,
  addClassSubject,
};
