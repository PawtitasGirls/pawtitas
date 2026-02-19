export const CONEXIONES_CONFIG = {
  FLOATING_MESSAGE_DURATION: 4000,
  SEARCH_DEBOUNCE_DELAY: 300,
  FILTER_OPTIONS: [
    { key: 'todos', label: 'Todos' },
    { key: 'pendiente', label: 'Pendiente' },
    { key: 'confirmado', label: 'Confirmado' },
    { key: 'finalizado', label: 'Finalizado' },
    { key: 'cancelado', label: 'Cancelado' },
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
      showCancelarModal: false,
      pendingCancelarProvider: null,
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
        provider.estado === selectedFilter
      );
    }

    return filtered;
  }

  // Obtener estado de la conexión
  static getProviderType(estado) {
    switch(estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmado':
        return 'Confirmado';
      case 'finalizado':
        return 'Finalizado';
      case 'cancelado':
        return 'Cancelado';
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
      cancelar: {
        type: 'success',
        text: 'Solicitud cancelada correctamente'
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
