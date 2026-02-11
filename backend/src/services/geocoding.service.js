// Geocoding con Nominatim (OpenStreetMap)

const prisma = require('../config/prisma');
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'Pawtitas-Backend';

function buildParams(query, countrycodes = 'ar') {
  const params = { q: query, format: 'json', limit: 1 };
  if (countrycodes) params.countrycodes = countrycodes;
  return new URLSearchParams(params);
}

async function fetchCoords(query, countrycodes) {
  const response = await fetch(`${NOMINATIM_API}?${buildParams(query, countrycodes)}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!data?.length) return null;
  const { lat, lon } = data[0];
  return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
}

async function geocodeAddress(address) {
  const trimmed = address?.trim();
  if (!trimmed || trimmed === 'No especificado') return null;

  try {
    const withCountry = trimmed.toLowerCase().includes('argentina')
      ? trimmed
      : `${trimmed}, Argentina`;

    let coords = await fetchCoords(withCountry, 'ar');
    if (!coords) {
      await new Promise((r) => setTimeout(r, 300));
      coords = await fetchCoords(withCountry, null);
    }
    return coords;
  } catch {
    return null;
  }
}

function buildAddressString(domicilio) {
  if (!domicilio) return '';
  const { calle, numero, ciudad } = domicilio;
  const parts = [calle, numero, ciudad].filter(Boolean);
  return parts.join(', ');
}

async function getCoordinatesForDomicilio(domicilio) {
  const address = buildAddressString(domicilio);
  if (!address) return null;
  return geocodeAddress(address);
}

async function updateDomicilioWithCoordinates(domicilioId, domicilioData) {
  const coords = await getCoordinatesForDomicilio(domicilioData);
  if (!coords) return;
  await prisma.domicilio.update({
    where: { id: domicilioId },
    data: {
      latitude: coords.latitude,
      longitude: coords.longitude,
    },
  });
}

module.exports = {
  geocodeAddress,
  buildAddressString,
  getCoordinatesForDomicilio,
  updateDomicilioWithCoordinates,
};
