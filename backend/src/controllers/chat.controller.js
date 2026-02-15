const streamChatService = require('../services/streamChat.service');
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

module.exports = {
  ensureUser,
};
