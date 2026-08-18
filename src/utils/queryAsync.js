const { db } = require("../config/db.js");
// Utility function to convert db.query to a promise
const queryAsync = (sql, values = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

module.exports = queryAsync;