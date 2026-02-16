import { apiUsuario } from './api/apiUsuario';

export async function registrarUsuario(form, perfil, especialidad) {
  const basePayload = {
    ...form,
    perfil,
    especialidad,
    fechaNacimiento: form.fechaNacimiento?.toISOString?.(),
  };

  const isPrestador = perfil === 'prestador';
  const hasDocumentos = !!form.documentosFile?.uri;
  const hasCertificados = !!form.certificadosFile?.uri;

  // Para prestadores con documentos adjuntos usamos FormData (multipart/form-data)
  if (isPrestador && (hasDocumentos || hasCertificados)) {
    const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;
    const url = `${API_BASE}/api/registro`;

    const formData = new FormData();

    Object.entries(basePayload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'documentosFile' || key === 'certificadosFile') return;
      formData.append(key, String(value));
    });

    const appendFile = (fieldName, file) => {
      if (!file?.uri) return;
      const name = file.name || 'documento.pdf';
      const type = file.mimeType || 'application/pdf';
      formData.append(fieldName, { uri: file.uri, name, type });
    };

    appendFile('documentosFile', form.documentosFile);
    appendFile('certificadosFile', form.certificadosFile);

    const response = await fetch(url, {
      method: 'POST',
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

  // Fallback: comportamiento anterior (JSON) para dueños o prestadores sin archivos
  const payload = {
    ...basePayload,
    documentosFile: form.documentosFile ? { name: form.documentosFile.name } : null,
    certificadosFile: form.certificadosFile ? { name: form.certificadosFile.name } : null,
  };

  return apiUsuario('/api/registro', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

