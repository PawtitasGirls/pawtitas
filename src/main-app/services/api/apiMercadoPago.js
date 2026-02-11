import { apiUsuario } from './apiUsuario';

export async function createPaymentPreference({ reservaId, userEmail }) {
  return apiUsuario('/api/mercadopago/create-preference', {
    method: 'POST',
    body: JSON.stringify({ reservaId, userEmail }),
  });
}

export async function confirmarFinalizacionServicio({ reservaId, userId, esProveedor }) {
  return apiUsuario('/api/mercadopago/confirmar-finalizacion', {
    method: 'POST',
    body: JSON.stringify({ reservaId, userId, esProveedor }),
  });
}
