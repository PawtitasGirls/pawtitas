// Estados para conexiones entre usuarios y prestadores de servicios
export const ESTADOS_CONEXION = {
  PAGO_CONFIRMADO: 'confirmado',
  PAGO_RETENIDO: 'confirmado',
  PENDIENTE_DE_PAGO: 'pendiente',
  SOLICITUD_RECHAZADA: 'rechazado',
  SERVICIO_FINALIZADO: 'finalizado',
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
  if (reservaEstado === 'FINALIZADO') {
    return ESTADOS_CONEXION.SERVICIO_FINALIZADO;
  }
  const key = String(reservaEstado).toUpperCase().replace(/-/g, '_');
  return RESERVA_ESTADO_A_CONEXION[key] ?? ESTADOS_CONEXION.PENDIENTE_DE_PAGO;
}

export const ESTADOS_CONEXION_CONFIG = {
  [ESTADOS_CONEXION.PAGO_CONFIRMADO]: {
    label: 'Pago confirmado',
    icon: 'checkmark-circle',
    colorType: 'info',
    description: 'Pago confirmado',
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
};