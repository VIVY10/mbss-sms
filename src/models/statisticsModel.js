const pool = require('../config/db.js');


// ==================== STUDENT COUNT ====================

exports.getStudentCount = async () => {
  const [rows] = await pool.query(
    'SELECT COUNT(id) AS count FROM students'
  );

  return rows[0].count;
};


// ==================== TEACHER COUNT ====================

exports.getTeacherCount = async () => {
  const [rows] = await pool.query(
    'SELECT COUNT(id) AS count FROM teachers'
  );

  return rows[0].count;
};


// ==================== SUBJECT COUNT ====================

exports.getSubjectCount = async () => {
  const [rows] = await pool.query(
    'SELECT COUNT(subjectcode) AS count FROM subjects'
  );

  return rows[0].count;
};