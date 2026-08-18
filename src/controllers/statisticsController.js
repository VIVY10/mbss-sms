const service = require('../services/statisticsService.js');


// ==================== STUDENT COUNT ====================

exports.studentCount = async (req, res) => {
  try {
    const studentsCount =
      await service.getStudentCount();

    res.json([
      {
        studentsCount
      }
    ]);
  } catch {
    res.status(500).json({
      message: 'Database error.'
    });
  }
};


// ==================== TEACHER COUNT ====================

exports.teacherCount = async (req, res) => {
  try {
    const teachersCount =
      await service.getTeacherCount();

    res.json([
      {
        teachersCount
      }
    ]);
  } catch {
    res.status(500).json({
      message: 'Database error.'
    });
  }
};


// ==================== SUBJECT COUNT ====================

exports.subjectCount = async (req, res) => {
  try {
    const subjectCount =
      await service.getSubjectCount();

    res.json([
      {
        subjectCount
      }
    ]);
  } catch {
    res.status(500).json({
      message: 'Database error.'
    });
  }
};