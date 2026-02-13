const express = require('express');
const { crearResenaController } = require('../controllers/resena.controller');

const router = express.Router();

router.post('/api/resenas', crearResenaController);

module.exports = router;
