const model = require('../models/adminModel.js');
const subjectModel = require('../models/subjectModel.js');


async function createSchoolYear(data) {
    if ((await model.findSchoolYear(data.yearname)).length) {
        throw new Error('School year already exists.');
    }

    return model.createSchoolYear(data);
}


async function createTerm(data) {
    const year = await model.findSchoolYearId(data.yearname);

    if (!year.length) {
        throw new Error('School year not found.');
    }

    if ((await model.findTermNumber(data.termnumber)).length) {
        throw new Error('Term already exists.');
    }

    return model.createTerm({
        ...data,
        schoolyearid: year[0].schoolyearid
    });
}


async function createClass(data) {
    if (
        (await model.findClass(
            data.grade,
            data.class,
            data.termid
        )).length
    ) {
        throw new Error('Class already in the system.');
    }

    return model.createClass({
        ...data,
        section: data.class
    });
}


async function createSubject(data) {
    if ((await subjectModel.findByCode(data.subjectcode)).length) {
        throw new Error('Subject Name exists in the system');
    }

    return subjectModel.create(data);
}


async function createDepartment(name) {
    if ((await model.findDepartment(name)).length) {
        throw new Error('department name exists in the database.');
    }

    return model.createDepartment(name);
}


async function createHod(teacherid, departmentid) {
    if (
        (await model.findTeacherDepartment(
            teacherid,
            departmentid
        )).length
    ) {
        throw new Error('HOD already assigned to this department.');
    }

    return model.createTeacherDepartment(
        teacherid,
        departmentid
    );
}


async function allocateDepartment(teacherid, departmentid) {
    if (
        (await model.findTeacherDepartment(
            teacherid,
            departmentid
        )).length
    ) {
        throw new Error('Teacher already assigned to this department.');
    }

    return model.createTeacherDepartment(
        teacherid,
        departmentid
    );
}


async function addClassSubject(classid, subjectcode) {
    if (
        (await subjectModel.findClassSubject(
            classid,
            subjectcode
        )).length
    ) {
        throw new Error('subject exists in this class.');
    }

    return subjectModel.addClassSubject(
        classid,
        subjectcode
    );
}


module.exports = {
    createSchoolYear,
    createTerm,
    createClass,
    createSubject,
    createDepartment,
    createHod,
    allocateDepartment,
    addClassSubject
};