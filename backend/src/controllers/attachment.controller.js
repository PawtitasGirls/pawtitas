const prisma = require('../config/prisma');

/**
 * POST /api/prestadores/:id/profile-photo
 * Reemplaza la foto de perfil (field="profilePhoto") del prestador.
 */
async function uploadProfilePhoto(req, res) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Falta id de prestador' });
    }
    let prestadorId;
    try {
      prestadorId = BigInt(id);
    } catch {
      return res.status(400).json({ success: false, message: 'id inválido' });
    }

    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Formato incorrecto, solo puede ser jpg, jpeg o png',
      });
    }

    await prisma.attachment.deleteMany({
      where: { prestadorId, field: 'profilePhoto' },
    });

    await prisma.attachment.create({
      data: {
        prestadorId,
        field: 'profilePhoto',
        fileName: file.originalname || 'profile-photo',
        mimeType: file.mimetype || 'application/octet-stream',
        size: typeof file.size === 'number' ? file.size : file.buffer.length,
        data: file.buffer,
      },
    });

    return res.json({
      success: true,
      data: { downloadUrl: `/api/prestadores/${id}/profile-photo` },
    });
  } catch (err) {
    console.error('uploadProfilePhoto error', err);
    return res.status(500).json({ success: false, message: 'Error al guardar foto de perfil' });
  }
}

/**
 * GET /api/prestadores/:id/profile-photo
 * Stream del binario con Content-Type y Content-Disposition inline.
 */
async function getProfilePhoto(req, res) {
  try {
    const id = req.params.id;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mis-conexiones-avatar',hypothesisId:'H4',location:'attachment.controller.js:getProfilePhoto',message:'GET profile photo',data:{hasId:Boolean(id),host:req?.headers?.host || null,protocol:req?.headers?.['x-forwarded-proto'] || req?.protocol || null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!id) {
      return res.status(400).json({ success: false, message: 'Falta id de prestador' });
    }
    let prestadorId;
    try {
      prestadorId = BigInt(id);
    } catch {
      return res.status(400).json({ success: false, message: 'id inválido' });
    }

    const attachment = await prisma.attachment.findFirst({
      where: { prestadorId, field: 'profilePhoto' },
      orderBy: { createdAt: 'desc' },
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mis-conexiones-avatar',hypothesisId:'H5',location:'attachment.controller.js:getProfilePhoto',message:'Profile photo encontrada',data:{hasAttachment:Boolean(attachment),mimeType:attachment?.mimeType || null,size:attachment?.size || null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'No hay foto de perfil cargada',
      });
    }

    const mimeType = attachment.mimeType || 'application/octet-stream';
    const fileName = attachment.fileName || 'profile-photo';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(attachment.data);
  } catch (err) {
    console.error('getProfilePhoto error', err);
    return res.status(500).json({ success: false, message: 'Error al descargar' });
  }
}

/**
 * GET /api/prestadores/:id/attachments
 * id = prestadorId. Devuelve metadata (sin data) de los adjuntos.
 */
async function listByPrestador(req, res) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Falta id de prestador' });
    }
    let prestadorId;
    try {
      prestadorId = BigInt(id);
    } catch {
      return res.status(400).json({ success: false, message: 'id inválido' });
    }

    const attachments = await prisma.attachment.findMany({
      where: { prestadorId },
      select: {
        id: true,
        prestadorId: true,
        field: true,
        fileName: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const list = attachments.map((a) => ({
      id: a.id.toString(),
      prestadorId: a.prestadorId.toString(),
      field: a.field,
      fileName: a.fileName,
      mimeType: a.mimeType,
      size: a.size,
      createdAt: a.createdAt,
      downloadUrl: `/api/attachments/${a.id}/download`,
    }));

    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('listByPrestador error', err);
    return res.status(500).json({ success: false, message: 'Error al listar adjuntos' });
  }
}

/**
 * GET /api/attachments/:attachmentId/download
 * Stream del binario con Content-Type y Content-Disposition inline.
 */
async function download(req, res) {
  try {
    const attachmentId = req.params.attachmentId;
    if (!attachmentId) {
      return res.status(400).json({ success: false, message: 'Falta attachmentId' });
    }
    let id;
    try {
      id = BigInt(attachmentId);
    } catch {
      return res.status(400).json({ success: false, message: 'attachmentId inválido' });
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Adjunto no encontrado' });
    }

    const mimeType = attachment.mimeType || 'application/octet-stream';
    const fileName = attachment.fileName || 'archivo';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.send(attachment.data);
  } catch (err) {
    console.error('attachment download error', err);
    return res.status(500).json({ success: false, message: 'Error al descargar' });
  }
}

module.exports = {
  listByPrestador,
  download,
  uploadProfilePhoto,
  getProfilePhoto,
};
