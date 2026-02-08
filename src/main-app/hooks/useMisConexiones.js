import { useState, useMemo, useCallback, useEffect } from 'react';
import { MisConexionesController } from '../controller';
import { ESTADOS_CONEXION, mapReservaEstadoToConexion } from '../constants/estadosConexion';
import { useLocation, useAuth } from '../contexts';
import { ROLES } from '../constants/roles';
import { getReservasByDuenio, getReservasByPrestador } from '../services';

export const useMisConexiones = () => {
  const { userLocation, getDistanceFromUser } = useLocation();
  const { user, role } = useAuth();
  
  const [state, setState] = useState(() => ({
    ...MisConexionesController.getInitialState(),
    showCalendarioModal: false,
    selectedDates: []
  }));
  const [providers, setProviders] = useState([]);
  const [loadingConexiones, setLoadingConexiones] = useState(true);

  const isPrestadorView = role === ROLES.PRESTADOR;
  const duenioId = user?.duenioId || (role === ROLES.DUENIO ? user?.id : null);
  const prestadorId = user?.prestadorId || (role === ROLES.PRESTADOR ? user?.id : null);

  useEffect(() => {
    if (!user) {
      setProviders([]);
      setLoadingConexiones(false);
      return;
    }
    let cancelled = false;
    setLoadingConexiones(true);
    const load = async () => {
      try {
        if (role === ROLES.DUENIO && duenioId) {
          const res = await getReservasByDuenio(duenioId);
          const reservas = res?.reservas || [];
          const list = reservas.map((r) => {
            const p = r.prestador || {};
            const serv = p.servicio || {};
            const dom = p.domicilio || {};
            const mascotaRaw = r.mascota;
            const estadoConexion = mapReservaEstadoToConexion(r.estado);
            const mascota = mascotaRaw
              ? { nombre: mascotaRaw.nombre ?? '', tipo: mascotaRaw.tipo ?? '', raza: mascotaRaw.raza ?? '' }
              : null;
            return {
              id: r.id,
              reservaId: r.id,
              nombre: p.nombreCompleto || 'Sin nombre',
              descripcion: serv.descripcion || 'Sin descripción',
              precio: serv.precio != null ? `$${Number(serv.precio).toLocaleString('es-AR')}` : 'A convenir',
              ubicacion: dom.ubicacion || 'No especificado',
              disponibilidad: serv.horarios || 'A convenir',
              horario: serv.duracion || 'A convenir',
              latitude: dom.latitude ?? null,
              longitude: dom.longitude ?? null,
              tipo: p.perfil || '',
              estado: estadoConexion,
              rating: 0,
              mascota,
            };
          });
          if (!cancelled) setProviders(list);
        } else if (role === ROLES.PRESTADOR && prestadorId) {
          const res = await getReservasByPrestador(prestadorId);
          const reservas = res?.reservas || [];
          const list = reservas.map((r) => {
            const d = r.duenio || {};
            const dom = d.domicilio || {};
            const mascotaRaw = r.mascota || {};
            const estadoConexion = mapReservaEstadoToConexion(r.estado);
            const descripcionDuenio = d.descripcion || d.comentarios || '';
            const mascota = {
              nombre: mascotaRaw.nombre || null,
              tipo: mascotaRaw.tipo || null,
              edad: mascotaRaw.edad != null ? mascotaRaw.edad : null,
              edadUnidad: mascotaRaw.edadUnidad || null,
              raza: mascotaRaw.raza || null,
              infoAdicional: mascotaRaw.infoAdicional || null,
              condiciones: mascotaRaw.condiciones || null,
            };
            const tieneDatosMascota = Object.values(mascota).some(v => v != null && v !== '');
            const descripcion = descripcionDuenio
              ? (tieneDatosMascota ? `${descripcionDuenio.slice(0, 80)}${descripcionDuenio.length > 80 ? '…' : ''} · Mascota: ${mascota.nombre || '—'}` : descripcionDuenio)
              : (tieneDatosMascota ? `Mascota: ${mascota.nombre || '—'}${mascota.tipo ? ` (${mascota.tipo})` : ''}` : 'Sin descripción');
            return {
              id: r.id,
              reservaId: r.id,
              nombre: d.nombreCompleto || 'Sin nombre',
              descripcion,
              descripcionDuenio: descripcionDuenio || null,
              mascota: tieneDatosMascota ? mascota : null,
              precio: '',
              ubicacion: dom.ubicacion || 'No especificado',
              disponibilidad: '',
              horario: '',
              latitude: dom.latitude ?? null,
              longitude: dom.longitude ?? null,
              tipo: 'dueño',
              estado: estadoConexion,
              rating: 0,
            };
          });
          if (!cancelled) setProviders(list);
        } else {
          if (!cancelled) setProviders([]);
        }
      } catch (err) {
        if (!cancelled) setProviders([]);
      } finally {
        if (!cancelled) setLoadingConexiones(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, role, duenioId, prestadorId]);

  // Filtrar proveedores y agregar distancias
  const filteredProviders = useMemo(() => {
    const filtered = MisConexionesController.filterProviders(
      providers, 
      state.searchQuery, 
      state.selectedFilter
    );

    // Agregar distancia a cada proveedor si tiene coordenadas y hay ubicación del usuario
    return filtered.map(provider => {
      if (provider.latitude && provider.longitude && userLocation) {
        const distance = getDistanceFromUser(provider.latitude, provider.longitude);
        return { ...provider, distance };
      }
      return { ...provider, distance: null };
    });
  }, [providers, state.searchQuery, state.selectedFilter, userLocation, getDistanceFromUser]);

  // Búsqueda y filtros
  const handleSearch = useCallback((query) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleFilterChange = useCallback((filter) => {
    setState(prev => ({ 
      ...prev, 
      selectedFilter: filter, 
      showFilters: false 
    }));
  }, []);

  const handleProviderPress = useCallback((provider) => {
    setState(prev => ({ 
      ...prev, 
      selectedProvider: provider, 
      showDetalles: true 
    }));
  }, []);

  const handleCloseDetalles = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showDetalles: false, 
      selectedProvider: null 
    }));
  }, []);

  const handlePago = useCallback((provider) => {
    // Abrir el modal de calendario para seleccionar fechas
    setState(prev => ({ 
      ...prev, 
      selectedProvider: provider,
      showCalendarioModal: true 
    }));
    handleCloseDetalles();
  }, [handleCloseDetalles]);

  const handleConfirmarPago = useCallback((selectedDates) => {
    if (!state.selectedProvider) return;
    
    // Actualizar el estado del proveedor a pago confirmado
    setProviders(prev => 
      MisConexionesController.updateProviderState(
        prev, 
        state.selectedProvider.id, 
        ESTADOS_CONEXION.PAGO_CONFIRMADO
      )
    );
    
    // Cerrar el modal y mostrar mensaje de éxito
    setState(prev => ({
      ...prev,
      showCalendarioModal: false,
      selectedDates: selectedDates,
      selectedProvider: null,
      showMensajeFlotante: true,
      mensajeFlotante: {
        type: 'success',
        text: `Pago confirmado para ${selectedDates.length} ${selectedDates.length === 1 ? 'día' : 'días'}`
      }
    }));
  }, [state.selectedProvider]);

  const handleCancelarCalendario = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showCalendarioModal: false,
      selectedProvider: null 
    }));
  }, []);

  const handleFinalizarServicio = useCallback((provider) => {
    setProviders(prev => 
      MisConexionesController.updateProviderState(
        prev, 
        provider.id, 
        ESTADOS_CONEXION.SERVICIO_FINALIZADO
      )
    );
    handleCloseDetalles();
  }, [handleCloseDetalles]);

  const handleRechazar = useCallback((provider) => {
    setState(prev => ({ 
      ...prev, 
      selectedProvider: provider, 
      showRechazarModal: true 
    }));
    handleCloseDetalles();
  }, [handleCloseDetalles]);

  const handleConfirmarRechazo = useCallback(() => {
    if (!state.selectedProvider) return;
    
    setProviders(prev => 
      MisConexionesController.updateProviderState(
        prev, 
        state.selectedProvider.id, 
        ESTADOS_CONEXION.SOLICITUD_RECHAZADA
      )
    );
    
    const message = MisConexionesController.getActionMessages('rechazar');
    setState(prev => ({
      ...prev,
      showRechazarModal: false,
      selectedProvider: null,
      showMensajeFlotante: true,
      mensajeFlotante: message
    }));
  }, [state.selectedProvider]);

  const handleCancelarRechazo = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showRechazarModal: false, 
      selectedProvider: null 
    }));
  }, []);

  const handleAgregarResena = useCallback((provider) => {
    setState(prev => ({ 
      ...prev, 
      selectedProvider: provider, 
      showResenaModal: true 
    }));
    handleCloseDetalles();
  }, [handleCloseDetalles]);

  const handleCloseResenaModal = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showResenaModal: false, 
      selectedProvider: null 
    }));
  }, []);

  const handleHideMensajeFlotante = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showMensajeFlotante: false, 
      mensajeFlotante: { type: '', text: '' } 
    }));
  }, []);

  const toggleFilters = useCallback(() => {
    setState(prev => ({ ...prev, showFilters: !prev.showFilters }));
  }, []);

  // Handlers para navegación
  const handleResenas = useCallback((provider) => {
    console.log('Ver reseñas de:', provider.nombre);
    handleCloseDetalles();
  }, [handleCloseDetalles]);

  const handleConectar = useCallback((provider) => {
    console.log('Gestionar conexión con:', provider.nombre);
    handleCloseDetalles();
  }, [handleCloseDetalles]);

  const handleChat = useCallback((provider, navigation) => {
    handleCloseDetalles();
    navigation.navigate('Chat', { providerId: provider.id });
  }, [handleCloseDetalles]);

  return {
    state,
    providers: filteredProviders,
    loadingConexiones,
    isPrestadorView,
    handleSearch,
    handleFilterChange,
    handleProviderPress,
    handleCloseDetalles,
    handlePago,
    handleConfirmarPago,
    handleCancelarCalendario,
    handleFinalizarServicio,
    handleRechazar,
    handleConfirmarRechazo,
    handleCancelarRechazo,
    handleAgregarResena,
    handleCloseResenaModal,
    handleHideMensajeFlotante,
    toggleFilters,
    handleResenas,
    handleConectar,
    handleChat,
    getProviderType: MisConexionesController.getProviderType,
    filterOptions: MisConexionesController.getFilterOptions(),
    mensajeFlotanteConfig: MisConexionesController.getMensajeFlotanteConfig()
  };
};