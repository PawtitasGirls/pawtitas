const prisma = require('../config/prisma');
const resenaRepo = require('../repositories/resena.repo');
const reservaRepo = require('../repositories/reserva.repo');

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


module.exports = {
  crearResenaController,
};
