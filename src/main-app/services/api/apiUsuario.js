const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL;

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

export const clearAuthToken = () => {
  authToken = null;
};

export const getAuthToken = () => authToken;

export async function apiUsuario(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

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
  const avatarFile = payload?.avatarFile || null;
  if (avatarFile?.uri) {
    const formData = new FormData();
    const payloadWithoutAvatar = { ...payload };
    delete payloadWithoutAvatar.avatarFile;

    Object.entries(payloadWithoutAvatar).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
        return;
      }
      formData.append(key, String(value));
    });

    const fileName = avatarFile.fileName || avatarFile.name || `avatar-${Date.now()}.jpg`;
    const mimeType = avatarFile.mimeType || avatarFile.type || 'image/jpeg';
    formData.append('avatar', {
      uri: avatarFile.uri,
      name: fileName,
      type: mimeType,
    });

    return apiUsuario(`/api/perfil/${userId}`, {
      method: 'PUT',
      body: formData,
    });
  }

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

