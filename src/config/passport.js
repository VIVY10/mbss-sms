const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const teacherModel = require("../models/teacherModel");
const authModel = require("../models/authModel.js");

const pool = require("./db.js");

// ==================== STAFF LOGIN ====================
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 3;

passport.use(
  "staff",
  new LocalStrategy(async (username, password, done) => {
    try {
      const rows = await teacherModel.findByUsername(username);

      // check if user exists
      if (!rows.length) {
        return done(null, false, {
          message: "User does not exist.",
        });
      }

      const user = rows[0];

      // Disabled account
      if (user.status !== "active") {
        return done(null, false, {
          message: "Your account is not active.",
        });
      }

      // administrative access restricted
      if (user.is_locked) {
        return done(null, false, {
          message: "Login access has been disabled.",
        });
      }

      // still locked temporarily
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        
        const formattedDate = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(user.lockedUntil);

        return done(null, false, {
          message: `Account temporarily locked until ${formattedDate}`,
        });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        const attempts = user.failed_login_attempts + 1;

        if (attempts >= MAX_ATTEMPTS) {
          const lockTime = new Date();
          lockTime.setMinutes(lockTime.getMinutes() + LOCK_MINUTES);

          await authModel.lock(user.id, attempts, lockTime);

          return done(null, false, {
            message: `Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes.`,
          });
        }

        await authModel.updateAttempts(user.id, attempts);

        return done(null, false, {
          message: `Incorrect username or password. ${MAX_ATTEMPTS - attempts} attempts remaining.`,
        });
      }

      // Success
      await authModel.resetAttempts(user.id);

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

// ==================== PUPIL LOGIN ====================

passport.use(
  "pupil",
  new LocalStrategy(async (username, password, done) => {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM students WHERE examno = ? LIMIT 1",
        [username],
      );

      if (!rows.length) {
        return done(null, false, {
          message: "Invalid user.",
        });
      }

      const user = rows[0];

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return done(null, false, {
          message: "Incorrect username or password.",
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

// ==================== SESSION ====================

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
