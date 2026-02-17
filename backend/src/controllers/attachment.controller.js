const prisma = require('../config/prisma');

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
};
