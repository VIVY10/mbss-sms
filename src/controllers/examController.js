const { matchedData } = require('express-validator');

const service = require('../services/examService.js');

exports.showCreateExam = (req, res) => {
  res.render('./exam/createExam', {
    user: req.user
  });
};

exports.createExam = async (req, res) => {
  try {
    const { examTitle } = matchedData(req);

    const result = await service.createExam(examTitle);

    if (!result.created) {
      return res.render('./response/response', {
        message: 'exam exists.'
      });
    }

    res.redirect('/exams');
  } catch (error) {
    console.error(error);

    res.render('./response/response', {
      message: 'Database error.'
    });
  }
};

exports.listExams = async (req, res) => {
  try {
    const results = await service.getExams();

    res.render('./exam/exams', {
      results,
      user: req.user
    });
  } catch (error) {
    console.error(error);

    res.render('./response/response', {
      message: 'Database error.'
    });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    await service.deleteExam(req.body.examid);

    res.redirect('/exams');
  } catch (error) {
    console.error(error);

    res.render('./response/response', {
      message: 'Database error.'
    });
  }
};