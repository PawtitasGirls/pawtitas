// Índice de utilidades compartidas
// Exporta funciones y helpers comunes para toda la aplicación

/**
 * Formatea una fecha según el locale
 * @param {Date} date - Fecha a formatear
 * @param {string} locale - Locale (ej: 'es-ES')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, locale = 'es-ES') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale);
};

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const withCacheBuster = (url, ts = Date.now()) => {
  if (!url || typeof url !== 'string') return null;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${ts}`;
};

export default {
  formatDate,
  capitalize,
  withCacheBuster,
};
