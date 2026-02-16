const express = require('express');
const {
  loginController,
  registroController,
  solicitarCodigoRecuperacion,
  verificarCodigoRecuperacion,
  actualizarClaveRecuperacion,
} = require('../controllers/auth.controller');
const { upload } = require('../config/upload');

const router = express.Router();

router.post('/login', loginController);

// Registro: acepta JSON (sin archivos) o multipart/form-data con documentos/certificados
router.post(
  '/api/registro',
  upload.fields([
    { name: 'documentosFile', maxCount: 1 },
    { name: 'certificadosFile', maxCount: 1 },
  ]),
  registroController
);

// Recuperación de contraseña
router.post('/api/recuperar-contrasena/solicitar', solicitarCodigoRecuperacion);
router.post('/api/recuperar-contrasena/verificar-codigo', verificarCodigoRecuperacion);
router.post('/api/recuperar-contrasena/nueva-clave', actualizarClaveRecuperacion);

module.exports = router;
