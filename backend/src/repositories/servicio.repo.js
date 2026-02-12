const prisma = require('../config/prisma');

async function create(data) {
  return prisma.servicio.create({ data });
}

async function update(id, data) {
  return prisma.servicio.update({ where: { id }, data });
}

async function upsert(descripcion, data) {
  const existing = await prisma.servicio.findFirst({
    where: { descripcion },
  });
  if (existing) return existing;
  return prisma.servicio.create({ data: { ...data, descripcion } });
}

async function findFirstByPrestadorId(prestadorId) {
  const link = await prisma.prestadorservicio.findFirst({
    where: { prestadorId },
    orderBy: { id: 'desc' },
    select: { servicioId: true },
  });
  return link?.servicioId || null;
}

async function createPrestadorServicio(prestadorId, servicioId) {
  return prisma.prestadorservicio.create({
    data: { prestadorId, servicioId },
  });
}

async function upsertPrestadorServicio(prestadorId, servicioId) {
  return prisma.prestadorservicio.upsert({
    where: {
      prestadorId_servicioId: { prestadorId, servicioId },
    },
    update: {},
    create: { prestadorId, servicioId },
  });
}

module.exports = {
  create,
  update,
  upsert,
  findFirstByPrestadorId,
  createPrestadorServicio,
  upsertPrestadorServicio,
};
