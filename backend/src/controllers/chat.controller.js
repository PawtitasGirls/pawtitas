const streamChatService = require('../services/streamChat.service');
const fs = require('fs/promises');
const path = require('path');
const { buildPublicUrl } = require('../utils/publicUrl');
/**
 * POST /api/chat/ensure-user
 */
const ensureUser = async (req, res) => {
  try {
    const { userId, name, image } = req.body;

    // 🔎 Validación básica
    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        message: 'userId y name son obligatorios',
      });
    }

    // 🔐 Llamada al servicio de Stream
    await streamChatService.ensureUser(userId, name, image);

    return res.status(200).json({
      success: true,
    });

  } catch (error) {
    console.error('Error en ensureUser:', error);

    return res.status(500).json({
      success: false,
      message: 'Error interno al asegurar usuario en Stream',
    });
  }
};

/**
 * POST /api/chat/upload-image
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Debes adjuntar una imagen',
      });
    }

    const mime = String(req.file.mimetype || '').toLowerCase();
    if (!mime.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'El archivo debe ser una imagen',
      });
    }

    const extByMime = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    const extension = extByMime[mime] || path.extname(req.file.originalname || '').toLowerCase() || '.jpg';
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'chat');
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileName = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`;
    const fullPath = path.join(uploadsDir, fileName);
    await fs.writeFile(fullPath, req.file.buffer);

    const relativePath = `/uploads/chat/${fileName}`;
    return res.status(201).json({
      success: true,
      url: buildPublicUrl(req, relativePath),
      path: relativePath,
    });
  } catch (error) {
    console.error('Error en uploadImage:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al subir imagen de chat',
    });
  }
};

module.exports = {
  ensureUser,
  uploadImage,
};
