const prisma = require('../config/prisma');

async function findByUsuarioId(usuarioId) {
  return prisma.prestador.findUnique({
    where: { usuarioId },
    include: {
      prestadorservicio: {
        take: 1,
        orderBy: { id: 'desc' },
        include: { servicio: true },
      },
    },
  });
}

async function upsert(usuarioId, data) {
  return prisma.prestador.upsert({
    where: { usuarioId },
    update: data.update || {},
    create: { usuarioId, ...data.create },
  });
}

async function update(id, data) {
  return prisma.prestador.update({
    where: { id },
    data,
  });
}

async function create(data) {
  return prisma.prestador.create({ data });
}

async function findActivosConFiltros(filtros = {}) {
  const where = {
    estado: 'ACTIVO',
  };

  if (filtros.perfilValores?.length) {
    where.OR = filtros.perfilValores.map((valor) => ({
      perfil: { contains: valor },
    }));
  }

  if (filtros.ciudad) {
    where.usuario = {
      ...where.usuario,
      domicilio: {
        ciudad: {
          contains: filtros.ciudad,
          mode: 'insensitive',
        },
      },
    };
  }

  return prisma.prestador.findMany({
    where,
    include: {
      usuario: {
        include: { domicilio: true },
      },
      prestadorservicio: {
        include: { servicio: true },
      },
    },
    orderBy: {
      fechaIngreso: 'desc',
    },
  });
}

module.exports = {
  findByUsuarioId,
  upsert,
  update,
  create,
  findActivosConFiltros,
};
