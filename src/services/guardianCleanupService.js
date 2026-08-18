const pool = require('../config/db.js');
const { sendCleanupNotification } = require('../config/mailer.js');


async function deleteOrphanedParents() {
    try {
        const [result] = await pool.query(`
            DELETE g
            FROM guardian AS g
            LEFT JOIN studentguardian AS stg
                ON g.nrc_no = stg.guardianid
            WHERE stg.guardianid IS NULL
        `);

        const message =
            `${result.affectedRows} orphaned parent records deleted from the system.`;

        await sendCleanupNotification({
            success: true,
            message
        });

        return result.affectedRows;

    } catch (error) {

        await sendCleanupNotification({
            success: false,
            message: error.message
        }).catch(() => {});

        throw error;
    }
}


module.exports = {
    deleteOrphanedParents
};