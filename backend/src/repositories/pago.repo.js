const prisma = require('../config/prisma');

async function create(data) {
  return prisma.pago.create({ data });
}

async function findByReservaId(reservaId) {
  return prisma.pago.findUnique({
    where: { reservaId: BigInt(reservaId) },
    include: { reserva: true },
  });
}

async function findByMpPreferenceId(preferenceId) {
  return prisma.pago.findFirst({
    where: { mpPreferenceId: preferenceId },
    include: { reserva: true },
  });
}

async function updateByReservaId(reservaId, data) {
  return prisma.pago.update({
    where: { reservaId: BigInt(reservaId) },
    data,
  });
}

module.exports = {
  create,
  findByReservaId,
  findByMpPreferenceId,
  updateByReservaId,
};