const express = require('express');
const multer = require('multer');
const {
  listByPrestador,
  download,
  uploadProfilePhoto,
  getProfilePhoto,
} = require('../controllers/attachment.controller');

const router = express.Router();

const PROFILE_PHOTO_FORMAT_MESSAGE = 'Formato incorrecto, solo puede ser jpg, jpeg o png';
const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const PROFILE_PHOTO_MIMETYPES = new Set(['image/jpeg', 'image/png']);

const profilePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: PROFILE_PHOTO_MAX_BYTES,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const mimetype = (file.mimetype || '').toLowerCase();
    if (PROFILE_PHOTO_MIMETYPES.has(mimetype)) {
      return cb(null, true);
    }
    return cb(new Error(PROFILE_PHOTO_FORMAT_MESSAGE), false);
  },
});

router.get('/api/prestadores/:id/attachments', listByPrestador);
router.get('/api/attachments/:attachmentId/download', download);
router.post(
  '/api/prestadores/:id/profile-photo',
  (req, res, next) => {
    profilePhotoUpload.single('profilePhoto')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || PROFILE_PHOTO_FORMAT_MESSAGE,
        });
      }
      next();
    });
  },
  uploadProfilePhoto
);
router.get('/api/prestadores/:id/profile-photo', getProfilePhoto);

module.exports = router;
