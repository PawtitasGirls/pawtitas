/**
 * Descompone una ubicación en formato texto a sus componentes
 * @param {string} ubicacionRaw - Ubicación en formato "Calle 123, Ciudad" o "Calle 123 Ciudad"
 * @returns {Object} { calle, numero, ciudad }
 */
function descomponerUbicacion(ubicacionRaw) {
  if (!ubicacionRaw) {
    return { calle: 'Pendiente', numero: 'S/N', ciudad: 'Pendiente' };
  }
  const txt = String(ubicacionRaw).trim();

  const [calleNumeroParte, ciudadParte] = txt
    .split(',')
    .map((s) => s?.trim())
    .filter(Boolean);

  let calle = 'Pendiente';
  let numero = 'S/N';
  let ciudad = ciudadParte || 'Pendiente';

  if (calleNumeroParte) {
    const snSuffix = /\s+S\/N$/i;
    const parteSinSN = snSuffix.test(calleNumeroParte)
      ? calleNumeroParte.replace(snSuffix, '').trim()
      : calleNumeroParte;
    const esSoloSN = /^S\/N$/i.test(parteSinSN);

    const match = parteSinSN.match(/^(.+?)\s+(\d+[A-Za-z0-9\-]*)$/);
    if (match) {
      calle = match[1].trim();
      numero = match[2].trim();
    } else if (esSoloSN) {
      calle = 'Pendiente';
      numero = 'S/N';
    } else {
      calle = parteSinSN;
      if (snSuffix.test(calleNumeroParte)) numero = 'S/N';
    }
  }

  // Heurística sin coma: "Calle Nombre 123 Ciudad"
  if (!ciudadParte) {
    const tokens = txt.split(/\s+/);
    if (tokens.length >= 3) {
      const posibleNumero = tokens[tokens.length - 2];
      if (/^\d/.test(posibleNumero)) {
        numero = posibleNumero;
        ciudad = tokens[tokens.length - 1] || ciudad;
        calle = tokens.slice(0, tokens.length - 2).join(' ') || calle;
      }
    }
  }

  return { calle, numero, ciudad };
}

module.exports = {
  descomponerUbicacion,
};
