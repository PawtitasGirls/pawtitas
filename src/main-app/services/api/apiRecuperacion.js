const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

async function request(path, body) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.message || 'Error en el servidor');
    err.status = response.status;
    throw err;
  }
  return data;
}

export async function solicitarCodigoRecuperacion(email) {
  return request('/api/recuperar-contrasena/solicitar', { email });
}

export async function verificarCodigoRecuperacion(email, codigo) {
  return request('/api/recuperar-contrasena/verificar-codigo', { email, codigo });
}

export async function actualizarClaveRecuperacion(email, codigo, nuevaClave) {
  return request('/api/recuperar-contrasena/nueva-clave', { email, codigo, nuevaClave });
}
