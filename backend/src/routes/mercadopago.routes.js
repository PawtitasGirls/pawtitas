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

const APP_URL = process.env.APP_URL || '/';

router.post('/api/mercadopago/create-preference', createPreferenceController);
router.post('/api/mercadopago/webhook', webhookController);
router.post('/api/mercadopago/confirmar-finalizacion', confirmarFinalizacionController);
router.get('/api/mercadopago/oauth-url', oauthUrlController);
router.get('/api/mercadopago/oauth-callback', oauthCallbackController);
router.get('/api/mercadopago/oauth-status', oauthStatusController);
router.post('/api/mercadopago/oauth-disconnect', oauthDisconnectController);

router.get('/payment/success', (req, res) => {
  const { reserva_id } = req.query;
  const target = reserva_id
    ? `${APP_URL}payment/success?reserva_id=${encodeURIComponent(reserva_id)}`
    : `${APP_URL}payment/success`;
  return res.redirect(target);
});

router.get('/payment/failure', (req, res) => {
  const { reserva_id } = req.query;
  const target = reserva_id
    ? `${APP_URL}payment/failure?reserva_id=${encodeURIComponent(reserva_id)}`
    : `${APP_URL}payment/failure`;
  return res.redirect(target);
});

router.get('/payment/pending', (req, res) => {
  const { reserva_id } = req.query;
  const target = reserva_id
    ? `${APP_URL}payment/pending?reserva_id=${encodeURIComponent(reserva_id)}`
    : `${APP_URL}payment/pending`;
  return res.redirect(target);
});

module.exports = router;