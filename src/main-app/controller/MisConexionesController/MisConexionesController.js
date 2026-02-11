export const CONEXIONES_CONFIG = {
  FLOATING_MESSAGE_DURATION: 4000,
  SEARCH_DEBOUNCE_DELAY: 300,
  FILTER_OPTIONS: [
    { key: 'todos', label: 'Todos' },
    { key: 'cuidador', label: 'Cuidadores' },
    { key: 'paseador', label: 'Paseadores' },
    { key: 'veterinario', label: 'Veterinarios' },
  ]
};

export class MisConexionesController {
  static getInitialState() {
    return {
      searchQuery: '',
      selectedFilter: 'todos',
      showFilters: false,
      selectedProvider: null,
      showDetalles: false,
      showResenaModal: false,
      showRechazarModal: false,
      showMensajeFlotante: false,
      mensajeFlotante: { type: '', text: '' }
    };
  }

  // Remover tildes para búsqueda
  static normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  static filterProviders(providers, searchQuery, selectedFilter) {
    let filtered = providers;

    if (searchQuery.trim()) {
      const normalizedQuery = this.normalizeText(searchQuery);
      filtered = filtered.filter(provider => 
        this.normalizeText(provider.nombre).includes(normalizedQuery) ||
        this.normalizeText(provider.ubicacion).includes(normalizedQuery) ||
        this.normalizeText(provider.descripcion).includes(normalizedQuery)
      );
    }

    if (selectedFilter !== 'todos') {
      filtered = filtered.filter(provider => 
        provider.tipo === selectedFilter
      );
    }

    return filtered;
  }

  // Obtener tipo de proveedor, o dueño cuando la vista es del prestador
  static getProviderType(tipo) {
    switch(tipo) {
      case 'cuidador':
        return 'cuidador';
      case 'paseador':
        return 'paseador';
      case 'veterinario':
        return 'veterinario';
      case 'dueño':
        return 'dueño';
      default:
        return 'prestador de servicio';
    }
  }


  static updateProviderState(providers, providerId, newState) {
    return providers.map(p => 
      p.id === providerId 
        ? { ...p, estado: newState }
        : p
    );
  }

  static getActionMessages(action) {
    const messages = {
      rechazar: {
        type: 'success',
        text: 'Solicitud rechazada correctamente'
      },
      finalizar: {
        type: 'success',
        text: 'Servicio finalizado correctamente'
      }
    };
    return messages[action] || { type: '', text: '' };
  }

  static getFilterOptions() {
    return CONEXIONES_CONFIG.FILTER_OPTIONS;
  }

  static getMensajeFlotanteConfig() {
    return {
      duration: CONEXIONES_CONFIG.FLOATING_MESSAGE_DURATION
    };
  }
}
