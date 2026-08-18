const service = require('../services/studentSubjectService.js');

const { matchedData } = require('express-validator');


// ==================== STUDENT SUBJECT PAGE ====================

exports.page = async (req, res) => {
  const foundClass =
    await service.getTeacherSubjects(req.user.id);

  if (!foundClass.length) {
    return res.render('./response/response', {
      message:
        'No class record found. Contact your HOD to allocate you classes.'
    });
  }

  const foundSubject =
    await service.getTeacherSubjectsForEnrollment(
      req.user.id
    );

  if (!foundSubject.length) {
    return res.render('./response/response', {
      message:
        'You have not been allocated a subject yet.'
    });
  }

  res.render('./pupil/studentSubject.ejs', {
    foundClass,
    foundSubject,
    user: req.user
  });
};


// ==================== STUDENTS ====================

exports.students = async (req, res) => {
  const {
    classid,
    subjectcode
  } = matchedData(req);

  const results =
    await service.getUnenrolledStudents(
      classid,
      subjectcode
    );

  if (!results.length) {
    return res.json(
      'All students are enrolled'
    );
  }

  res.json({
    results,
    subjectcode
  });
};


// ==================== ENROLL STUDENTS ====================

exports.enroll = async (req, res) => {
  const pupilData = req.body;

  if (
    !Array.isArray(pupilData) ||
    !pupilData.length
  ) {
    return res.status(400).json({
      error: 'No pupil data provided'
    });
  }

  await service.enrollStudents(pupilData);

  res.json(
    'Student subject registration successful'
  );
};


// ==================== REGISTERED PUPILS ====================

exports.registeredPupils = async (req, res) => {
  const {
    subjectcode,
    classid
  } = req.body;

  const results =
    await service.getRegisteredPupils(
      subjectcode,
      classid
    );

  res.render(
    './pupil/studentSubjectList',
    {
      results,
      user: req.user
    }
  );
};


// ==================== MY SUBJECTS ====================

exports.mySubjects = async (req, res) => {
  const results =
    await service.getMySubjects(req.user.id);

  if (!results.length) {
    return res.render('./response/response', {
      message:
        'You have not been enrolled in any subject yet. Consult your subject teacher.'
    });
  }

  res.render('./pupil/mySubjects', {
    results,
    user: req.user
  });
};