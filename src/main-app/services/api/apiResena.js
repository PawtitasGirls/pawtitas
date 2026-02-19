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

export async function getResenasRecibidas({ targetRole, targetId }) {
  const params = new URLSearchParams();
  params.append('targetRole', targetRole);
  params.append('targetId', String(targetId));

  return apiUsuario(`/api/resenas/recibidas?${params.toString()}`, {
    method: 'GET',
  });
}
