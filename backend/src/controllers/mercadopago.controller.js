const crypto = require('crypto');
const prisma = require('../config/prisma');
const pagoRepo = require('../repositories/pago.repo');
const { preference: mpPreference, payment: mpPayment, merchantOrder: mpMerchantOrder } = require('../config/mercadopago');

function extractWebhookDataId(req) {
  const queryId = req.query?.id ?? req.query?.['data.id'];
  const bodyId = req.body?.data?.id ?? req.body?.id;
  if (queryId || bodyId) return String(queryId ?? bodyId);

  const resource = req.body?.resource;
  if (typeof resource === 'string') {
    const match = resource.match(/\/(\d+)(?:\?.*)?$/);
    if (match?.[1]) return match[1];
  }

  return null;
}

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

  const dataId = extractWebhookDataId(req);
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
const APP_URL = process.env.APP_URL;

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
    payer: {},
    back_urls: {
      success: `${APP_URL}/payment/success?reserva_id=${reserva.id}`,
      failure: `${APP_URL}/payment/failure?reserva_id=${reserva.id}`,
      pending: `${APP_URL}/payment/pending?reserva_id=${reserva.id}`,
    },
    auto_return: 'approved',
    external_reference: externalRef,
    notification_url: `${BACKEND_URL}/api/mercadopago/webhook`,
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

    if (!reserva.prestador?.mpUserId) {
      return res.status(400).json({
        success: false,
        message: 'No es posible completar el pago porque el prestador aún no vinculó su cuenta de Mercado Pago. Podés contactarlo o elegir otro prestador.',
      });
    }

    if (reserva.estado !== 'PENDIENTE_PAGO' && reserva.estado !== 'FINALIZADO') {
      return res.status(400).json({
        success: false,
        message: 'La reserva no está pendiente de pago o finalizada',
      });
    }

  const montoTotal = Number(reserva.montoTotal ?? 0);

  if (!Number.isFinite(montoTotal) || montoTotal <= 0) {
    return res.status(400).json({
      success: false,
      message: 'No podemos procesar el pago porque el monto de la reserva es $0. Revisá el detalle de la reserva o contactá al prestador si creés que es un error.',
    });
  }

    const pagoExistente = reserva.pago;

    if (pagoExistente) {
      if (pagoExistente.estadoPago === 'PAGADO') {
        return res.status(400).json({
          success: false,
          message: 'Esta reserva ya fue pagada',
        });
      }

      if (pagoExistente.estadoPago === 'PENDIENTE') {
        const preference = buildPreferenceBody(reserva, userEmail);

        console.log('Enviando preferencia a MercadoPago:', {
          reservaId: reserva.id.toString(),
          notification_url: preference.notification_url,
          external_reference: preference.external_reference,
        });

        const mpRes = await mpPreference.create({ body: preference });

        console.log('Preferencia creada:', {
          preferenceId: mpRes.id,
          sandbox_init_point: mpRes.sandbox_init_point,
        });

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

    console.log('Enviando preferencia a MercadoPago (nuevo pago):', {
      reservaId: reserva.id.toString(),
      notification_url: preference.notification_url,
      external_reference: preference.external_reference,
    });

    const mpRes = await mpPreference.create({ body: preference });
    
    console.log('Preferencia creada:', {
      preferenceId: mpRes.id,
      init_point: mpRes.init_point,
      sandbox_init_point: mpRes.sandbox_init_point,
    });

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
    // Log del request antes de procesarlo
    console.log('Request recibido:', {
      method: req.method,
      url: req.url,
      query: req.query,
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        'x-signature': req.headers['x-signature'],
        'x-request-id': req.headers['x-request-id'],
      },
    });

    if (!validateWebhookSignature(req)) {
      console.log('[WEBHOOK] Firma inválida, procesando de todas formas');
    }

    // Intentar obtener datos desde body o query
    const type = req.body?.type || req.body?.topic || req.query?.topic;
    const dataId = extractWebhookDataId(req);
    const action = req.body?.action;

    console.log('[WEBHOOK] Datos extraídos:', { type, action, dataId });

    if (type === 'merchant_order' || type === 'topic_merchant_order_wh') {
      console.log(`[WEBHOOK] Procesando merchant_order ${dataId}...`);
      
      if (!dataId) {
        console.log('[WEBHOOK] No se encontró merchant_order ID');
        return res.status(200).json({ received: true });
      }

      const merchantOrder = await mpMerchantOrder.get({ merchantOrderId: dataId });
      
      console.log('[WEBHOOK] Merchant Order obtenido:', {
        id: merchantOrder.id,
        status: merchantOrder.status,
        payments: merchantOrder.payments?.map(p => ({ id: p.id, status: p.status })),
      });

      // Extraer el payment ID del merchant order
      const payment = merchantOrder.payments?.find(p => p.status === 'approved');
      if (!payment) {
        console.log('[WEBHOOK] No hay pagos aprobados en el merchant_order');
        return res.status(200).json({ received: true });
      }

      // Procesar el payment usando su ID
      const paymentId = payment.id;
      console.log(`[WEBHOOK] Obteniendo payment ${paymentId} del merchant_order...`);
      
      const mp = await mpPayment.get({ id: paymentId });
      
      console.log('[WEBHOOK] Payment obtenido:', {
        id: mp.id,
        status: mp.status,
        preference_id: mp.preference_id,
        external_reference: mp.external_reference,
        metadata: mp.metadata,
      });

      // Continuar con el procesamiento normal del payment
      return await processPayment(mp, res);
    }

    // Manejar payment directo
    if (type !== 'payment') {
      console.log(`[WEBHOOK] Tipo "${type}" ignorado (solo procesamos "payment", "merchant_order" y "topic_merchant_order_wh")`);
      return res.status(200).json({ received: true });
    }

    if (!dataId) {
      console.log('[WEBHOOK] No se encontró payment ID');
      return res.status(200).json({ received: true });
    }

    console.log(`[WEBHOOK] Obteniendo payment ${dataId} de MercadoPago...`);
    
    const mp = await mpPayment.get({ id: dataId });
    
    console.log('[WEBHOOK] Payment obtenido:', {
      id: mp.id,
      status: mp.status,
      preference_id: mp.preference_id,
      external_reference: mp.external_reference,
      metadata: mp.metadata,
    });

    return await processPayment(mp, res);
  } catch (err) {
    console.error('[WEBHOOK] Error:', {
      message: err.message,
      status: err.status,
      cause: err.cause,
      stack: err.stack,
    });
    return res.status(200).json({ received: true });
  }
}

async function processPayment(mp, res) {
  try {
    const externalRef = mp.external_reference || '';
    const reservaIdStr = mp.metadata?.reserva_id || (externalRef.match(/^pawtitas-(\d+)-/) || [])[1];

    if (!reservaIdStr) {
      console.warn('[WEBHOOK] Pago no procesado: no se encontró reservaId', {
        paymentId: mp.id,
        preferenceId: mp.preference_id,
        externalRef,
        metadata: mp.metadata,
      });
      return res.status(200).json({ received: true });
    }

    console.log(`[WEBHOOK] Buscando pago en BD para reserva ${reservaIdStr}...`);

    let pago = await prisma.pago.findFirst({
      where: { reservaId: BigInt(reservaIdStr) },
      include: { reserva: true },
    });
    
    if (!pago && mp.preference_id) {
      console.log(`[WEBHOOK] No encontrado por reservaId, buscando por preferenceId ${mp.preference_id}...`);
      pago = await pagoRepo.findByMpPreferenceId(mp.preference_id);
    }

    if (pago) {
      console.log(`[WEBHOOK] Pago encontrado. Actualizando...`, {
        reservaId: pago.reservaId.toString(),
        estadoAnterior: pago.estadoPago,
        estadoNuevo: mp.status === 'approved' ? 'PAGADO' : 'PENDIENTE',
        mpStatus: mp.status,
      });

      await pagoRepo.updateByReservaId(pago.reservaId, {
        mpPaymentId: String(mp.id),
        estadoPago: mp.status === 'approved' ? 'PAGADO' : 'PENDIENTE',
        fechaPago: mp.status === 'approved' ? new Date() : null,
      });
      
      await prisma.reserva.update({
        where: { id: pago.reservaId },
        data: { estado: mp.status === 'approved' ? 'PAGADO' : 'PENDIENTE_PAGO' },
      });

      console.log(`[WEBHOOK] Pago actualizado exitosamente para reserva ${reservaIdStr}`);
    } else {
      console.warn('[WEBHOOK] Pago no vinculable, requiere revisión manual', {
        paymentId: mp.id,
        preferenceId: mp.preference_id,
        externalRef,
        reservaIdStr: reservaIdStr || '(no disponible)',
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[PROCESSpayment] Error:', {
      message: err.message,
      status: err.status,
      cause: err.cause,
      stack: err.stack,
    });
    return res.status(200).json({ received: true });
  }
}

async function transferirAlPrestador({ reservaId, montoTotal, mpUserIdPrestador }) {
  const comisionPorcentaje = Number(process.env.COMISION_PORCENTAJE || 12);
  const montoPrestador = Math.round(montoTotal * (1 - comisionPorcentaje / 100) * 100) / 100;

  console.log(`Iniciando transferencia para reserva ${reservaId}:`, {
    montoTotal,
    comisionPorcentaje,
    montoPrestador,
    destinatario: mpUserIdPrestador,
  });

  const response = await fetch('https://api.mercadopago.com/v1/account/bank_transfers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      amount: montoPrestador,
      origin_account: { type: 'current', user_id: process.env.MERCADOPAGO_USER_ID },
      destination_account: { type: 'current', user_id: String(mpUserIdPrestador) },
      description: `Liberación de pago reserva #${reservaId}`,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`[TRANSFERENCIA] Error al transferir a prestador (reserva ${reservaId}):`, data);
    return;
  }

  console.log(`[TRANSFERENCIA] Transferencia exitosa para reserva ${reservaId}:`, {
    monto: montoPrestador,
    destinatario: mpUserIdPrestador,
    transferId: data.id,
  });
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

    const ESTADO_RESPUESTA = {
      FINALIZADO: { status: 200, body: { success: true, pagoLiberado: false, message: 'La reserva ya estaba finalizada.' } },
      PENDIENTE_PAGO: { status: 400, body: { success: false, message: 'El pago aún se está procesando. Esperá unos segundos y volvé a intentar.' } },
    };
    const ESTADOS_VALIDOS = new Set(['PAGADO', 'EN_PROGRESO']);

    if (ESTADO_RESPUESTA[reserva.estado]) {
      const { status, body } = ESTADO_RESPUESTA[reserva.estado];
      return res.status(status).json(body);
    }
    if (!ESTADOS_VALIDOS.has(reserva.estado)) {
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

        const prestador = await prisma.prestador.findUnique({
          where: { id: reserva.prestadorId },
          select: { mpUserId: true },
        });

        if (prestador?.mpUserId) {
          await transferirAlPrestador({
            reservaId,
            montoTotal: Number(reserva.pago.monto),
            mpUserIdPrestador: prestador.mpUserId,
          });
        }
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

// OAuth
const MP_APP_ID = process.env.MERCADOPAGO_APP_ID;
const MP_CLIENT_SECRET = process.env.MERCADOPAGO_CLIENT_SECRET;
const MP_OAUTH_REDIRECT = `${BACKEND_URL}/api/mercadopago/oauth-callback`;

async function oauthUrlController(req, res) {
  try {
    const { prestadorId } = req.query;
    if (!prestadorId) {
      return res.status(400).json({ success: false, message: 'Falta prestadorId' });
    }
    const url =
      `https://auth.mercadopago.com.ar/authorization` +
      `?client_id=${MP_APP_ID}` +
      `&response_type=code` +
      `&platform_id=mp` +
      `&state=${prestadorId}` +
      `&redirect_uri=${encodeURIComponent(MP_OAUTH_REDIRECT)}`;

    return res.json({ success: true, url });
  } catch (err) {
    console.error('oauthUrl error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function oauthCallbackController(req, res) {
  try {
    const { code, state: prestadorId } = req.query;
    if (!code || !prestadorId) {
      return res.status(400).send('Faltan parámetros code o state');
    }

    const body = new URLSearchParams({
      client_id: MP_APP_ID,
      client_secret: MP_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: MP_OAUTH_REDIRECT,
    });

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      console.error('OAuth MP error:', data);
      return res.status(400).send('Error al obtener tokens de MercadoPago');
    }

    await prisma.prestador.update({
      where: { id: BigInt(prestadorId) },
      data: {
        mpAccessToken: data.access_token,
        mpRefreshToken: data.refresh_token || null,
        mpUserId: String(data.user_id),
        mpConnectedAt: new Date(),
      },
    });

    console.log(`[OAUTH] Prestador ${prestadorId} conectó su cuenta MP (userId: ${data.user_id})`);

    // Redirigir de vuelta a la app
    return res.redirect(`${APP_URL}oauth/success`);
  } catch (err) {
    console.error('oauthCallback error:', err);
    return res.status(500).send('Error interno al procesar OAuth');
  }
}

async function oauthStatusController(req, res) {
  try {
    const { prestadorId } = req.query;
    if (!prestadorId) {
      return res.status(400).json({ success: false, message: 'Falta prestadorId' });
    }

    const prestador = await prisma.prestador.findUnique({
      where: { id: BigInt(prestadorId) },
      select: { mpUserId: true, mpConnectedAt: true },
    });

    if (!prestador) {
      return res.status(404).json({ success: false, message: 'Prestador no encontrado' });
    }

    return res.json({
      success: true,
      connected: !!prestador.mpUserId,
      mpUserId: prestador.mpUserId || null,
      mpConnectedAt: prestador.mpConnectedAt || null,
    });
  } catch (err) {
    console.error('oauthStatus error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function oauthDisconnectController(req, res) {
  try {
    const { prestadorId } = req.body;
    if (!prestadorId) {
      return res.status(400).json({ success: false, message: 'Falta prestadorId' });
    }

    await prisma.prestador.update({
      where: { id: BigInt(prestadorId) },
      data: { mpAccessToken: null, mpRefreshToken: null, mpUserId: null, mpConnectedAt: null },
    });

    return res.json({ success: true, message: 'Cuenta MP desconectada' });
  } catch (err) {
    console.error('oauthDisconnect error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createPreferenceController,
  webhookController,
  confirmarFinalizacionController,
  oauthUrlController,
  oauthCallbackController,
  oauthStatusController,
  oauthDisconnectController,
};