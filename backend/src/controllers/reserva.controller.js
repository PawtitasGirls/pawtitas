const prisma = require('../config/prisma');
const reservaRepo = require('../repositories/reserva.repo');
const mascotaRepo = require('../repositories/mascota.repo');
const { Prisma } = require('@prisma/client');

function serializeReserva(r) {
  const id = r.id?.toString?.() ?? r.id;
  const prestadorId = r.prestadorId?.toString?.() ?? r.prestadorId;
  const duenioId = r.duenioId?.toString?.() ?? r.duenioId;
  const mascotaId = r.mascotaId?.toString?.() ?? r.mascotaId;
  const servicioId = r.servicioId?.toString?.() ?? r.servicioId;
  return {
    ...r,
    id,
    prestadorId,
    duenioId,
    mascotaId,
    servicioId,
    precioUnitario: r.precioUnitario != null ? Number(r.precioUnitario) : null,
    montoTotal: r.montoTotal != null ? Number(r.montoTotal) : null,
    comision: r.comision != null ? Number(r.comision) : null,
  };
}

function serializeResena(resena) {
  return {
    id: resena.id?.toString?.() ?? resena.id,
    reservaId: resena.reservaId?.toString?.() ?? resena.reservaId,
    emisorRol: resena.emisorRol,
    calificacion: resena.calificacion,
    comentario: resena.comentario ?? '',
    fecha: resena.fecha,
  };
}

async function createReservaController(req, res) {
  try {
    const { duenioId, prestadorId, mascotaId, servicioId, fechaServicio } = req.body || {};

    if (!duenioId || !prestadorId || !mascotaId || !servicioId) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: duenioId, prestadorId, mascotaId, servicioId',
      });
    }

    let duenioIdB, prestadorIdB, mascotaIdB, servicioIdB;
    try {
      duenioIdB = BigInt(duenioId);
      prestadorIdB = BigInt(prestadorId);
      mascotaIdB = BigInt(mascotaId);
      servicioIdB = BigInt(servicioId);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'IDs inválidos' });
    }

    const mascota = await mascotaRepo.findById(mascotaIdB);
    if (!mascota) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }
    if (mascota.duenioId !== duenioIdB) {
      return res.status(403).json({
        success: false,
        message: 'La mascota no pertenece al dueño indicado',
      });
    }

    const prestador = await prisma.prestador.findUnique({
      where: { id: prestadorIdB },
      include: {
        prestadorservicio: { where: { servicioId: servicioIdB }, include: { servicio: true } },
      },
    });
    if (!prestador) {
      return res.status(404).json({ success: false, message: 'Prestador no encontrado' });
    }
    const prestadorOfreceServicio = prestador.prestadorservicio?.length > 0;
    if (!prestadorOfreceServicio) {
      return res.status(400).json({
        success: false,
        message: 'El prestador no ofrece ese servicio',
      });
    }

    const servicio = await prisma.servicio.findUnique({ where: { id: servicioIdB } });
    if (!servicio) {
      return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    const existente = await reservaRepo.findExistingPendienteOrConfirmado(
      duenioIdB,
      prestadorIdB,
      mascotaIdB,
      servicioIdB
    );
    if (existente) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una reserva pendiente o confirmada para este prestador, mascota y servicio',
      });
    }

    const precioUnitario = servicio.precio != null ? servicio.precio : new Prisma.Decimal(0);
    const cantidad = 1;
    const subtotal = Prisma.Decimal.mul(precioUnitario, cantidad);
    const porcentajeComision = parseFloat(process.env.COMISION_PORCENTAJE || '10');
    const comision = porcentajeComision > 0
      ? Prisma.Decimal.div(Prisma.Decimal.mul(subtotal, porcentajeComision), 100)
      : new Prisma.Decimal(0);
    const montoTotal = Prisma.Decimal.add(subtotal, comision);
    const fechaServicioDate = fechaServicio
      ? new Date(fechaServicio)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const reserva = await reservaRepo.create({
      duenioId: duenioIdB,
      prestadorId: prestadorIdB,
      mascotaId: mascotaIdB,
      servicioId: servicioIdB,
      fechaServicio: fechaServicioDate,
      cantidad,
      precioUnitario,
      montoTotal,
      comision,
      estado: 'PENDIENTE_PAGO',
    });

    return res.status(201).json({
      success: true,
      reserva: serializeReserva(reserva),
    });
  } catch (err) {
    console.error('Error al crear reserva:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error al crear la reserva',
    });
  }
}

async function getReservasByDuenioController(req, res) {
  try {
    const { duenioId } = req.params;
    if (!duenioId) {
      return res.status(400).json({ success: false, message: 'Falta duenioId' });
    }
    let id;
    try {
      id = BigInt(duenioId);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'duenioId inválido' });
    }

    const reservas = await reservaRepo.findManyByDuenioId(id);

const serialized = reservas.map((r) => {
  const base = serializeReserva(r);
  const resenas = Array.isArray(r.resena) ? r.resena : [];
  const yaResenoDuenio = resenas.some((resena) => resena.emisorRol === 'DUENIO');

  const puedeResenar = (
    r.estado === 'FINALIZADO' &&
    r.confirmadoPorDuenio &&
    r.confirmadoPorPrestador &&
    !yaResenoDuenio
  );

  const prestador = r.prestador;
  const usuario = prestador?.usuario;
  const domicilio = usuario?.domicilio;
  const servicio = r.servicio || prestador?.prestadorservicio?.[0]?.servicio;
  const mascota = r.mascota;

  return {
    ...base,
    puedeResenar, 
    resenas: resenas.map(serializeResena),
    prestador: prestador && {
      id: String(prestador.id),
      usuarioId: usuario?.id != null ? String(usuario.id) : null,
      nombreCompleto: [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ') || 'Sin nombre',
      domicilio: domicilio && {
        ubicacion: [domicilio.calle, domicilio.numero, domicilio.ciudad].filter(Boolean).join(', '),
        latitude: domicilio.latitude ?? null,
        longitude: domicilio.longitude ?? null,
      },
      servicio: servicio && {
        descripcion: servicio.descripcion ?? '',
        precio: servicio.precio != null ? Number(servicio.precio) : 0,
        horarios: servicio.horarios ?? '',
        tipoMascota: servicio.tipoMascota ?? '',
        duracion: servicio.duracion ?? '',
      },
      perfil: prestador.perfil ?? '',
    },
    mascota: mascota
      ? {
          nombre: mascota.nombre ?? '',
          tipo: mascota.tipo ?? '',
          raza: mascota.raza ?? '',
        }
      : null,
  };
});


    return res.json({ success: true, reservas: serialized });
  } catch (err) {
    console.error('Error al obtener reservas del dueño:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener reservas',
    });
  }
}

async function getReservasByPrestadorController(req, res) {
  try {
    const { prestadorId } = req.params;
    if (!prestadorId) {
      return res.status(400).json({ success: false, message: 'Falta prestadorId' });
    }
    let id;
    try {
      id = BigInt(prestadorId);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'prestadorId inválido' });
    }

    const reservas = await reservaRepo.findManyByPrestadorId(id);
    const serialized = reservas.map((r) => {
      const base = serializeReserva(r);
      const resenas = Array.isArray(r.resena) ? r.resena : [];
      const yaResenoPrestador = resenas.some((resena) => resena.emisorRol === 'PRESTADOR');
      const puedeResenar = (
        r.estado === 'FINALIZADO' &&
        r.confirmadoPorDuenio &&
        r.confirmadoPorPrestador &&
        !yaResenoPrestador
      );
      const duenio = r.duenio;
      const usuario = duenio?.usuario;
      const domicilio = usuario?.domicilio;
      const mascota = r.mascota;
      const servicio = r.servicio;
      const ubicacion = domicilio
        ? [domicilio.calle, domicilio.numero, domicilio.ciudad].filter(Boolean).join(', ')
        : '';
      return {
        ...base,
        puedeResenar,
        resenas: resenas.map(serializeResena),
        duenio: duenio && {
          id: String(duenio.id),
          usuarioId: usuario?.id != null ? String(usuario.id) : null,
          nombreCompleto: [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ') || 'Sin nombre',
          descripcion: duenio.comentarios ?? '',
          domicilio: domicilio && {
            ubicacion,
            latitude: domicilio.latitude ?? null,
            longitude: domicilio.longitude ?? null,
          },
          celular: usuario?.celular ?? '',
          email: usuario?.email ?? '',
        },
        mascota: mascota
          ? {
              id: String(mascota.id),
              nombre: mascota.nombre,
              tipo: mascota.tipo,
              edad: mascota.edad != null ? mascota.edad : null,
              edadUnidad: mascota.edadUnidad ?? 'años',
              raza: mascota.raza ?? '',
              condiciones: mascota.condiciones ?? '',
              infoAdicional: mascota.infoAdicional ?? '',
            }
          : null,
        servicio: servicio
          ? {
              id: String(servicio.id),
              descripcion: servicio.descripcion ?? '',
            }
          : null,
      };
    });

    return res.json({ success: true, reservas: serialized });    
  } catch (err) {
    console.error('Error al obtener reservas del prestador:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener reservas',
    });
  }
}

module.exports = {
  createReservaController,
  getReservasByDuenioController,
  getReservasByPrestadorController,
};
