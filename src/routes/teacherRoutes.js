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
router.get('/teachers/:teacherid', authChecker, controller.findTeacher);  
router.get('/deactivateTeacher', authChecker, controller.deactivateTeacher);
router.get('/reactivateTeacher', authChecker, controller.reactivateTeacher);
router.post('/updateTeacherRecord', authChecker, controller.updateTeacher);
router.get('/lockTeacherAccount', authChecker, controller.lockTeacherAccount);
router.get('/unlockTeacherAccount', authChecker, controller.unlockTeacherAccount); 

router.get('/subjectsTaught', authChecker, controller.subjectsTaught);
router.get('/trSubjectAllocation', authChecker, controller.unallocatedSubjectAllocation);
router.get('/subjectAllocation', authChecker, controller.subjectAllocation);
router.post('/allocateSubject', authChecker, controller.assignTeacherSubject);
router.get('/teacher-subject/:teacher_subjectid', authChecker, controller.removeTeacherSubject)
router.post('/teacher/class/allocation', authChecker, controller.createTeachingAllocation);
router.get('/teacher/department/remove', authChecker, controller.removeTeacherDepartment) 
 
 
//test
router.get('/teacher/classes', authChecker, controller.classes);
router.get('/teacher/allocations', authChecker, controller.allocations);
router.get('/teacher/marks', authChecker, controller.teacherMarksEntry);
router.get('/teacher/results', controller.teacherResults);
// router.get('/teacher/progress', teacherController.progress);

// router.get('/teacher/reports/midterm', teacherController.midterm);
// router.get('/teacher/reports/termly', teacherController.termly);
// router.get('/teacher/reports/annual', teacherController.annual);
// router.get('/teacher/reports/history', teacherController.reportHistory);

router.get('/teacher/profile', authChecker, controller.teacherProfile);
// test end

router.post('/registeredPupils', authChecker, controller.registeredPupils);
router.get("/teacher/edit/:teacherid", controller.showEditPage)


module.exports = router;
