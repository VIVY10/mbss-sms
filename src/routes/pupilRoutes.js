const express = require('express');

const { authChecker } = require('../middleware/authChecker.js');
const { profilePicUpload } = require('../middleware/profilePicUpload.js');

const {
  validate,
  validatePupilRegistration
} = require('../middleware/validateRequest.js');

const {
  checkexamnoValidationRules,
  pupilValidationRules
} = require('../validation/validationRules.js');

const controller = require('../controllers/pupilController.js');

const router = express.Router();

router.post('/checkExamno', authChecker, checkexamnoValidationRules(), validate, controller.checkExamNo);
router.get('/register', authChecker, controller.showRegistration);
router.post('/register', authChecker, profilePicUpload.single('file'), pupilValidationRules(), validate, controller.register);
router.get('/returningPupils', authChecker, controller.returningPupils);
router.get('/viewPupils', authChecker, controller.viewPupils);
router.get('/searchPupil', authChecker, controller.searchPage);
router.post('/searchPupil', authChecker, checkexamnoValidationRules(), validate, controller.searchPupil);
router.get('/updatePupilRecord/:id', authChecker, controller.editPage);
router.post('/updatePupilRecord', authChecker, controller.update);
router.get('/deletePupilRecord/:id', authChecker, controller.deletePupil);

module.exports = router;
