const pool = require('../config/db.js');


// ==================== FIND EXAM BY TITLE ====================

exports.findByTitle = async (examTitle) => {
  const [rows] = await pool.query(
    `SELECT examid, exam_title
     FROM exams
     WHERE exam_title = ?
     LIMIT 1`,
    [examTitle]
  );

  return rows;
};


// ==================== CREATE EXAM ====================

exports.create = async (examTitle) => {
  const [result] = await pool.query(
    `INSERT INTO exams (exam_title)
     VALUES (?)`,
    [examTitle]
  );

  return result;
};


// ==================== FIND ALL EXAMS ====================

exports.findAll = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM exams'
  );

  return rows;
};


// ==================== DELETE EXAM ====================

exports.remove = async (examid) => {
  const [result] = await pool.query(
    'DELETE FROM exams WHERE examid = ?',
    [examid]
  );

  return result;
};