const prisma = require('../config/prisma');

async function create(data) {
  return prisma.resena.create({
    data,
  });
}

async function findByReservaAndRol(reservaId, emisorRol) {
  return prisma.resena.findFirst({
    where: {
      reservaId,
      emisorRol,
    },
  });
}

module.exports = {
  create,
  findByReservaAndRol,
};
