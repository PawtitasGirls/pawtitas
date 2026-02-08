// Estados para conexiones entre usuarios y prestadores de servicios
export const ESTADOS_CONEXION = {
  PAGO_CONFIRMADO: 'confirmado',
  PENDIENTE_DE_PAGO: 'pendiente',
  SOLICITUD_RECHAZADA: 'rechazado',
  SERVICIO_FINALIZADO: 'finalizado'
};

export const RESERVA_ESTADO_A_CONEXION = {
  PENDIENTE_PAGO: ESTADOS_CONEXION.PENDIENTE_DE_PAGO,
  PAGADO: ESTADOS_CONEXION.PAGO_CONFIRMADO,
  EN_PROGRESO: ESTADOS_CONEXION.PAGO_CONFIRMADO,
  FINALIZADO: ESTADOS_CONEXION.SERVICIO_FINALIZADO,
  CANCELADO: ESTADOS_CONEXION.SOLICITUD_RECHAZADA,
};

export function mapReservaEstadoToConexion(reservaEstado) {
  if (!reservaEstado) return ESTADOS_CONEXION.PENDIENTE_DE_PAGO;
  const key = String(reservaEstado).toUpperCase().replace(/-/g, '_');
  return RESERVA_ESTADO_A_CONEXION[key] ?? ESTADOS_CONEXION.PENDIENTE_DE_PAGO;
}

export const ESTADOS_CONEXION_CONFIG = {
  [ESTADOS_CONEXION.PAGO_CONFIRMADO]: {
    label: 'Confirmado',
    icon: 'checkmark-circle',
    colorType: 'success'
  },
  [ESTADOS_CONEXION.PENDIENTE_DE_PAGO]: {
    label: 'Pendiente',
    icon: 'time',
    colorType: 'warning'
  },
  [ESTADOS_CONEXION.SOLICITUD_RECHAZADA]: {
    label: 'Rechazado',
    icon: 'close-circle',
    colorType: 'error'
  },
  [ESTADOS_CONEXION.SERVICIO_FINALIZADO]: {
    label: 'Finalizado',
    icon: 'checkmark-done-circle',
    colorType: 'success'
  }
};