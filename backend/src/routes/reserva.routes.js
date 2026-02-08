const express = require('express');
const {
  createReservaController,
  getReservasByDuenioController,
  getReservasByPrestadorController,
} = require('../controllers/reserva.controller');

const router = express.Router();

router.post('/api/reservas', createReservaController);
router.get('/api/reservas/duenio/:duenioId', getReservasByDuenioController);
router.get('/api/reservas/prestador/:prestadorId', getReservasByPrestadorController);

module.exports = router;
