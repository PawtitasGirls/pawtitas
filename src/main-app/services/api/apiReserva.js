import { apiUsuario } from './apiUsuario';

export async function createReserva(payload) {
  return apiUsuario('/api/reservas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getReservasByDuenio(duenioId) {
  return apiUsuario(`/api/reservas/duenio/${duenioId}`, { method: 'GET' });
}

export async function getReservasByPrestador(prestadorId) {
  return apiUsuario(`/api/reservas/prestador/${prestadorId}`, { method: 'GET' });
}

export async function cancelarReserva(reservaId) {
  return apiUsuario(`/api/reservas/${reservaId}/cancelar`, { method: 'PATCH' });
}
