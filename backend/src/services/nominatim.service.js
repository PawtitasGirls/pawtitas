const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const NOMINATIM_TIMEOUT_MS = 30000; // 30 segundos
const NOMINATIM_MAX_RETRIES = 2;

// Headers requeridos por Nominatim
const NOMINATIM_HEADERS = {
  'User-Agent': 'Pawtitas/1.0 (contact: contacto@pawtitas-ar.com)',
  'Accept-Language': 'es-AR,es,en',
};

async function queryNominatim(params) {
  const { q, limit = 5, userLocation = null } = params;

  if (!q || q.trim().length < 3) {
    throw new Error('missing query or query too short');
  }

  let url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(q)}&limit=${limit}&addressdetails=1`;

  if (userLocation && userLocation.latitude != null && userLocation.longitude != null) {
    const { latitude, longitude } = userLocation;
    const delta = 15;
    const viewbox = [
      longitude - delta,
      latitude + delta,
      longitude + delta,
      latitude - delta,
    ].join(',');
    url += `&viewbox=${viewbox}&bounded=1`;
  }

  for (let attempt = 0; attempt < NOMINATIM_MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: NOMINATIM_HEADERS,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timer);
      if (attempt === NOMINATIM_MAX_RETRIES - 1) {
        throw new Error(`timeout: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error('timeout');
}

module.exports = {
  queryNominatim,
};
