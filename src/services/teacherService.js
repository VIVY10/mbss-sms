const bcrypt = require('bcrypt');
const teacherModel = require('../models/teacherModel');

async function registerTeacher({ data, file }) {
    const username = data.username.toLowerCase();
    const fname = data.Fname.toUpperCase();
    const lname = data.Lname.toUpperCase();
    const email = data.email.toLowerCase();

    const existing = await teacherModel.findByUsername(username);

    if (existing.length) {
        throw new Error('Username already exists.');
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
        profilePicture: file?.filename ?? null
    });
}


async function getSubjectAllocation(teacherId, allocated) {
    const department = await teacherModel.getDepartment(teacherId);

    if (!department.length) {
        return {
            department: null,
            records: []
        };
    }

    const departmentId = department[0].departmentid;

    const records = allocated
        ? await teacherModel.getAllocatedByDepartment(departmentId)
        : await teacherModel.getUnallocatedByDepartment(departmentId);
    
    return {
        department: department[0],
        records
    };
}


async function deleteTeacher(username) {
    const teacher = await teacherModel.findByUsername(username);

    if (!teacher.length) {
        throw new Error('Teacher not found.');
    }

    if (teacher[0].usertype === 'Admin') {
        const admins = await teacherModel.countAdmins();

        if (admins.length <= 1) {
            throw new Error(
                'You must have at least one Admin in the system.'
            );
        }
    }

    return teacherModel.deleteByUsername(username);
}


module.exports = {
    registerTeacher,
    getSubjectAllocation,
    deleteTeacher
};