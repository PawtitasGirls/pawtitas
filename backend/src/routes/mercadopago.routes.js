const express = require('express');
const router = express.Router();
const {
  createPreferenceController,
  webhookController,
  confirmarFinalizacionController,
  oauthUrlController,
  oauthCallbackController,
  oauthStatusController,
  oauthDisconnectController,
} = require('../controllers/mercadopago.controller');

router.post('/api/mercadopago/create-preference', createPreferenceController);
router.post('/api/mercadopago/webhook', webhookController);
router.post('/api/mercadopago/confirmar-finalizacion', confirmarFinalizacionController);
router.get('/api/mercadopago/oauth-url', oauthUrlController);
router.get('/api/mercadopago/oauth-callback', oauthCallbackController);
router.get('/api/mercadopago/oauth-status', oauthStatusController);
router.post('/api/mercadopago/oauth-disconnect', oauthDisconnectController);

module.exports = router;