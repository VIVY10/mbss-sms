const express = require('express');

const { authChecker } = require('../middleware/authChecker.js');
const { validate } = require('../middleware/validateRequest.js');

const { enterMarksValidationRules } = require('../validation/validationRules.js');

const controller = require('../controllers/resultController.js');

const resultController = require('../controllers/resultController');

const router = express.Router();


router.get('/classResults', authChecker, resultController.page);
router.post('/classResults', authChecker, resultController.getResults);
router.post("/enterMarks", authChecker, enterMarksValidationRules(), validate, resultController.enterMarks);

router.get('/teacher/marks/students', authChecker, controller.getStudents)
router.post('/teacher/marks/draft', authChecker, controller.saveMarks)
router.post('/teacher/marks/submit', authChecker,  controller.submitMarks)

router.post('/getDetails', authChecker, resultController.getDetails);
router.get('/resultsEntry', authChecker, resultController.resultsEntry)
router.get('/studentResults', authChecker, controller.page);
router.get('/teacher/results/search', authChecker, controller.search);

router.get('/getID', authChecker, controller.profile);
router.post('/deleteResult', authChecker, controller.deleteResult);
router.post('/updateResult', authChecker, controller.updateResult);

module.exports = router;
