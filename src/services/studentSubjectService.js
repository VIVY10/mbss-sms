const model = require('../models/studentSubjectModel');

const getTeacherSubjects = teacherId =>
    model.getTeacherSubjects(teacherId);

const getTeacherSubjectsForEnrollment = teacherId =>
    model.getTeacherSubjectsForEnrollment(teacherId);

const getUnenrolledStudents = (classid, subjectcode) =>
    model.getUnenrolledStudents(classid, subjectcode);

async function enrollStudents(pupils) {
    await Promise.all(
        pupils.map(({ examno, subjectcode }) =>
            model.enroll(examno, subjectcode)
        )
    );
}

const getRegisteredPupils = (subjectcode, classid) =>
    model.getRegisteredPupils(subjectcode, classid);

const getMySubjects = examno =>
    model.getMySubjects(examno);

module.exports = {
    getTeacherSubjects,
    getTeacherSubjectsForEnrollment,
    getUnenrolledStudents,
    enrollStudents,
    getRegisteredPupils,
    getMySubjects
};