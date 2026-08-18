const fs = require('fs/promises');
const path = require('path');


async function removeFileIfExists(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}


async function backupAndDeleteFile(filePath, backupDirectory) {
  if (!filePath) return null;

  const fileName = path.basename(filePath);
  const backupPath = path.join(
    backupDirectory,
    fileName
  );

  await fs.mkdir(backupDirectory, {
    recursive: true
  });

  await fs.copyFile(
    filePath,
    backupPath
  );

  await removeFileIfExists(filePath);

  return backupPath;
}


async function restoreFile(backupPath, originalPath) {
  if (!backupPath) return;

  await fs.copyFile(
    backupPath,
    originalPath
  );
}


module.exports = {
  removeFileIfExists,
  backupAndDeleteFile,
  restoreFile
};