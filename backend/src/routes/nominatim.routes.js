const express = require('express');
const { nominatimController } = require('../controllers/nominatim.controller');

const router = express.Router();

router.get('/api/nominatim', nominatimController);

module.exports = router;
