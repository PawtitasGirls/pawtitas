const prisma = require('../config/prisma');

// Mapea estado backend -> front (estadosUsuario)
function mapEstado(estado) {
  if (!estado) return 'pendiente';
  const s = String(estado).toUpperCase();
  if (s === 'ACTIVO') return 'activado';
  if (s === 'RECHAZADO') return 'desactivado';
  return 'pendiente';
}

// Lista prestadores para el panel admin
async function listPrestadores(req, res) {
  try {
    const rows = await prisma.prestador.findMany({
      include: {
        usuario: { include: { domicilio: true } },
        prestadorservicio: {
          take: 1,
          orderBy: { id: 'desc' },
          include: { servicio: true },
        },
      },
      orderBy: { fechaIngreso: 'desc' },
    });

    const list = rows.map((p) => {
      const u = p.usuario;
      const servicio = p.prestadorservicio?.[0]?.servicio;
      const domicilio = u?.domicilio;
      const ubicacion = domicilio
        ? [domicilio.calle, domicilio.numero, domicilio.ciudad].filter(Boolean).join(', ')
        : null;

      return {
        id: u?.id?.toString?.() ?? String(p.id),
        prestadorId: p.id?.toString?.(),
        nombre: [u?.nombre, u?.apellido].filter(Boolean).join(' ').trim() || 'Sin nombre',
        email: u?.email ?? '',
        telefono: u?.celular ?? '',
        ubicacion: ubicacion ?? 'No disponible',
        perfil: p.perfil || servicio?.descripcion || 'Sin perfil',
        descripcion: servicio?.descripcion ?? null,
        estado: mapEstado(p.estado),
        estadoBackend: p.estado,
        motivoRechazo: p.motivoRechazo ?? null,
        fechaRegistro: u?.creadoEn ?? p.fechaIngreso,
        documentosUrl: p.documentos || null,
        certificacionesUrl: p.certificaciones || null,
      };
    });

    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('admin listPrestadores error', err);
    return res.status(500).json({ success: false, message: 'Error al listar prestadores' });
  }
}

// Actualiza estado
async function updatePrestadorEstado(req, res) {
  try {
    const { usuarioId } = req.params;
    const { estado, motivoRechazo } = req.body || {};

    if (!usuarioId) {
      return res.status(400).json({ success: false, message: 'Falta usuarioId' });
    }

    const estadoUpper = String(estado || '').toUpperCase();
    if (estadoUpper !== 'ACTIVO' && estadoUpper !== 'RECHAZADO') {
      return res.status(400).json({
        success: false,
        message: 'estado debe ser ACTIVO o RECHAZADO',
      });
    }

    let uid;
    try {
      uid = BigInt(usuarioId);
    } catch {
      return res.status(400).json({ success: false, message: 'usuarioId inválido' });
    }

    const prestador = await prisma.prestador.findUnique({
      where: { usuarioId: uid },
    });

    if (!prestador) {
      return res.status(404).json({ success: false, message: 'Prestador no encontrado' });
    }

    const updateData = { estado: estadoUpper };
    if (estadoUpper === 'RECHAZADO' && typeof motivoRechazo === 'string') {
      updateData.motivoRechazo = motivoRechazo.trim() || null;
    } else if (estadoUpper === 'ACTIVO') {
      updateData.motivoRechazo = null;
    }

    await prisma.prestador.update({
      where: { id: prestador.id },
      data: updateData,
    });

    return res.json({
      success: true,
      data: {
        usuarioId: usuarioId,
        estado: estadoUpper,
        motivoRechazo: updateData.motivoRechazo ?? null,
      },
    });
  } catch (err) {
    console.error('admin updatePrestadorEstado error', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar estado' });
  }
}

module.exports = {
  listPrestadores,
  updatePrestadorEstado,
};
