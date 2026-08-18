const crypto = require('crypto');
const bcrypt = require('bcrypt');

const db = require('../config/db.js');
const {transporter} = require('../config/mailer.js');


function generateToken() {
    return crypto.randomBytes(64).toString('hex');
}


async function requestReset(email) {
    const [users] = await db.query(
        'SELECT email FROM teachers WHERE email = ? LIMIT 1',
        [email]
    );

    if (!users.length) {
        return { found: false };
    }

    // Invalidate previous reset tokens
    await db.query(
        'UPDATE resettokens SET used = 1 WHERE email = ?',
        [email]
    );

    const token = generateToken();

    const expiration = new Date(
        Date.now() + 60 * 60 * 1000
    );

    await db.query(
        `INSERT INTO resettokens
        (email, token, expiration, createdAt, updatedAt, used)
        VALUES (?, ?, ?, NOW(), NOW(), 0)`,
        [email,token, expiration]
    );

    const resetLink =
        `http://${process.env.DOMAIN}/forgotPassword/resetPassword` +
        `?token=${encodeURIComponent(token)}` +
        `&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
        from: process.env.CONTACTEMAIL,
        to: email,
        subject: 'Reset Password',
        text:
            `To reset your password, please click the link below:\n\n` +
            `${resetLink}\n\n` +
            `This link will expire in one hour.`
    });

    return { found: true };
}


async function findValidToken(email, token) {
    // Remove expired tokens
    await db.query(
        'DELETE FROM resettokens WHERE expiration < NOW()'
    );

    const [rows] = await db.query(
        `SELECT * FROM resettokens
         WHERE email = ?
         AND expiration > NOW()
         AND token = ?
         AND used = 0
         LIMIT 1`,
        [email, token]
    );

    return rows[0] || null;
}


async function resetPassword({ email, token, password }) {
    const record = await findValidToken(email, token);

    if (!record) {
        return false;
    }

    const hash = await bcrypt.hash(password, 10);

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            `UPDATE resettokens
             SET used = 1
             WHERE email = ? AND token = ?`,
            [email, token]
        );

        await connection.query(
            'UPDATE teachers SET password = ? WHERE email = ?',
            [hash, email]
        );

        await connection.commit();

        return true;

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}


module.exports = {
    requestReset,
    findValidToken,
    resetPassword
};