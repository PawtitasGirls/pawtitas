const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat.controller');

router.post('/ensure-user', chatController.ensureUser);

module.exports = router;
