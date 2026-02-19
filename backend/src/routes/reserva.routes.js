const express = require('express');
const {
  createReservaController,
  getReservasByDuenioController,
  getReservasByPrestadorController,
  cancelarReservaController,
} = require('../controllers/reserva.controller');

const router = express.Router();

router.post('/api/reservas', createReservaController);
router.get('/api/reservas/duenio/:duenioId', getReservasByDuenioController);
router.get('/api/reservas/prestador/:prestadorId', getReservasByPrestadorController);
router.patch('/api/reservas/:id/cancelar', cancelarReservaController);

module.exports = router;
