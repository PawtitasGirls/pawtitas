const prisma = require('../config/prisma');

async function findByDuenioId(duenioId) {
  return prisma.mascota.findMany({
    where: { duenioId },
    orderBy: { id: 'desc' }
  });
}

async function findById(id) {
  return prisma.mascota.findUnique({
    where: { id },
    include: { duenio: true }
  });
}

async function create(data) {
  return prisma.mascota.create({ data });
}

async function update(id, data) {
  return prisma.mascota.update({
    where: { id },
    data
  });
}

async function deleteById(id) {
  return prisma.mascota.delete({
    where: { id }
  });
}

module.exports = {
  findByDuenioId,
  findById,
  create,
  update,
  deleteById,
};
