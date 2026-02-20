const express = require('express');
const multer = require('multer');
const {
  getMascotasByDuenioController,
  createMascotaController,
  updateMascotaController,
  deleteMascotaController,
  uploadMascotaPhotoController,
  getMascotaPhotoController,
} = require('../controllers/mascota.controller');

const router = express.Router();

const MASCOTA_PHOTO_FORMAT_MESSAGE = 'Formato incorrecto, solo puede ser jpg, jpeg o png';
const MASCOTA_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const MASCOTA_PHOTO_MIMETYPES = new Set(['image/jpeg', 'image/png']);

const mascotaPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MASCOTA_PHOTO_MAX_BYTES,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const mimetype = (file.mimetype || '').toLowerCase();
    if (MASCOTA_PHOTO_MIMETYPES.has(mimetype)) {
      return cb(null, true);
    }
    return cb(new Error(MASCOTA_PHOTO_FORMAT_MESSAGE), false);
  },
});

router.get('/api/mascotas/duenio/:duenioId', getMascotasByDuenioController);

router.post('/api/mascotas', createMascotaController);

router.put('/api/mascotas/:id', updateMascotaController);

router.delete('/api/mascotas/:id', deleteMascotaController);

router.post(
  '/api/mascotas/:id/photo',
  (req, res, next) => {
    mascotaPhotoUpload.single('photo')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || MASCOTA_PHOTO_FORMAT_MESSAGE,
        });
      }
      next();
    });
  },
  uploadMascotaPhotoController
);
router.get('/api/mascotas/:id/photo', getMascotaPhotoController);

module.exports = router;
