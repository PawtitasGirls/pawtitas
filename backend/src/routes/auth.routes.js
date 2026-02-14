const express = require('express');
const {
  loginController,
  registroController,
  solicitarCodigoRecuperacion,
  verificarCodigoRecuperacion,
  actualizarClaveRecuperacion,
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', loginController);
router.post('/api/registro', registroController);

// Recuperación de contraseña
router.post('/api/recuperar-contrasena/solicitar', solicitarCodigoRecuperacion);
router.post('/api/recuperar-contrasena/verificar-codigo', verificarCodigoRecuperacion);
router.post('/api/recuperar-contrasena/nueva-clave', actualizarClaveRecuperacion);

module.exports = router;
