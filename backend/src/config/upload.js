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

const ALLOWED_MIMETYPES = [
  'application/pdf',
  'application/x-pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const FORMAT_ERROR_MESSAGE = 'Formato incorrecto, solo puede ser jpg, jpeg, png o pdf';

function isAllowedAttachment(file) {
  const mimetype = (file.mimetype || '').toLowerCase();
  const originalname = (file.originalname || '').toLowerCase();
  if (ALLOWED_MIMETYPES.some((m) => mimetype === m)) return true;
  if (mimetype === 'application/octet-stream') {
    return ALLOWED_EXTENSIONS.some((ext) => originalname.toLowerCase().endsWith(ext));
  }
  return ALLOWED_EXTENSIONS.some((ext) => originalname.toLowerCase().endsWith(ext));
}

const fileFilter = (req, file, cb) => {
  if (process.env.DEBUG_UPLOADS) {
    console.log('[DEBUG_UPLOADS] multer fileFilter', file.mimetype, file.originalname, isAllowedAttachment(file));
  }
  if (!isAllowedAttachment(file)) {
    return cb(new Error(FORMAT_ERROR_MESSAGE), false);
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

