const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat.controller');
const { upload } = require('../config/upload');

router.post('/ensure-user', chatController.ensureUser);
router.post('/upload-image', upload.single('image'), chatController.uploadImage);

module.exports = router;
