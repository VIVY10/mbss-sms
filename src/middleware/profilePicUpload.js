const multer = require('multer');
const path = require('path');
const fs = require('fs');


// ==================== UPLOAD DIRECTORY ====================

const uploadDir = path.join(
  __dirname,
  '../../public/images/profile'
);

fs.mkdirSync(uploadDir, { recursive: true });


// ==================== STORAGE ====================

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const filename =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    cb(null, filename);
  }
});


// ==================== UPLOAD ====================

const profilePicUpload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;

    const extensionValid = allowed.test(
      path.extname(file.originalname).toLowerCase()
    );

    const mimeTypeValid = allowed.test(
      file.mimetype
    );

    console.log('multer')

    if (extensionValid && mimeTypeValid) {
      return cb(null, true);
    }

    cb(new Error('Only image files are allowed.'));
  }
});


module.exports = {
  profilePicUpload
};