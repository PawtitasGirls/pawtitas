import { apiUsuario } from './apiUsuario';

export async function createResena(payload) {
  return apiUsuario('/api/resenas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMisResenas({ role, userId }) {
  const params = new URLSearchParams();
  params.append('role', role);
  params.append('userId', String(userId));

  return apiUsuario(`/api/resenas/mias?${params.toString()}`, {
    method: 'GET',
  });
}
