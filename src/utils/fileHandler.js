const fs = require('fs');
const path = require('path');
const createError = require('http-errors');

// Helper function to copy files
function copyFileHandler(source, destination) {
    return new Promise((resolve, reject) => {
        fs.copyFile(source, destination, (err) => {
            if (err) {
                console.error(`Error copying file from ${source} to ${destination}:`, err);
                return reject(createError(500, `Error creating backup of profile picture at ${destination}`));
            }
            console.info(`File copied successfully from ${source} to ${destination}`);
            resolve();
        });
    });
}

// Helper function to delete files
function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.warn(`File not found for deletion: ${filePath}`);
                    return resolve(); // Ignore missing files
                } else {
                    console.error(`Error deleting file: ${filePath}`, err);
                    return reject(createError(500, `Error deleting file at ${filePath}`));
                }
            }
            console.info(`File deleted successfully: ${filePath}`);
            resolve();
        });
    });
}

module.exports = {
    deleteFile,
    copyFileHandler,
};
