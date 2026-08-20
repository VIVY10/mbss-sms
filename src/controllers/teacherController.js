const { matchedData } = require('express-validator');

const teacherModel = require('../models/teacherModel.js');
const teacherService = require('../services/teacherService.js');

// ==================== TEACHER REGISTRATION ====================

exports.showRegistration = (req, res) => {
  res.render('./teacher/registerTeacher.ejs', {
    user: req.user
  });
};

exports.register = async (req, res) => {
  await teacherService.registerTeacher({
    data: matchedData(req),
    file: req.file
  });

  res.redirect('/registerTeacher');
};


// ==================== TEACHERS ====================

exports.viewTeachers = async (req, res) => {
  const results = await teacherModel.getAll();  
  res.render('./teacher/viewRegTeachers', {
    results,
    user: req.user
  });
};


// ==================== SUBJECTS TAUGHT ====================

exports.subjectsTaught = async (req, res) => {
  const response =
    await teacherModel.getSubjectsTaught(
      req.user.id
    );

  if (!response.length) {
    return res.send(
      'No subjects allocated for you'
    );
  }

  res.render('./teacher/checkSubjectsTaught', {
    response,
    user: req.user
  });
};


// ==================== UNALLOCATED SUBJECT ALLOCATION ====================

exports.unallocatedSubjectAllocation = async (
  req,
  res
) => {
  const {
    department,
    records
  } = await teacherService.getSubjectAllocation(
    req.user.id,
    false
  );

  if (!department) {
    return res.send(
      'No Department Found'
    );
  }

  if (!records.length) {
    return res.send(
      'Done with allocation. Check your allocation'
    );
  }

  res.render('./pupil/allocateClass', {
    foundClass: records,
    user: req.user,
    teacher: false
  });
};


// ==================== SUBJECT ALLOCATION ====================

exports.subjectAllocation = async (
  req,
  res
) => {
  const {
    department,
    records
  } = await teacherService.getSubjectAllocation(
    req.user.id,
    true
  );

  if (!department) {
    return res.render(
      './response/response',
      {
        message:
          'You have not been allocated Department yet. Confirm with Admin'
      }
    );
  }

  if (!records.length) {
    return res.send(
      '<h1>You have not yet allocated classes. Allocate teachers Subjects</h1>'
    );
  }

  res.render('./pupil/allocateClass', {
    foundClass: records,
    user: req.user
  });
};


// ==================== ALLOCATE SUBJECT PAGE ====================

exports.allocateSubjectPage = async (
  req,
  res
) => {
  const {
    mherdngb: classSubjectid,
    dhgbjjhggvvffjghftxderdcvbhjgkbjgfjvfj:
      departmentid
  } = req.query;

  const [
    foundClass,
    foundTeacher
  ] = await teacherModel.getAllocationDetails(
    classSubjectid,
    departmentid
  );

  if (!foundClass.length) {
    return res.status(404).send(
      'Class subject not found'
    );
  }

  if (!foundTeacher.length) {
    return res.send(
      'No teachers found'
    );
  }

  res.render('./class/allocateSubject', {
    foundClass,
    foundTeacher,
    user: req.user
  });
};


// ==================== ALLOCATE SUBJECT ====================

exports.allocateSubject = async (req, res) => {
  // console.log(req.body)
  const {
    teacher,
    subjectid
  } = req.body;

  await teacherModel.allocateSubject(
    teacher,
    subjectid
  );

  res.redirect('/subjectAllocation');
};


// ==================== REGISTERED PUPILS ====================

exports.registeredPupils = async (req, res) => {
  const {
    subjectcode,
    classid
  } = req.body;

  const results =
    await teacherModel.getRegisteredPupils(
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


// ==================== DELETE TEACHER ====================

exports.deleteTeacher = async (req, res) => {
  await teacherService.deleteTeacher(
    req.query.nkhvjhgfch
  );

  res.redirect('/viewTeachers');
};


// ==================== UPDATE TEACHER ====================

exports.updateTeacher = (req, res) => {
  if (
    req.user?.userType === 'HOD' ||
    req.user?.usertype === 'HOD'
  ) {
    return res
      .status(501)
      .send(
        'Teacher update is not implemented.'
      );
  }

  return res.redirect('/login');
};