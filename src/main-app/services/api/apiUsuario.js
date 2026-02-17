const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL;

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

export const clearAuthToken = () => {
  authToken = null;
};

export async function apiUsuario(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers,
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.detail || data.message || 'Error en el servidor');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function updateUserProfile(userId, payload) {
  return apiUsuario(`/api/perfil/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function getUserProfile(userId, role) {
  const roleParam = role ? `?role=${encodeURIComponent(role)}` : '';
  return apiUsuario(`/api/perfil/${userId}${roleParam}`, {
    method: 'GET',
  });
}

export async function getPrestadores() {
  return apiUsuario('/api/admin/prestadores', { method: 'GET' });
}

export async function updatePrestadorEstado(usuarioId, { estado, motivoRechazo }) {
  return apiUsuario(`/api/admin/prestadores/${usuarioId}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado, motivoRechazo }),
  });
}

export async function getPrestadoresPorPerfil(perfil, ciudad = null) {
  const params = new URLSearchParams();
  if (perfil) params.append('perfil', perfil);
  if (ciudad) params.append('ciudad', ciudad);
  
  const queryString = params.toString();
  const url = `/api/prestadores${queryString ? `?${queryString}` : ''}`;
  
  return apiUsuario(url, { method: 'GET' });
}

export async function getPrestadorAttachments(prestadorId) {
  return apiUsuario(`/api/prestadores/${prestadorId}/attachments`, { method: 'GET' });
}

