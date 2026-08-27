const { query } = require("../utils/db.js");

exports.updateAttempts = (id, attempts) =>
  query(
    `UPDATE teachers
         SET failed_login_attempts = ?
         WHERE teacherid = ?`,
    [attempts, id],
  );

  // temporarily lock account after too many attempts
exports.lock = (id, attempts, lockedUntil) =>
  query(
    `UPDATE teachers
         SET failed_login_attempts = ?,
             locked_until = ?
         WHERE teacherid = ?`,
    [attempts, lockedUntil, id],
  );


exports.disableLogin = (id) =>
  query(
    `UPDATE teachers
         SET is_locked = ?
         WHERE teacherid = ?`,
    [1, id],
  );


  exports.enableLogin = (id) => 
  query(
    `UPDATE teachers
         SET is_locked = ?
         WHERE teacherid = ?`,
    [0, id],
  );

  // Unlock after account after temporarily lock
  exports.unLock = (id) =>
  query(
    `UPDATE teachers
         SET failed_login_attempts = ?,
             locked_until = NULL
         WHERE teacherid = ?`,
    [0, id],
  );

  // Reset login attempts
exports.resetAttempts = (id) =>
  query(
    `UPDATE teachers
         SET failed_login_attempts = ?,
             locked_until = NULL,
             last_login = NOW()
         WHERE teacherid = ?`,
    [0, id],
  );
