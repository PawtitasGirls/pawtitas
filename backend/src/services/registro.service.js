const bcrypt = require('bcryptjs');
const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');
const usuarioRepo = require('../repositories/usuario.repo');
const { descomponerUbicacion } = require('../utils/ubicacion');
const { updateDomicilioWithCoordinates } = require('./geocoding.service');

async function registerUser({
  nombre,
  apellido,
  fechaNacimiento,
  correo,
  password,
  telefono,
  ubicacion,
  documento,
  genero,
  perfil,
  especialidad,
  documentosFile,
  certificadosFile,
}) {
  // Validar campos requeridos
  const required = [
    'nombre',
    'apellido',
    'fechaNacimiento',
    'correo',
    'password',
    'telefono',
    'ubicacion',
    'documento',
    'genero',
    'perfil',
  ];
  const missing = required.filter((k) => !eval(k));
  if (missing.length) {
    throw new Error(`Faltan: ${missing.join(', ')}`);
  }

  const fecha = new Date(fechaNacimiento);
  if (Number.isNaN(fecha.getTime())) {
    throw new Error('fechaNacimiento inválida');
  }

  // Descomponer ubicación
  const { calle, numero, ciudad } = descomponerUbicacion(ubicacion);

  // Verificar duplicados
  const existingUser = await usuarioRepo.existsByEmailOrDni(correo, documento);
  if (existingUser) {
    const conflicts = [];
    if (existingUser.email === correo) conflicts.push('email');
    if (existingUser.dni === documento) conflicts.push('documento');
    if (existingUser.usuario === correo) conflicts.push('usuario');
    throw new Error(`Ya existe un usuario registrado con este ${conflicts.join(' y ')}`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario
  const result = await prisma.$transaction(async (tx) => {
    const generoRow = await tx.genero.upsert({
      where: { nombre: genero },
      update: {},
      create: { nombre: genero },
    });

    const domicilioRow = await tx.domicilio.create({
      data: { calle, numero, ciudad },
    });

    const usuarioRow = await tx.usuario.create({
      data: {
        usuario: correo,
        clave: hashedPassword,
        nombre,
        apellido,
        dni: documento,
        fechaNacimiento: fecha,
        celular: telefono,
        email: correo,
        rol: perfil === 'prestador' ? 'PRESTADOR' : 'DUENIO',
        domicilioId: domicilioRow.id,
        generoId: generoRow.id,
      },
    });

    if (perfil === 'prestador') {
      const prestador = await tx.prestador.create({
        data: {
          usuarioId: usuarioRow.id,
          certificaciones: certificadosFile?.name || null,
          documentos: documentosFile?.name || null,
          perfil: especialidad || null,
          estado: 'PENDIENTE',
        },
      });

      if (especialidad) {
          const servicio = await tx.servicio.create({
          data: {
            descripcion: especialidad,
            tipoMascota: 'General',
            horarios: '',
            precio: new Prisma.Decimal(0),
          },
        });
        await tx.prestadorservicio.create({
          data: { prestadorId: prestador.id, servicioId: servicio.id },
        });
      }
    } else {
      await tx.duenio.create({ data: { usuarioId: usuarioRow.id } });
    }

    return usuarioRow;
  });

  try {
    await updateDomicilioWithCoordinates(result.domicilioId, { calle, numero, ciudad });
  } catch (err) {
    console.warn('Geocoding domicilio en registro falló:', err?.message ?? err);
  }

  return result;
}

module.exports = {
  registerUser,
};
