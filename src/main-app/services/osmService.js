// Servicios de OpenStreetMap para mapas, búsqueda y POIs
// Nominatim: geocoding, Overpass: POIs, OpenRouteService: rutas

import { Platform } from 'react-native';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
// Servidores Overpass alternativos (fallback)
// Android usa un orden diferente para mejor rendimiento
const ORS_BASE = 'https://api.openrouteservice.org/v2';

// OpenRouteService - Lee desde .env con fallback
const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;

// Log para verificar la carga (útil para debug)
console.log('[osmService] ORS API Key:', ORS_API_KEY ? '✓ Cargada' : '✗ Error');
console.log('[osmService] Fuente:', process.env.EXPO_PUBLIC_ORS_API_KEY ? '.env' : 'fallback');

// Headers requeridos por Nominatim
const NOMINATIM_HEADERS = {
  'User-Agent': 'Pawtitas/1.0 (contact: contacto@pawtitas-ar.com)',
};

// Timeout y configuración unificada para todas las plataformas
const DEFAULT_TIMEOUT = 30000; // 30 segundos para todas las plataformas
const POI_REQUEST_TIMEOUT = 50000; // 50 s para carga de POIs (backend puede reintentar hasta 3 servidores)

const fetchJsonWithTimeout = async (
  url,
  options = {},
  {
    timeoutMs = DEFAULT_TIMEOUT,
    timeoutMessage = 'Timeout',
    errorPrefix = 'Request',
  } = {}
) => {
  // Usar XMLHttpRequest en Android para mejor rendimiento con APIs lentas
  if (Platform.OS === 'android') {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const timer = setTimeout(() => {
        xhr.abort();
        reject(new Error(timeoutMessage));
      }, timeoutMs);

      xhr.onload = () => {
        clearTimeout(timer);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error(`${errorPrefix} error: Invalid JSON`));
          }
        } else {
          reject(new Error(`${errorPrefix} error: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`${errorPrefix} error: Network error`));
      };

      xhr.ontimeout = () => {
        clearTimeout(timer);
        reject(new Error(timeoutMessage));
      };

      xhr.open(options.method || 'GET', url, true);
      
      // Agregar headers si existen
      if (options.headers) {
        Object.keys(options.headers).forEach(key => {
          xhr.setRequestHeader(key, options.headers[key]);
        });
      }
      
      xhr.send(options.body || null);
    });
  }

  // iOS y otras plataformas usan fetch normal
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });

    if (!response.ok) {
      throw new Error(`${errorPrefix} error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(timeoutMessage);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Ejecutar query Overpass a través del backend (proxy)
const runOverpassQuery = async (query) => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL no configurada para proxy de Overpass');
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/overpass?query=${encodeURIComponent(query)}`;

  const data = await fetchJsonWithTimeout(
    url,
    { method: 'GET' },
    {
      timeoutMs: POI_REQUEST_TIMEOUT,
      timeoutMessage: 'Timeout: La búsqueda tardó demasiado',
      errorPrefix: 'Overpass proxy',
    }
  );

  return data;
};

const mapOverpassPOI = (element, baseData) => {
  const latitude = element.lat || element.center?.lat;
  const longitude = element.lon || element.center?.lon;

  if (!latitude || !longitude) {
    return null;
  }

  return {
    id: element.id,
    latitude,
    longitude,
    ...baseData,
  };
};

// Búsqueda de direcciones usando Nominatim vía proxy del backend
export const searchAddress = async (query, limit = 5, userLocation = null) => {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error('EXPO_PUBLIC_API_BASE_URL no configurada');
    }

    let url = `${baseUrl.replace(/\/$/, '')}/api/nominatim?q=${encodeURIComponent(query)}&limit=${limit}`;

    if (userLocation && userLocation.latitude != null && userLocation.longitude != null) {
      url += `&latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
    }

    const data = await fetchJsonWithTimeout(
      url,
      { method: 'GET' },
      {
        timeoutMs: DEFAULT_TIMEOUT,
        timeoutMessage: 'Timeout: La búsqueda tardó demasiado',
        errorPrefix: 'Nominatim proxy',
      }
    );

    return data.map(item => ({
      id: item.place_id,
      name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type,
      address: item.address,
    }));
  } catch (error) {
    console.error('Error en searchAddress:', error);
    throw error;
  }
};

// Convertir coordenadas a dirección
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
    
    const data = await fetchJsonWithTimeout(
      url,
      { headers: NOMINATIM_HEADERS },
      {
        timeoutMs: DEFAULT_TIMEOUT,
        timeoutMessage: 'Timeout: La búsqueda tardó demasiado',
        errorPrefix: 'Nominatim reverse',
      }
    );
    
    return {
      name: data.display_name,
      address: data.address,
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('Error en reverseGeocode:', error);
    throw error;
  }
};

// Buscar veterinarias cercanas usando Overpass API
export const findNearbyVeterinaries = async (latitude, longitude, radius = 2000) => {
  try {
    // Buscar veterinarias cercanas
    const query = `
      [out:json][timeout:10];
      (
        nwr(around:${radius},${latitude},${longitude})["amenity"="veterinary"];
      );
      out center 20;
    `;
    const data = await runOverpassQuery(query);
    
    // Mapear a formato consistente
    return data.elements
      .map(element =>
        mapOverpassPOI(element, {
          type: 'veterinary',
          name: element.tags?.name || 'Veterinaria',
          address: formatAddress(element.tags),
          phone: element.tags?.phone,
          website: element.tags?.website,
          opening_hours: element.tags?.opening_hours,
        })
      )
      .filter(Boolean);
  } catch (error) {
    console.error('Error en findNearbyVeterinaries:', error);
    
    throw error;
  }
};

// Buscar petshops cercanos
export const findNearbyPetshops = async (latitude, longitude, radius = 2000) => {
  try {
    const query = `
      [out:json][timeout:10];
      (
        nwr(around:${radius},${latitude},${longitude})["shop"="pet"];
        nwr(around:${radius},${latitude},${longitude})["shop"="pet_grooming"];
      );
      out center 20;
    `;
    const data = await runOverpassQuery(query);
    
    return data.elements
      .map(element =>
        mapOverpassPOI(element, {
          type: 'petshop',
          name: element.tags?.name || 'Petshop',
          address: formatAddress(element.tags),
          phone: element.tags?.phone,
          website: element.tags?.website,
          opening_hours: element.tags?.opening_hours,
          shop_type: element.tags?.shop, // 'pet' o 'pet_grooming'
        })
      )
      .filter(Boolean);
  } catch (error) {
    console.error('Error en findNearbyPetshops:', error);
    
    throw error;
  }
};

// Buscar parques y plazas cercanos
export const findNearbyParks = async (latitude, longitude, radius = 2000) => {
  try {
    const query = `
      [out:json][timeout:10];
      (
        // Parques (leisure=park)
        nwr(around:${radius},${latitude},${longitude})["leisure"="park"];
        // Nodos de ubicación de plazas (place=square)
        node(around:${radius},${latitude},${longitude})["place"="square"];
        // Áreas recreativas que pueden incluir plazas
        nwr(around:${radius},${latitude},${longitude})["leisure"="recreation_ground"];
        // Áreas públicas
        nwr(around:${radius},${latitude},${longitude})["leisure"="public"];
      );
      out center;
    `;
    
    console.log('[findNearbyParks] Ejecutando query para parques y plazas...');
    const data = await runOverpassQuery(query);
    
    console.log('[findNearbyParks] Elementos encontrados:', data.elements?.length || 0);
    
    const results = data.elements
      .map(element => {
        const tags = element.tags || {};
        const name = (tags.name || '').toLowerCase();
        const leisure = tags['leisure'] || '';
        
        // Determinar el tipo y nombre por defecto según los tags y nombre
        let type = 'park';
        let defaultName = 'Parque';
        
        // Detectar plazas por múltiples criterios (en orden de prioridad):
        // 1. Si tiene place=square (nodo de ubicación de plaza)
        if (tags['place'] === 'square') {
          type = 'square';
          defaultName = 'Plaza';
        }
        // 2. Si el nombre contiene "plaza" o "square" (más importante - muchas plazas están etiquetadas como park)
        else if (name.includes('plaza') || name.includes('square')) {
          type = 'square';
          defaultName = 'Plaza';
        }
        // 3. Si tiene leisure específico de plaza (aunque no sea común)
        else if (tags['leisure'] === 'recreation_ground' || tags['leisure'] === 'public') {
          type = 'square';
          defaultName = 'Plaza';
        }
        
        const result = mapOverpassPOI(element, {
          type: type,
          name: tags.name || defaultName,
          address: formatAddress(tags),
          area: tags.area,
          surface: tags.surface,
        });
        
        if (result) {
          console.log(`[findNearbyParks] POI encontrado: ${result.name} (${result.type}) - leisure: ${leisure}, name: "${tags.name}"`);
        }
        
        return result;
      })
      .filter(Boolean);
    
    const parksCount = results.filter(r => r.type === 'park').length;
    const squaresCount = results.filter(r => r.type === 'square').length;
    console.log(`[findNearbyParks] POIs procesados: ${results.length} total (${parksCount} parques, ${squaresCount} plazas)`);
    return results;
  } catch (error) {
    console.error('Error en findNearbyParks:', error);
    
    throw error;
  }
};

// Obtener ruta entre dos puntos usando OpenRouteService
export const getRoute = async (origin, destination, profile = 'driving-car') => {
  try {
    // Mapear perfiles a los nombres de ORS
    const orsProfile = profile === 'foot-walking' ? 'foot-walking' : 'driving-car';
    
    const url = `${ORS_BASE}/directions/${orsProfile}/geojson`;
    
    const body = {
      coordinates: [
        [origin.longitude, origin.latitude],
        [destination.longitude, destination.latitude]
      ],
    };
    
    console.log('[ORS] Enviando request:', { url, body, profile: orsProfile });
    
    const data = await fetchJsonWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
      {
        timeoutMs: DEFAULT_TIMEOUT,
        timeoutMessage: 'Timeout: El servidor tardó demasiado en responder',
        errorPrefix: 'OpenRouteService',
      }
    );

    console.log('[ORS] Respuesta recibida (features):', data.features?.length || 0);

    // Validar respuesta básica
    if (!data || typeof data !== 'object') {
      console.error('[ORS] Respuesta inválida:', data);
      throw new Error('Respuesta inválida del servidor');
    }

    // Manejar errores de la API
    if (data.error) {
      console.error('[ORS] Error de API:', data.error);
      throw new Error(data.error.message || 'Error al calcular ruta');
    }

    if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
      console.error('[ORS] No se encontraron rutas:', data);
      throw new Error('No se encontró ruta');
    }

    const feature = data.features[0];
    console.log('[ORS] Feature seleccionado:', {
      geometry: feature.geometry?.type,
      coords: feature.geometry?.coordinates?.length,
      properties: Object.keys(feature.properties || {})
    });
    
    // Extraer coordenadas del GeoJSON
    if (!feature.geometry || !feature.geometry.coordinates || !Array.isArray(feature.geometry.coordinates)) {
      console.error('[ORS] Geometría inválida:', feature.geometry);
      throw new Error('Formato de ruta inválido');
    }

    // Convertir a formato [lat, lon]
    const coordinates = feature.geometry.coordinates.map(coord => ({
      latitude: coord[1],
      longitude: coord[0],
    }));

    console.log('[ORS] Coordenadas extraídas:', coordinates.length);

    // Validar propiedades
    if (!feature.properties || !feature.properties.summary) {
      console.error('[ORS] Falta información de summary');
      throw new Error('Información de ruta incompleta');
    }

    return {
      coordinates,
      distance: feature.properties.summary.distance || 0, // en metros
      duration: feature.properties.summary.duration || 0, // en segundos
      profile: orsProfile,
      steps: feature.properties.segments?.[0]?.steps || [],
    };
  } catch (error) {
    console.error('Error en getRoute:', error);
    
    // Mensajes de error
    if (error?.message?.includes('403') || error?.message?.includes('401')) {
      throw new Error('Error de autenticación con OpenRouteService. Verifica la API key.');
    }
    
    if (error?.message?.includes('429')) {
      throw new Error('Límite de requests alcanzado. Intenta de nuevo en unos minutos.');
    }
    
    throw error;
  }
};

// Formatear distancia para mostrar
export const formatDistance = (distanceMeters) => {
  if (!distanceMeters) return '';
  
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }
  
  return `${(distanceMeters / 1000).toFixed(1)} km`;
};

// Formatear duración para mostrar
export const formatDuration = (durationSeconds) => {
  if (!durationSeconds) return '';
  
  const minutes = Math.round(durationSeconds / 60);
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 
    ? `${hours}h ${remainingMinutes}min`
    : `${hours}h`;
};

// Formatear dirección desde tags
const formatAddress = (tags) => {
  if (!tags) return '';
  
  const parts = [];
  
  if (tags['addr:street']) {
    const street = tags['addr:street'];
    const housenumber = tags['addr:housenumber'];
    parts.push(housenumber ? `${street} ${housenumber}` : street);
  }
  
  if (tags['addr:city']) {
    parts.push(tags['addr:city']);
  }
  
  if (tags['addr:suburb']) {
    parts.push(tags['addr:suburb']);
  }
  
  return parts.join(', ') || tags.name || '';
};

