function buildHorariosFromAvailability(availability = {}) {
  const days = Object.entries(availability)
    .filter(([, value]) => value === true)
    .map(([key]) => key);
  return days.join(',');
}

function buildPerfilFromServices(services = {}) {
  const labels = {
    cuidador: 'Cuidador',
    paseador: 'Paseador',
    veterinarioDomicilio: 'Veterinario a domicilio',
    clinicaVeterinaria: 'Clínica Veterinaria',
  };

  const selected = Object.entries(services)
    .filter(([, value]) => value === true)
    .map(([key]) => labels[key])
    .filter(Boolean);

  return selected.join(',');
}

function buildTipoMascotaFromPetTypes(petTypes = {}, petTypesCustom = '') {
  const labels = {
    perro: 'Perro',
    gato: 'Gato',
    conejo: 'Conejo',
    ave: 'Ave',
    roedor: 'Roedor',
    otro: (petTypesCustom || '').trim(),
  };

  const selected = Object.entries(petTypes)
    .filter(([, value]) => value === true)
    .map(([key]) => labels[key])
    .filter(Boolean);

  return selected.length ? selected.join(',') : 'General';
}

module.exports = {
  buildHorariosFromAvailability,
  buildPerfilFromServices,
  buildTipoMascotaFromPetTypes,
};
