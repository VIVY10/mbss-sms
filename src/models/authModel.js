const { query } = require("../utils/db.js");

exports.updateAttempts = (id, attempts) =>
  query(
    `UPDATE teachers
         SET failed_login_attempts = ?
         WHERE id = ?`,
    [attempts, id],
  );

exports.lock = (id, attempts, lockedUntil) =>
  query(
    `UPDATE teachers
         SET failed_login_attempts = ?,
             locked_until = ?,
             status = ?,
             is_locked = ?
         WHERE id = ?`,
    [attempts, lockedUntil, "INACTIVE", 1, id],
  );

  exports.unLock = (id) =>
  query(
    `UPDATE teachers
         SET failed_login_attempts = ?,
             locked_until = NULL,
             status = ?,
             is_locked = ?
         WHERE id = ?`,
    [0, "ACTIVE", 0, id],
  );

exports.resetAttempts = (id) =>
  query(
    `UPDATE teachers
         SET failed_login_attempts = ?,
             locked_until = NULL,
             last_login = NOW()
         WHERE id = ?`,
    [0, id],
  );
