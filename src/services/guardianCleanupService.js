const pool = require('../config/db.js');
const { sendCleanupNotification } = require('../config/mailer.js');
const adminModel = require("../models/adminModel.js");

async function deleteOrphanedParents() {
    try {
        const result = await adminModel.deleteOrphanedRecords()
        
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