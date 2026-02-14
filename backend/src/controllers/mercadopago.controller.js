const crypto = require('crypto');
const prisma = require('../config/prisma');
const pagoRepo = require('../repositories/pago.repo');
const { preference: mpPreference, payment: mpPayment } = require('../config/mercadopago');

function validateWebhookSignature(req) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;

  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];

  if (!xSignature) return false;

  let ts = null;
  let v1 = null;
  for (const part of xSignature.split(',')) {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    if (key === 'v1') v1 = value;
  }

  if (!ts || !v1) return false;

  const dataId = req.query?.['data.id'] ?? req.body?.data?.id;
  if (!dataId) return false;

  const manifestParts = [`id:${dataId}`];
  if (xRequestId) manifestParts.push(`request-id:${xRequestId}`);
  manifestParts.push(`ts:${ts}`);
  const manifest = manifestParts.join(';') + ';';

  const hash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  if (hash.length !== v1.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(v1, 'hex'));
  } catch {
    return false;
  }
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const APP_URL = process.env.APP_URL || 'pawtitas://';

function buildPreferenceBody(reserva, userEmail) {
  const montoTotal = Number(reserva.montoTotal);
  const externalRef = `pawtitas-${reserva.id}-${Date.now()}`;
  return {
    items: [
      {
        title: [reserva.prestador?.usuario?.nombre, reserva.prestador?.usuario?.apellido].filter(Boolean).join(' ') || 'Servicio Pawtitas',
        description: `Reserva #${reserva.id}`,
        quantity: 1,
        unit_price: montoTotal,
        currency_id: 'ARS',
      },
    ],
    payer: { email: userEmail || reserva.duenio?.usuario?.email || 'test@test.com' },
    back_urls: {
      success: `${APP_URL}payment/success?reserva_id=${reserva.id}`,
      failure: `${APP_URL}payment/failure?reserva_id=${reserva.id}`,
      pending: `${APP_URL}payment/pending?reserva_id=${reserva.id}`,
    },
    auto_return: 'approved',
    external_reference: externalRef,
    notification_url: `${BACKEND_URL}/api/mercadopago/webhook`, // Implementar URL backend para webhook
    metadata: { reserva_id: reserva.id.toString() },
  };
}

async function createPreferenceController(req, res) {
  try {
    const { reservaId, userEmail } = req.body || {};

    if (!reservaId) {
      return res.status(400).json({ success: false, message: 'Falta reservaId' });
    }

    const reservaIdB = BigInt(reservaId);
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaIdB },
      include: {
        prestador: { include: { usuario: true } },
        duenio: { include: { usuario: true } },
        servicio: true,
        mascota: true,
        pago: true,
      },
    });

    if (!reserva) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }

    if (reserva.estado !== 'PENDIENTE_PAGO') {
      return res.status(400).json({
        success: false,
        message: 'La reserva no está pendiente de pago',
      });
    }

    const pagoExistente = reserva.pago;

    if (pagoExistente) {
      if (pagoExistente.estadoPago === 'PAGADO' || pagoExistente.estadoPago === 'LIBERADO') {
        return res.status(400).json({
          success: false,
          message: 'Esta reserva ya fue pagada',
        });
      }

      if (pagoExistente.estadoPago === 'PENDIENTE') {
        const preference = buildPreferenceBody(reserva, userEmail);
        const mpRes = await mpPreference.create({ body: preference });

        await pagoRepo.updateByReservaId(reservaIdB, {
          linkPago: mpRes.init_point,
          mpPreferenceId: mpRes.id,
        });

        return res.json({
          success: true,
          initPoint: mpRes.init_point,
          sandboxInitPoint: mpRes.sandbox_init_point,
          preferenceId: mpRes.id,
        });
      }
    }

    const preference = buildPreferenceBody(reserva, userEmail);
    const mpRes = await mpPreference.create({ body: preference });

    const pago = await pagoRepo.create({
      reservaId: reservaIdB,
      linkPago: mpRes.init_point,
      monto: reserva.montoTotal,
      moneda: 'ARS',
      estadoPago: 'PENDIENTE',
      mpPreferenceId: mpRes.id,
    });

    await prisma.reserva.update({
      where: { id: reservaIdB },
      data: { pagoId: pago.id },
    });

    return res.json({
      success: true,
      initPoint: mpRes.init_point,
      sandboxInitPoint: mpRes.sandbox_init_point,
      preferenceId: mpRes.id,
    });
  } catch (err) {
    console.error('createPreference error:', err);
    const message = err.cause?.message || err.message || 'Error al crear preferencia';
    return res.status(500).json({
      success: false,
      message,
    });
  }
}

async function webhookController(req, res) {
  try {
    if (!validateWebhookSignature(req)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { type, data } = req.body || {};

    if (type !== 'payment') {
      return res.status(200).json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId) return res.status(200).json({ received: true });

    const mp = await mpPayment.get({ id: paymentId });
    const externalRef = mp.external_reference || '';
    const reservaIdStr = mp.metadata?.reserva_id || (externalRef.match(/^pawtitas-(\d+)-/) || [])[1];

    let pago = null;
    if (mp.preference_id) {
      pago = await pagoRepo.findByMpPreferenceId(mp.preference_id);
    }
    if (!pago && reservaIdStr) {
      pago = await prisma.pago.findFirst({
        where: { reservaId: BigInt(reservaIdStr) },
        include: { reserva: true },
      });
    }

    if (pago) {
      await pagoRepo.updateByReservaId(pago.reservaId, {
        mpPaymentId: String(paymentId),
        estadoPago: mp.status === 'approved' ? 'PAGADO' : 'PENDIENTE',
        fechaPago: mp.status === 'approved' ? new Date() : null,
      });
      await prisma.reserva.update({
        where: { id: pago.reservaId },
        data: { estado: mp.status === 'approved' ? 'PAGADO' : 'PENDIENTE_PAGO' },
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('webhook error:', err);
    return res.status(200).json({ received: true });
  }
}

async function confirmarFinalizacionController(req, res) {
  try {
    const { reservaId, userId, esProveedor } = req.body || {};

    if (!reservaId || userId === undefined) {
      return res.status(400).json({ success: false, message: 'Faltan reservaId o userId' });
    }

    const reservaIdB = BigInt(reservaId);
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaIdB },
      include: { pago: true, duenio: true, prestador: true },
    });

    if (!reserva) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }

    if (reserva.estado !== 'PAGADO' && reserva.estado !== 'EN_PROGRESO') {
      return res.status(400).json({
        success: false,
        message: 'La reserva no está en estado pagado o en progreso',
      });
    }

    const duenioId = String(reserva.duenioId);
    const prestadorId = String(reserva.prestadorId);

    if (esProveedor) {
      if (String(userId) !== prestadorId && String(userId) !== reserva.prestador.usuarioId?.toString()) {
        return res.status(403).json({ success: false, message: 'No autorizado' });
      }
      await prisma.reserva.update({
        where: { id: reservaIdB },
        data: { confirmadoPorPrestador: true },
      });
    } else {
      if (String(userId) !== duenioId && String(userId) !== reserva.duenio.usuarioId?.toString()) {
        return res.status(403).json({ success: false, message: 'No autorizado' });
      }
      await prisma.reserva.update({
        where: { id: reservaIdB },
        data: { confirmadoPorDuenio: true },
      });
    }

    const actual = await prisma.reserva.findUnique({ where: { id: reservaIdB } });
    const ambosConfirmaron = actual.confirmadoPorDuenio && actual.confirmadoPorPrestador;

    if (ambosConfirmaron) {
      await prisma.reserva.update({
        where: { id: reservaIdB },
        data: { estado: 'FINALIZADO', efectuado: true },
      });
      if (reserva.pago) {
        await prisma.pago.update({
          where: { reservaId: reservaIdB },
          data: { estadoPago: 'LIBERADO' },
        });
      }

      return res.json({
        success: true,
        pagoLiberado: true,
        estadoReserva: 'FINALIZADO',
        message: 'Servicio finalizado. El pago ha sido liberado.',
      });
    }

    return res.json({
      success: true,
      pagoLiberado: false,
      message: 'Confirmación registrada. Esperando la otra parte.',
    });
  } catch (err) {
    console.error('confirmarFinalizacion error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error al confirmar',
    });
  }
}

module.exports = {
  createPreferenceController,
  webhookController,
  confirmarFinalizacionController,
};