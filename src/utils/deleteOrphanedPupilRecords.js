const queryAsync = require('./queryAsync.js');

// Helper function to delete orphaned guardian records
function deleteOrphanGuardians() {
    return new Promise((resolve, reject) => {
        const query = `
            DELETE g
            FROM guardian g
            LEFT JOIN studentguardian stg ON g.nrc_no = stg.guardianid
            WHERE stg.guardianid IS NULL
        `;
        queryAsync(query, (err) => {
            if (err) {
                logger.error(err);
                return next(createError(500, "Error deleting orphaned guardians"));
            } else {
                resolve();
            }
        });
    });
}

module.exports = deleteOrphanGuardians;