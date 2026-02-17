const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');
const DEBUG_LOG = path.resolve(__dirname, '../../../.cursor/debug.log');
const usuarioRepo = require('../repositories/usuario.repo');
const { descomponerUbicacion } = require('../utils/ubicacion');
const { updateDomicilioWithCoordinates } = require('./geocoding.service');

function saveAttachmentFromMulterFile(tx, prestadorId, field, file) {
  if (!file || !Buffer.isBuffer(file.buffer)) return null;
  const fileName = (file.originalname || file.name || 'archivo').replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const mimeType = file.mimetype || 'application/octet-stream';
  const size = Number(file.size) || file.buffer.length;
  return tx.attachment.create({
    data: {
      prestadorId,
      field,
      fileName,
      mimeType,
      size,
      data: file.buffer,
    },
  });
}

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

  const { calle, numero, ciudad } = descomponerUbicacion(ubicacion);

  const existingUser = await usuarioRepo.existsByEmailOrDni(correo, documento);
  if (existingUser) {
    const conflicts = [];
    if (existingUser.email === correo) conflicts.push('email');
    if (existingUser.dni === documento) conflicts.push('documento');
    if (existingUser.usuario === correo) conflicts.push('usuario');
    throw new Error(`Ya existe un usuario registrado con este ${conflicts.join(' y ')}`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

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

    let attachmentsCreated = 0;
    let prestadorIdCreated = null;
    if (perfil === 'prestador') {
      const prestador = await tx.prestador.create({
        data: {
          usuarioId: usuarioRow.id,
          certificaciones: null,
          documentos: null,
          perfil: especialidad || null,
          estado: 'PENDIENTE',
        },
      });
      prestadorIdCreated = prestador.id;

      if (documentosFile && Buffer.isBuffer(documentosFile.buffer)) {
        await saveAttachmentFromMulterFile(tx, prestador.id, 'documentosFile', documentosFile);
        attachmentsCreated++;
      }
      if (certificadosFile && Buffer.isBuffer(certificadosFile.buffer)) {
        await saveAttachmentFromMulterFile(tx, prestador.id, 'certificadosFile', certificadosFile);
        attachmentsCreated++;
      }
      // #region agent log
      try {
        const line = JSON.stringify({ location: 'registro.service.js:registerUser', message: 'attachmentsCreated', data: { prestadorId: prestador.id.toString(), attachmentsCreated }, timestamp: Date.now(), hypothesisId: 'H1' }) + '\n';
        fs.appendFileSync(DEBUG_LOG, line);
      } catch (_) {}
      // #endregion

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

    return { usuarioRow, attachmentsCreated, prestadorId: prestadorIdCreated };
  });

  try {
    await updateDomicilioWithCoordinates(result.usuarioRow.domicilioId, { calle, numero, ciudad });
  } catch (err) {
    console.warn('Geocoding domicilio en registro falló:', err?.message ?? err);
  }

  if (result.prestadorId != null) {
    console.log('[REGISTRO] prestadorId creado=', result.prestadorId.toString(), 'attachments creados=', result.attachmentsCreated ?? 0);
  }

  return result.usuarioRow;
}

module.exports = {
  registerUser,
};
