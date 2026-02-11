const express = require('express');
const router = express.Router();
const {
  createPreferenceController,
  webhookController,
  confirmarFinalizacionController,
} = require('../controllers/mercadopago.controller');

router.post('/api/mercadopago/create-preference', createPreferenceController);
router.post('/api/mercadopago/webhook', webhookController);
router.post('/api/mercadopago/confirmar-finalizacion', confirmarFinalizacionController);

module.exports = router;