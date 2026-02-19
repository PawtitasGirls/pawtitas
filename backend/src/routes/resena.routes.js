const express = require('express');
const {
  crearResenaController,
  getMisResenasController,
  getResenasRecibidasController,
} = require('../controllers/resena.controller');

const router = express.Router();

router.post('/api/resenas', crearResenaController);
router.get('/api/resenas/mias', getMisResenasController);
router.get('/api/resenas/recibidas', getResenasRecibidasController);

module.exports = router;
