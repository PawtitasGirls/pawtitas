const express = require('express');
const { 
  getPerfilController, 
  updatePerfilController,
  listPrestadoresController
} = require('../controllers/user.controller');

const router = express.Router();

router.get('/api/prestadores', listPrestadoresController);
router.get('/api/perfil/:id', getPerfilController);
router.put('/api/perfil/:id', updatePerfilController);

module.exports = router;
