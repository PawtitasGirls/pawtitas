import { apiUsuario, getAuthToken } from './apiUsuario';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || '';

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

export function buildMascotaPhotoUrl(mascotaId, cacheBust = false) {
  if (!mascotaId) return null;
  const baseUrl = `${API_BASE}/api/mascotas/${mascotaId}/photo`;
  return cacheBust ? `${baseUrl}?t=${Date.now()}` : baseUrl;
}

export async function uploadMascotaPhoto(mascotaId, formData) {
  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE}/api/mascotas/${mascotaId}/photo`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || data.message || 'Error en el servidor');
    error.status = response.status;
    throw error;
  }

  return data;
}
