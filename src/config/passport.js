const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const pool = require('./db.js');


// ==================== STAFF LOGIN ====================

passport.use(
  'staff',
  new LocalStrategy(
    async (username, password, done) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM teachers WHERE username = ? LIMIT 1',
          [username]
        );

        if (!rows.length) {
          return done(null, false, {
            message: 'User does not exist.'
          });
        }

        const user = rows[0]

        const valid = await bcrypt.compare(
          password,
          user.password
        );

        if (!valid) {
          return done(null, false, {
            message: 'Incorrect username or password.'
          });
        }

        return done(null, user);

      } catch (error) {
        return done(error);
      }
    }
  )
);


// ==================== PUPIL LOGIN ====================

passport.use(
  'pupil',
  new LocalStrategy(
    async (username, password, done) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM students WHERE id = ? LIMIT 1',
          [username]
        );

        if (!rows.length) {
          return done(null, false, {
            message: 'Invalid user.'
          });
        }

        const user = rows[0];

        const valid = await bcrypt.compare(
          password,
          user.password
        );

        if (!valid) {
          return done(null, false, {
            message: 'Incorrect username or password.'
          });
        }

        return done(null, user);

      } catch (error) {
        return done(error);
      }
    }
  )
);


// ==================== SESSION ====================

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


module.exports = passport;