const express = require('express');

const { authChecker} = require('../middleware/authChecker.js');
const { validate } = require('../middleware/validateRequest.js');

const {
  schoolyearValidationRules,
  addTermValiadtionRules,
  addClassValidationRules,
  createSubjectValidationRules,
  createDepartmentValidationRules,
  createHodValidationRules,
  allocateDepartmentValidationRules, 
  addGuardianTypeValidationRules,
  addClassSubjectsValidationrules
} = require('../validation/validationRules.js');

const { ensureRole } = require('../middleware/authChecker.js');
const controller = require('../controllers/adminController.js');

const router = express.Router();
const adminOnly = [authChecker, ensureRole('Admin')];
const hodOnly = [authChecker, ensureRole('HOD')];

router.get('/schoolYears', ...adminOnly, controller.schoolYears);
router.get('/schoolYear', ...adminOnly, controller.schoolYearPage);
router.post('/schoolYear', ...adminOnly, schoolyearValidationRules(), validate, controller.createSchoolYear);
router.post('/deleteYear', ...adminOnly, controller.deleteYear);

router.get('/terms', ...adminOnly, controller.terms);
router.get('/addTerm', ...adminOnly, controller.addTermPage);
router.post('/addTerm', ...adminOnly, addTermValiadtionRules(), validate, controller.addTerm);
router.post('/deleteTerm', ...adminOnly, controller.deleteTerm);

router.get('/get_class', ...adminOnly, controller.classes);
router.get('/addClass', ...adminOnly, controller.addClassPage);
router.post('/addClass', ...adminOnly, controller.addClass);
router.post('/deleteClass', ...adminOnly, controller.deleteClass);

router.get('/createSubject', ...adminOnly, controller.createSubjectPage);
router.post('/createSubject', ...adminOnly, controller.createSubject);
router.get('/viewSubjects', ...adminOnly, controller.viewSubjects);
router.post('/deleteSubject', ...adminOnly, controller.deleteSubject);

router.get('/createDepartment', ...adminOnly, controller.createDepartmentPage);
router.post('/createDepartment', ...adminOnly, controller.createDepartment);
router.post('/deleteDepartment', ...adminOnly, controller.deleteDepartment);
router.get('/viewDepartment', ...adminOnly, controller.viewDepartment);
 
router.get('/createHod', ...adminOnly, controller.createHodPage);
router.post('/createHod', ...adminOnly, controller.createHod);
router.get('/viewHod', ...adminOnly, controller.viewHod);
router.get('/allocateDepartment', ...adminOnly, controller.allocateDepartmentPage);
router.post('/allocateDepartment', ...adminOnly, controller.allocateDepartment);
router.get('/viewDepartmentTrs', ...hodOnly, controller.viewDepartmentTeachers);

router.get('/addGuardianType', ...adminOnly, controller.addGuardianTypePage);
router.post('/addGuardianType', ...adminOnly, controller.addGuardianType);
router.get('/viewGuardianType', ...adminOnly, controller.viewGuardianType);
router.post('/deleteGuardianType', ...adminOnly, controller.deleteGuardianType);

router.get('/addClassSubjects', ...adminOnly, controller.addClassSubjectsPage);
router.post('/addClassSubjects', ...adminOnly, controller.addClassSubjects);
router.get('/viewClassSubjects', ...adminOnly, controller.viewClassSubjects);
router.get('/unallocatedSubjects', ...adminOnly, controller.unallocatedSubjects);
router.get('/classAllocation', ...adminOnly, controller.classAllocation);
router.post('/deleteClassSubject', ...adminOnly, controller.deleteClassSubject);

module.exports = router;
