const express = require('express');
const { listByPrestador, download } = require('../controllers/attachment.controller');

const router = express.Router();

router.get('/api/prestadores/:id/attachments', listByPrestador);
router.get('/api/attachments/:attachmentId/download', download);

module.exports = router;
