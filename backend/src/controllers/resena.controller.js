const prisma = require('../config/prisma');
const resenaRepo = require('../repositories/resena.repo');
const reservaRepo = require('../repositories/reserva.repo');

function formatNombre(usuario) {
  if (!usuario) return 'Usuario';
  return [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || 'Usuario';
}

async function crearResenaController(req, res) {
  try {
    const { reservaId, emisorRol, calificacion, comentario } = req.body;

    if (!reservaId || !emisorRol || !calificacion) {
      return res.status(400).json({ success: false, message: 'Faltan datos' });
    }

    const reserva = await reservaRepo.findById(BigInt(reservaId));

    if (!reserva) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }

    if (reserva.estado !== 'FINALIZADO') {
      return res.status(400).json({
        success: false,
        message: 'La reserva no está finalizada',
      });
    }

    if (!reserva.confirmadoPorDuenio || !reserva.confirmadoPorPrestador) {
      return res.status(400).json({
        success: false,
        message: 'Ambas partes deben confirmar antes de reseñar',
      });
    }
    

   
    const existente = await resenaRepo.findByReservaAndRol(
      BigInt(reservaId),
      emisorRol
    );

    if (existente) {
      return res.status(409).json({
        success: false,
        message: 'Ya has dejado una reseña para esta reserva',
      });
    }

    const nueva = await resenaRepo.create({
      reservaId: BigInt(reservaId),
      emisorRol,
      calificacion,
      comentario,
    });

    return res.status(201).json({
      success: true,
      resena: {
        ...nueva,
        id: nueva.id.toString(),
      },
    });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno',
    });
  }
}

async function getMisResenasController(req, res) {
  try {
    const { role, userId } = req.query;
    const roleUpper = String(role || '').toUpperCase();

    if (!userId || !roleUpper) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos: role y userId',
      });
    }

    if (roleUpper !== 'DUENIO' && roleUpper !== 'PRESTADOR') {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido para consultar reseñas',
      });
    }

    let id;
    try {
      id = BigInt(userId);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'userId inválido',
      });
    }

    const where = {
      emisorRol: roleUpper,
      reserva: roleUpper === 'DUENIO' ? { duenioId: id } : { prestadorId: id },
    };

    const resenas = await prisma.resena.findMany({
      where,
      include: {
        reserva: {
          include: {
            prestador: {
              include: {
                usuario: true,
              },
            },
            duenio: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    const items = resenas.map((resena) => {
      const contraparteUsuario = roleUpper === 'DUENIO'
        ? resena.reserva?.prestador?.usuario
        : resena.reserva?.duenio?.usuario;

      const tipo = roleUpper === 'DUENIO'
        ? (resena.reserva?.prestador?.perfil || '')
        : 'dueño';

      return {
        id: resena.id.toString(),
        reservaId: resena.reservaId?.toString?.() ?? null,
        rating: Number(resena.calificacion || 0),
        texto: resena.comentario || '',
        fecha: resena.fecha,
        tipo,
        usuario: {
          nombre: formatNombre(contraparteUsuario),
          avatar: null,
        },
      };
    });

    return res.json({
      success: true,
      resenas: items,
    });
  } catch (error) {
    console.error('Error al obtener mis reseñas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno',
    });
  }
}

async function getResenasRecibidasController(req, res) {
  try {
    const { targetRole, targetId } = req.query;
    const roleUpper = String(targetRole || '').toUpperCase();

    if (!targetId || !roleUpper) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos: targetRole y targetId',
      });
    }

    if (roleUpper !== 'DUENIO' && roleUpper !== 'PRESTADOR') {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido para consultar reseñas recibidas',
      });
    }

    let entityId;
    try {
      entityId = BigInt(targetId);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'targetId inválido',
      });
    }

    const emisorEsperado = roleUpper === 'PRESTADOR' ? 'DUENIO' : 'PRESTADOR';
    const where = {
      emisorRol: emisorEsperado,
      reserva: roleUpper === 'PRESTADOR' ? { prestadorId: entityId } : { duenioId: entityId },
    };

    const resenas = await prisma.resena.findMany({
      where,
      include: {
        reserva: {
          include: {
            duenio: { include: { usuario: true } },
            prestador: { include: { usuario: true } },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    const items = resenas.map((resena) => {
      const autor = resena.emisorRol === 'DUENIO'
        ? resena.reserva?.duenio?.usuario
        : resena.reserva?.prestador?.usuario;

      return {
        id: resena.id.toString(),
        reservaId: resena.reservaId?.toString?.() ?? null,
        rating: Number(resena.calificacion || 0),
        texto: resena.comentario || '',
        fecha: resena.fecha,
        autor: {
          nombre: formatNombre(autor),
          avatar: null,
        },
      };
    });

    return res.json({
      success: true,
      resenas: items,
    });
  } catch (error) {
    console.error('Error al obtener reseñas recibidas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno',
    });
  }
}


module.exports = {
  crearResenaController,
  getMisResenasController,
  getResenasRecibidasController,
};
