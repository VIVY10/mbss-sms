const express = require('express');

const { authChecker } = require('../middleware/authChecker.js');
const { profilePicUpload } = require('../middleware/profilePicUpload.js');
const { validate } = require('../middleware/validateRequest.js');

const {
  allocateSubjectValidationRules,
  registerTeacherValidationRules
} = require('../validation/validationRules.js');

const controller = require('../controllers/teacherController.js');

const router = express.Router();

router.get('/registerTeacher', authChecker, controller.showRegistration);
router.post('/registerTeacher', authChecker, profilePicUpload.single('file'), registerTeacherValidationRules(), validate, controller.register);
router.get('/viewTeachers', authChecker, controller.viewTeachers);
router.get('/subjectsTaught', authChecker, controller.subjectsTaught);
router.get('/trSubjectAllocation', authChecker, controller.unallocatedSubjectAllocation);
router.get('/subjectAllocation', authChecker, controller.subjectAllocation);
router.get('/allocateSubject', authChecker, controller.allocateSubjectPage); 
router.post('/allocateSubject', authChecker, controller.allocateSubject);
router.post('/registeredPupils', authChecker, controller.registeredPupils);
router.get('/deleteTeacher', authChecker, controller.deleteTeacher);
router.post('/updateTeacherRecord', authChecker, controller.updateTeacher);
router.post('/lockTeacherAccount', authChecker, controller.lockTeacherAccount); 

module.exports = router;
