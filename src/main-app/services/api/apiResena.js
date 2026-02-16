import { apiUsuario } from './apiUsuario';

export async function createResena(payload) {
  return apiUsuario('/api/resenas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
