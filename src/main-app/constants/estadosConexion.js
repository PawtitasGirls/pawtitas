// Estados para conexiones entre usuarios y prestadores de servicios
export const ESTADOS_CONEXION = {
  PAGO_CONFIRMADO: 'confirmado',
  PAGO_RETENIDO: 'confirmado', // alias para escrow
  PENDIENTE_DE_PAGO: 'pendiente',
  SOLICITUD_RECHAZADA: 'rechazado',
  SERVICIO_FINALIZADO: 'finalizado',
  PAGO_LIBERADO: 'pago_liberado',
};

export const RESERVA_ESTADO_A_CONEXION = {
  PENDIENTE_PAGO: ESTADOS_CONEXION.PENDIENTE_DE_PAGO,
  PAGADO: ESTADOS_CONEXION.PAGO_CONFIRMADO,
  EN_PROGRESO: ESTADOS_CONEXION.PAGO_CONFIRMADO,
  FINALIZADO: ESTADOS_CONEXION.SERVICIO_FINALIZADO,
  CANCELADO: ESTADOS_CONEXION.SOLICITUD_RECHAZADA,
};

export function mapReservaEstadoToConexion(reservaEstado, pagoEstado) {
  if (!reservaEstado) return ESTADOS_CONEXION.PENDIENTE_DE_PAGO;
  if (reservaEstado === 'FINALIZADO' && pagoEstado === 'LIBERADO') {
    return ESTADOS_CONEXION.PAGO_LIBERADO;
  }
  const key = String(reservaEstado).toUpperCase().replace(/-/g, '_');
  return RESERVA_ESTADO_A_CONEXION[key] ?? ESTADOS_CONEXION.PENDIENTE_DE_PAGO;
}

export const ESTADOS_CONEXION_CONFIG = {
  [ESTADOS_CONEXION.PAGO_CONFIRMADO]: {
    label: 'Pago retenido',
    icon: 'lock-closed',
    colorType: 'info',
    description: 'Pago retenido hasta finalizar servicio',
  },
  [ESTADOS_CONEXION.PENDIENTE_DE_PAGO]: {
    label: 'Pendiente',
    icon: 'time',
    colorType: 'warning',
    description: 'Esperando confirmación de pago',
  },
  [ESTADOS_CONEXION.SOLICITUD_RECHAZADA]: {
    label: 'Rechazado',
    icon: 'close-circle',
    colorType: 'error',
    description: 'Solicitud rechazada',
  },
  [ESTADOS_CONEXION.SERVICIO_FINALIZADO]: {
    label: 'Finalizado',
    icon: 'checkmark-done-circle',
    colorType: 'success',
    description: 'Servicio finalizado',
  },
  [ESTADOS_CONEXION.PAGO_LIBERADO]: {
    label: 'Pago liberado',
    icon: 'checkmark-circle',
    colorType: 'success',
    description: 'Pago transferido al prestador',
  },
};