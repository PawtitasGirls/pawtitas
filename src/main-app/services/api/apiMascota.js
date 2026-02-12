import { apiUsuario } from './apiUsuario';

export async function getMascotasByDuenio(duenioId) {
  return apiUsuario(`/api/mascotas/duenio/${duenioId}`, {
    method: 'GET',
  });
}

export async function createMascota(mascotaData) {
  return apiUsuario('/api/mascotas', {
    method: 'POST',
    body: JSON.stringify(mascotaData),
  });
}

export async function updateMascota(mascotaId, mascotaData) {
  return apiUsuario(`/api/mascotas/${mascotaId}`, {
    method: 'PUT',
    body: JSON.stringify(mascotaData),
  });
}

export async function deleteMascota(mascotaId) {
  return apiUsuario(`/api/mascotas/${mascotaId}`, {
    method: 'DELETE',
  });
}
