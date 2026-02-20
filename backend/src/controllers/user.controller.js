const { Prisma } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');
const prisma = require('../config/prisma');
const usuarioRepo = require('../repositories/usuario.repo');
const prestadorRepo = require('../repositories/prestador.repo');
const duenioRepo = require('../repositories/duenio.repo');
const servicioRepo = require('../repositories/servicio.repo');
const mascotaRepo = require('../repositories/mascota.repo');
const { splitNombreApellido } = require('../utils/strings');
const { descomponerUbicacion } = require('../utils/ubicacion');
const {
  buildHorariosFromAvailability,
  buildTipoMascotaFromPetTypes,
} = require('../utils/mappers');
const { getCoordinatesForDomicilio } = require('../services/geocoding.service');
const { buildPublicUrl } = require('../utils/publicUrl');

function parseMaybeJson(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
}

function parseMaybeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
}

// Obtener perfil de usuario
async function getPerfilController(req, res) {
  try {
    const { id } = req.params || {};
    const roleParam = String(req.query?.role || '').toLowerCase();

    if (!id) {
      return res.status(400).json({ success: false, message: 'Falta id de usuario' });
    }

    let userId;
    try {
      userId = BigInt(id);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Id inválido' });
    }

    // Verificar si es admin
    if (roleParam === 'admin') {
      const admin = await prisma.admin.findUnique({ where: { id: userId } });
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin no encontrado' });
      }
      return res.json({
        success: true,
        userData: {
          id: admin.id?.toString?.() || admin.id,
          nombre: 'Administrador',
          apellido: '',
          email: admin.email,
          rol: 'ADMIN',
        },
      });
    }

    // Verificar si es usuario (Dueño o Prestador)
    const usuario = await usuarioRepo.findById(userId);

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const userData = {
      id: usuario.id?.toString?.() || usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      avatar: buildPublicUrl(req, usuario.avatar),
      email: usuario.email,
      celular: usuario.celular,
      activo: usuario.activo,
      rol: usuario.rol,
      domicilio: usuario.domicilio
        ? {
            calle: usuario.domicilio.calle,
            numero: usuario.domicilio.numero,
            ciudad: usuario.domicilio.ciudad,
          }
        : null,
      creadoEn: usuario.creadoEn,
    };

    if (usuario.rol === 'DUENIO' && usuario.duenio) {
      userData.duenioId = usuario.duenio.id?.toString?.() || usuario.duenio.id;
      if (usuario.duenio.comentarios) {
        userData.descripcion = usuario.duenio.comentarios;
      }
      
      // Contar las mascotas del dueño
      const mascotas = await mascotaRepo.findByDuenioId(usuario.duenio.id);
      userData.petsCount = mascotas.length;

      // Promedio de reseñas recibidas por el dueño (emitidas por prestadores)
      const duenioResenaStats = await prisma.resena.aggregate({
        where: {
          emisorRol: 'PRESTADOR',
          reserva: { duenioId: usuario.duenio.id },
        },
        _avg: { calificacion: true },
        _count: { id: true },
      });
      userData.rating = Number(duenioResenaStats?._avg?.calificacion || 0);
      userData.reviewsCount = Number(duenioResenaStats?._count?.id || 0);
    }

    if (usuario.rol === 'PRESTADOR') {
      const prestador = await prestadorRepo.findByUsuarioId(usuario.id);
      const servicio = prestador?.prestadorservicio?.[0]?.servicio || null;
      
      if (prestador?.id != null) userData.prestadorId = String(prestador.id);
      if (servicio?.descripcion) userData.descripcion = servicio.descripcion;
      if (prestador?.perfil) userData.perfil = prestador.perfil;
      if (servicio?.tipoMascota) userData.tipoMascota = servicio.tipoMascota;
      if (servicio?.horarios) userData.horarios = servicio.horarios;
      if (servicio?.precio != null) userData.precio = servicio.precio;
      if (servicio?.duracion) userData.duracion = servicio.duracion;
      if (servicio?.disponible != null) userData.serviceActive = Boolean(servicio.disponible);
      userData.estadoPrestador = prestador?.estado ?? 'PENDIENTE';
      userData.motivoRechazo = prestador?.motivoRechazo ?? null;

      // Promedio de reseñas recibidas por el prestador (emitidas por dueños)
      if (prestador?.id != null) {
        const prestadorResenaStats = await prisma.resena.aggregate({
          where: {
            emisorRol: 'DUENIO',
            reserva: { prestadorId: prestador.id },
          },
          _avg: { calificacion: true },
          _count: { id: true },
        });
        userData.rating = Number(prestadorResenaStats?._avg?.calificacion || 0);
        userData.reviewsCount = Number(prestadorResenaStats?._count?.id || 0);
      } else {
        userData.rating = 0;
        userData.reviewsCount = 0;
      }
    }

    return res.json({ success: true, userData });
  } catch (err) {
    console.error('perfil get error', err);
    return res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
}

// Actualizar perfil de usuario
async function updatePerfilController(req, res) {
  try {
    const { id } = req.params || {};
    if (!id) {
      return res.status(400).json({ success: false, message: 'Falta id de usuario' });
    }

    let userId;
    try {
      userId = BigInt(id);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Id inválido' });
    }

    const {
      role,
      nombreApellido,
      descripcion,
      email,
      telefono,
      ubicacion,
      services,
      precio,
      duracion,
      availability,
      petTypes,
      petTypesCustom,
      serviceActive,
    } = req.body || {};

    const normalizedRole = String(role || '').toLowerCase();
    const availabilityValue = parseMaybeJson(availability, {});
    const petTypesValue = parseMaybeJson(petTypes, {});
    const serviceActiveValue = parseMaybeBoolean(serviceActive, false);
    if (!normalizedRole) {
      return res.status(400).json({ success: false, message: 'Falta role' });
    }

    // Verificar si es admin
    if (normalizedRole === 'admin') {
      const admin = await prisma.admin.findUnique({ where: { id: userId } });
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin no encontrado' });
      }

      const adminData = {};
      if (email) adminData.email = email;

      const updatedAdmin = Object.keys(adminData).length
        ? await prisma.admin.update({ where: { id: userId }, data: adminData })
        : admin;

      return res.json({
        success: true,
        userData: {
          id: updatedAdmin.id?.toString?.() || updatedAdmin.id,
          nombre: 'Administrador',
          apellido: '',
          email: updatedAdmin.email,
          rol: 'ADMIN',
        },
      });
    }

    // Verificar si es usuario (Dueño o Prestador)
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { domicilio: true },
    });

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { nombre, apellido } = splitNombreApellido(nombreApellido);
    const { calle, numero, ciudad } = descomponerUbicacion(ubicacion);
    const priceNumber = Number(precio);
    const hasPrice = Number.isFinite(priceNumber);

    let coords = null;
    if (ubicacion) {
      try {
        coords = await getCoordinatesForDomicilio({ calle, numero, ciudad });
        if (!coords) {
          await new Promise((r) => setTimeout(r, 400));
          coords = await getCoordinatesForDomicilio({ calle, numero, ciudad });
        }
        if (!coords) {
          return res.status(400).json({
            success: false,
            message:
              'No se pudieron obtener las coordenadas para la dirección. Verificá calle, número y barrio/ciudad e intentá de nuevo.',
          });
        }
      } catch (err) {
        console.warn('Geocoding domicilio falló:', err?.message ?? err);
        return res.status(400).json({
          success: false,
          message:
            'No se pudieron obtener las coordenadas para la dirección. Intentá de nuevo más tarde.',
        });
      }
    }

    const domicilioData = ubicacion
      ? {
          calle,
          numero,
          ciudad,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }
      : null;

    let avatarPath = null;
    if (req.file) {
      const file = req.file;
      const mime = (file.mimetype || '').toLowerCase();
      if (!mime.startsWith('image/')) {
        return res.status(400).json({ success: false, message: 'El avatar debe ser una imagen válida' });
      }

      const extByMime = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
      };
      const extension = extByMime[mime] || path.extname(file.originalname || '').toLowerCase() || '.jpg';
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');
      await fs.mkdir(uploadsDir, { recursive: true });
      const fileName = `avatar-${String(userId)}-${Date.now()}${extension}`;
      const fullPath = path.join(uploadsDir, fileName);
      await fs.writeFile(fullPath, file.buffer);
      avatarPath = `/uploads/avatars/${fileName}`;
    }

    // Actualizar datos
    await prisma.$transaction(async (tx) => {
      const dataUsuario = {};
      if (nombre) dataUsuario.nombre = nombre;
      if (apellido) dataUsuario.apellido = apellido;
      if (email) dataUsuario.email = email;
      if (telefono) dataUsuario.celular = telefono;
      if (avatarPath) dataUsuario.avatar = avatarPath;

      if (Object.keys(dataUsuario).length) {
        await tx.usuario.update({ where: { id: userId }, data: dataUsuario });
      }

      if (domicilioData) {
        if (usuario.domicilioId) {
          await tx.domicilio.update({
            where: { id: usuario.domicilioId },
            data: domicilioData,
          });
        } else {
          const nuevoDom = await tx.domicilio.create({
            data: domicilioData,
          });
          await tx.usuario.update({
            where: { id: userId },
            data: { domicilioId: nuevoDom.id },
          });
        }
      }

      if (normalizedRole === 'duenio' && descripcion) {
        await tx.duenio.upsert({
          where: { usuarioId: userId },
          update: { comentarios: descripcion },
          create: { usuarioId: userId, comentarios: descripcion },
        });
      }

      if (normalizedRole === 'prestador') {
        const horariosValue = buildHorariosFromAvailability(availabilityValue);
        const tipoMascotaValue = buildTipoMascotaFromPetTypes(petTypesValue, petTypesCustom);

        const prestador = await tx.prestador.upsert({
          where: { usuarioId: userId },
          update: {},
          create: { usuarioId: userId, perfil: 'Pendiente' },
        });

        const existingLink = await tx.prestadorservicio.findFirst({
          where: { prestadorId: prestador.id },
          orderBy: { id: 'desc' },
          select: { servicioId: true },
        });

        const servicioData = {
          descripcion: descripcion || 'Sin descripción',
          tipoMascota: tipoMascotaValue,
          precio: new Prisma.Decimal(hasPrice ? priceNumber : 0),
          horarios: horariosValue || null,
          duracion: duracion || null,
          disponible: serviceActiveValue === true,
        };

        if (existingLink?.servicioId) {
          await tx.servicio.update({
            where: { id: existingLink.servicioId },
            data: servicioData,
          });

          const precioUnitario = servicioData.precio;
          const cantidad = 1;
          const subtotal = Prisma.Decimal.mul(precioUnitario, cantidad);
          const porcentajeComision = parseFloat(process.env.COMISION_PORCENTAJE || '10');
          const comision = porcentajeComision > 0
            ? Prisma.Decimal.div(Prisma.Decimal.mul(subtotal, porcentajeComision), 100)
            : new Prisma.Decimal(0);
          const montoTotal = Prisma.Decimal.add(subtotal, comision);

          await tx.reserva.updateMany({
            where: {
              prestadorId: prestador.id,
              servicioId: existingLink.servicioId,
              estado: 'PENDIENTE_PAGO',
            },
            data: { precioUnitario, comision, montoTotal },
          });
        } else {
          const servicio = await tx.servicio.create({ data: servicioData });
          await tx.prestadorservicio.create({
            data: { prestadorId: prestador.id, servicioId: servicio.id },
          });
        }
      }
    });

    // Obtener usuario actualizado
    const updatedUser = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { domicilio: true },
    });

    let descripcionServicio = null;
    let perfilServicio = null;
    let horariosServicio = null;
    let tipoMascotaServicio = null;
    let precioServicio = null;
    let duracionServicio = null;
    let estadoServicio = null;
    let estadoPrestadorVal = null;
    let motivoRechazoVal = null;

    if (updatedUser?.rol === 'PRESTADOR') {
      const prestador = await prisma.prestador.findUnique({
        where: { usuarioId: userId },
        include: {
          prestadorservicio: {
            take: 1,
            orderBy: { id: 'desc' },
            include: { servicio: true },
          },
        },
      });
    
      const { perfil, estado = 'PENDIENTE', motivoRechazo = null, prestadorservicio } = prestador ?? {};
      const servicio = prestadorservicio?.[0]?.servicio ?? {};
    
      descripcionServicio   = servicio.descripcion   ?? null;
      perfilServicio        = perfil                 ?? null;
      horariosServicio      = servicio.horarios      ?? null;
      tipoMascotaServicio   = servicio.tipoMascota   ?? null;
      precioServicio        = servicio.precio        ?? null;
      duracionServicio      = servicio.duracion      ?? null;
      estadoServicio        = servicio.disponible    ?? null;
      estadoPrestadorVal    = estado;
      motivoRechazoVal      = motivoRechazo;
    }    

    const userDataResponse = {
      id: updatedUser.id?.toString?.() || updatedUser.id,
      nombre: updatedUser.nombre,
      apellido: updatedUser.apellido,
      avatar: buildPublicUrl(req, updatedUser.avatar),
      email: updatedUser.email,
      celular: updatedUser.celular,
      activo: updatedUser.activo,
      rol: updatedUser.rol,
      descripcion: descripcionServicio || (normalizedRole === 'duenio' ? descripcion : undefined),
      perfil: perfilServicio || undefined,
      horarios: horariosServicio || undefined,
      tipoMascota: tipoMascotaServicio || undefined,
      precio: precioServicio ?? undefined,
      duracion: duracionServicio || undefined,
      serviceActive: estadoServicio ?? undefined,
      domicilio: updatedUser.domicilio
        ? {
            calle: updatedUser.domicilio.calle,
            numero: updatedUser.domicilio.numero,
            ciudad: updatedUser.domicilio.ciudad,
            latitude: updatedUser.domicilio.latitude ?? undefined,
            longitude: updatedUser.domicilio.longitude ?? undefined,
          }
        : null,
      creadoEn: updatedUser.creadoEn,
    };
    if (updatedUser?.rol === 'PRESTADOR') {
      userDataResponse.estadoPrestador = estadoPrestadorVal;
      userDataResponse.motivoRechazo = motivoRechazoVal;
    }

    return res.json({ success: true, userData: userDataResponse });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Email ya registrado' });
    }
    console.error('perfil update error', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
  }
}

const PERFIL_QUERY_MAP = {
  cuidador: ['Cuidador'],
  paseador: ['Paseador'],
  salud: ['Veterinario a domicilio', 'Clínica Veterinaria'],
};

async function listPrestadoresController(req, res) {
  try {
    const { perfil, ciudad } = req.query ?? {};

    const perfilNorm = perfil ? String(perfil).toLowerCase().trim() : null;
    const perfilesValores = perfilNorm ? PERFIL_QUERY_MAP[perfilNorm] : null;

    const filtros = {
      ...(perfilesValores?.length && { perfilValores: perfilesValores }),
      ...(ciudad && { ciudad: String(ciudad) }),
    };

    const prestadores = await prestadorRepo.findActivosConFiltros(filtros);
    const prestadorIds = prestadores
      .map((p) => p?.id)
      .filter((id) => id != null);

    const reservasConResenas = prestadorIds.length > 0
      ? await prisma.reserva.findMany({
          where: {
            prestadorId: { in: prestadorIds },
          },
          select: {
            prestadorId: true,
            resena: {
              where: { emisorRol: 'DUENIO' },
              select: { calificacion: true },
            },
          },
        })
      : [];

    const ratingByPrestadorId = reservasConResenas.reduce((acc, reserva) => {
      const key = reserva.prestadorId?.toString?.() ?? String(reserva.prestadorId);
      if (!acc[key]) {
        acc[key] = { total: 0, count: 0 };
      }
      for (const resena of reserva.resena || []) {
        acc[key].total += Number(resena.calificacion || 0);
        acc[key].count += 1;
      }
      return acc;
    }, {});

    const result = prestadores.map((p) => {
      const { usuario, perfil, fechaIngreso, prestadorservicio = [] } = p;
      const { domicilio } = usuario ?? {};
      const ratingData = ratingByPrestadorId[String(p.id)] || { total: 0, count: 0 };
      const avgRating = ratingData.count > 0 ? ratingData.total / ratingData.count : 0;

      const servicioMain = prestadorservicio[0]?.servicio;

      return {
        id: String(p.id),
        usuarioId: usuario?.id ? String(usuario.id) : null,

        nombre: usuario?.nombre ?? '',
        apellido: usuario?.apellido ?? '',
        nombreCompleto:
          [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ') || 'Sin nombre',

        avatar: buildPublicUrl(req, usuario?.avatar || null),
        email: usuario?.email ?? '',
        celular: usuario?.celular ?? '',
        perfil: perfil ?? '',

        domicilio: domicilio && {
          calle: domicilio.calle ?? '',
          numero: domicilio.numero ?? '',
          ciudad: domicilio.ciudad ?? '',
          ubicacion: [domicilio.calle, domicilio.numero, domicilio.ciudad]
            .filter(Boolean)
            .join(', '),
          latitude: domicilio.latitude ?? null,
          longitude: domicilio.longitude ?? null,
        },

        servicio: servicioMain && {
          id: String(servicioMain.id),
          descripcion: servicioMain.descripcion ?? '',
          precio: servicioMain.precio ?? 0,
          horarios: servicioMain.horarios ?? '',
          tipoMascota: servicioMain.tipoMascota ?? '',
          duracion: servicioMain.duracion ?? '',
          disponible: Boolean(servicioMain.disponible),
        },

        fechaIngreso,
        avgRating,
        reviewsCount: ratingData.count,
      };
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('listPrestadores error', error);
    return res
      .status(500)
      .json({ success: false, message: 'Error al listar prestadores' });
  }
}

module.exports = {
  getPerfilController,
  updatePerfilController,
  listPrestadoresController,
};
