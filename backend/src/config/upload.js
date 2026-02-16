const path = require('path');
const fs = require('fs');
const multer = require('multer');

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const uploadsDir = path.join(__dirname, '..', 'uploads');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeOriginalName = String(file.originalname || 'file')
      .replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}-${safeOriginalName}`);
  },
});

function isPdf(file) {
  const mimetype = (file.mimetype || '').toLowerCase();
  const originalname = (file.originalname || '').toLowerCase();
  return mimetype === 'application/pdf'
    || mimetype === 'application/x-pdf'
    || (mimetype === 'application/octet-stream' && originalname.endsWith('.pdf'))
    || originalname.endsWith('.pdf');
}

const fileFilter = (req, file, cb) => {
  if (process.env.DEBUG_UPLOADS) {
    console.log('[DEBUG_UPLOADS] multer fileFilter', file.mimetype, file.originalname, isPdf(file));
  }
  if (!isPdf(file)) {
    return cb(new Error('Solo se permiten archivos PDF'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 2,
  },
});

module.exports = {
  upload,
  uploadsDir,
};

