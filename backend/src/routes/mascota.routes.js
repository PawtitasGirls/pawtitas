const express = require('express');
const {
  getMascotasByDuenioController,
  createMascotaController,
  updateMascotaController,
  deleteMascotaController,
} = require('../controllers/mascota.controller');

const router = express.Router();

router.get('/api/mascotas/duenio/:duenioId', getMascotasByDuenioController);

router.post('/api/mascotas', createMascotaController);

router.put('/api/mascotas/:id', updateMascotaController);

router.delete('/api/mascotas/:id', deleteMascotaController);

module.exports = router;
