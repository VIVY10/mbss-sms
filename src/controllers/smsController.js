const service = require('../services/smsService.js');


// ==================== SEND RESULTS FORM ====================

exports.showResultsForm = async (req, res) => {
  try {
    const data = await service.getResultFormData();

    res.render('./sendSMS/sendResults', {
      ...data,
      user: req.user
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Database error.'
    });
  }
};


// ==================== SEND RESULTS ====================

exports.sendResults = async (req, res) => {
  try {
    const {
      schoolyear,
      term,
      yearlevel,
      examid,
      targetDeviceIden,
      accessToken
    } = req.body;

    if (!targetDeviceIden || !accessToken) {
      return res.status(400).send(
        'targetDeviceIden and accessToken are required.'
      );
    }

    const results = await service.getResults({
      schoolyear,
      term,
      yearlevel,
      examid
    });

    if (!results.length) {
      return res.render('./response/response', {
        message:
          'No Result Record found for the provided details.'
      });
    }

    await service.sendStudentResults(
      results,
      {
        targetDeviceIden,
        accessToken
      }
    );

    res.status(200).send(
      'SMS sent successfully!'
    );
  } catch (error) {
    console.error(
      'SMS error:',
      error.response?.data || error.message
    );

    res.status(500).send(
      'Error sending SMS.'
    );
  }
};