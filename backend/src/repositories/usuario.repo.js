const prisma = require('../config/prisma');

/**
 * Busca un usuario por email
 */
async function findByEmail(email) {
  return prisma.usuario.findUnique({
    where: { email },
    include: { domicilio: true, duenio: true, prestador: true },
  });
}

/**
 * Busca un usuario por ID
 */
async function findById(id) {
  return prisma.usuario.findUnique({
    where: { id },
    include: { domicilio: true, duenio: true },
  });
}

/**
 * Crea un nuevo usuario
 */
async function create(data) {
  return prisma.usuario.create({ data });
}

/**
 * Actualiza un usuario
 */
async function update(id, data) {
  return prisma.usuario.update({ where: { id }, data });
}

/**
 * Verifica si existe un usuario con email o DNI
 */
async function existsByEmailOrDni(email, dni) {
  return prisma.usuario.findFirst({
    where: {
      OR: [
        { email },
        { dni },
        { usuario: email },
      ],
    },
    select: { email: true, dni: true, usuario: true },
  });
}

module.exports = {
  findByEmail,
  findById,
  create,
  update,
  existsByEmailOrDni,
};
