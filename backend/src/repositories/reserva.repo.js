const prisma = require('../config/prisma');

async function create(data) {
  return prisma.reserva.create({ data });
}

async function findById(id) {
  return prisma.reserva.findUnique({
    where: { id },
  });
}

async function findManyByDuenioId(duenioId) {
  return prisma.reserva.findMany({
    where: { duenioId },
    include: {
      prestador: {
        include: {
          usuario: { include: { domicilio: true } },
          prestadorservicio: { include: { servicio: true } },
        },
      },
      servicio: true,
      mascota: true,
      resena: true,
    },
    orderBy: { fechaReserva: 'desc' },
  });
}

async function findManyByPrestadorId(prestadorId) {
  return prisma.reserva.findMany({
    where: { prestadorId },
    include: {
      duenio: {
        include: {
          usuario: { include: { domicilio: true } },
        },
      },
      mascota: true,
      servicio: true,
      resena: true,
    },
    orderBy: { fechaReserva: 'desc' },
  });
}

async function findExistingPendienteOrConfirmado(duenioId, prestadorId, mascotaId, servicioId) {
  return prisma.reserva.findFirst({
    where: {
      duenioId,
      prestadorId,
      mascotaId,
      servicioId,
      estado: { in: ['PENDIENTE_PAGO', 'PAGADO'] },
    },
  });
}

async function updateEstado(id, estado) {
  return prisma.reserva.update({ where: { id }, data: { estado } });
}

module.exports = {
  create,
  findById,
  findManyByDuenioId,
  findManyByPrestadorId,
  findExistingPendienteOrConfirmado,
  updateEstado,
};
