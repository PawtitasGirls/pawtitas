const express = require('express');
const { crearResenaController, getMisResenasController } = require('../controllers/resena.controller');

const router = express.Router();

router.post('/api/resenas', crearResenaController);
router.get('/api/resenas/mias', getMisResenasController);

module.exports = router;
