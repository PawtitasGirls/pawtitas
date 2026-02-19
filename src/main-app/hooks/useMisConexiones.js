import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { MisConexionesController } from '../controller';
import { ESTADOS_CONEXION, mapReservaEstadoToConexion } from '../constants/estadosConexion';
import { useLocation, useAuth } from '../contexts';
import { ROLES } from '../constants/roles';
import {
  getReservasByDuenio,
  getReservasByPrestador,
  createPaymentPreference,
  confirmarFinalizacionServicio,
  cancelarReserva,
} from '../services';

const getResenasArray = (reserva) => {
  if (Array.isArray(reserva?.resenas)) return reserva.resenas;
  if (Array.isArray(reserva?.resena)) return reserva.resena;
  return [];
};

const getCalificacionPropia = (reserva, emisorRol) => {
  const resenas = getResenasArray(reserva);
  const propia = resenas.find((resena) => String(resena?.emisorRol || '').toUpperCase() === emisorRol);
  return propia?.calificacion ?? 0;
};

export const useMisConexiones = () => {
  const { userLocation, getDistanceFromUser } = useLocation();
  const { user, role } = useAuth();
  
  const [state, setState] = useState(() => ({
    ...MisConexionesController.getInitialState(),
    showCalendarioModal: false,
    selectedDates: [],
    showPaymentWebView: false,
    paymentUrl: null,
    pendingResenaProvider: null,
    pendingCalendarioProvider: null,
  }));
  const [providers, setProviders] = useState([]);
  const [loadingConexiones, setLoadingConexiones] = useState(true);
  const paymentProviderRef = useRef(null);

  const isPrestadorView = role === ROLES.PRESTADOR;
  const duenioId = user?.duenioId || (role === ROLES.DUENIO ? user?.id : null);
  const prestadorId = user?.prestadorId || (role === ROLES.PRESTADOR ? user?.id : null);

  const refreshConexiones = useCallback(async () => {
    setLoadingConexiones(true);
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
          const rating = getCalificacionPropia(r, 'DUENIO');
          return {
            id: r.id,
            reservaId: r.id,
            prestadorUsuarioId: p.usuarioId ?? null,
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
            rating,
            puedeResenar: Boolean(r.puedeResenar),
            mascota,
          };
        });
        setProviders(list);
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
          const rating = getCalificacionPropia(r, 'PRESTADOR');
          return {
            id: r.id,
            reservaId: r.id,
            duenioUsuarioId: d.usuarioId ?? null,
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
            rating,
            puedeResenar: Boolean(r.puedeResenar),
          };
        });
        setProviders(list);
      } else {
        setProviders([]);
      }
    } catch (err) {
      setProviders([]);
    } finally {
      setLoadingConexiones(false);
    }
  }, [role, duenioId, prestadorId]);

  useEffect(() => {
    if (!user) {
      setProviders([]);
      setLoadingConexiones(false);
      return;
    }
    refreshConexiones();
  }, [user, refreshConexiones]);

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
      pendingResenaProvider: null,
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
    paymentProviderRef.current = provider;
    setState(prev => ({
      ...prev,
      showDetalles: false,
      selectedProvider: provider,
      pendingCalendarioProvider: provider,
      showCalendarioModal: false,
    }));
  }, []);

  const handleConfirmarPago = useCallback(async () => {
    const provider = state.selectedProvider || paymentProviderRef.current;
    if (!provider || !user?.email) {
      return;
    }

    setState(prev => ({
      ...prev,
      showCalendarioModal: false,
      showMensajeFlotante: true,
      mensajeFlotante: {
        type: 'info',
        text: 'Redirigiendo a Mercado Pago para que completes tu pago de forma segura',
      },
    }));

    try {
      const res = await createPaymentPreference({
        reservaId: provider.id,
        userEmail: user.email,
      });

      if (!res?.success) {
        setState(prev => ({
          ...prev,
          showMensajeFlotante: true,
          mensajeFlotante: {
            type: 'error',
            text: res?.message || 'Error al crear el pago. Intentá de nuevo.',
          },
        }));
        return;
      }

      const url = res.sandboxInitPoint || res.initPoint;

      if (__DEV__) {
        console.log('🧾 [PAGO] URLs recibidas de preferencia:', {
          initPoint: res.initPoint,
          sandboxInitPoint: res.sandboxInitPoint,
          urlSeleccionada: url,
        });
      }

      if (url) {
        setState(prev => ({ ...prev, paymentUrl: url, showPaymentWebView: true }));
      } else {
        setState(prev => ({
          ...prev,
          showMensajeFlotante: true,
          mensajeFlotante: { type: 'error', text: 'No se pudo obtener el enlace de pago.' },
        }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        showMensajeFlotante: true,
        mensajeFlotante: {
          type: 'error',
          text: err?.message || 'Error al procesar el pago. Intentá de nuevo.',
        },
      }));
    }
  }, [state.selectedProvider, user?.email]);

  const handleCancelarCalendario = useCallback(() => {
    paymentProviderRef.current = null;
    setState(prev => ({ 
      ...prev, 
      showCalendarioModal: false, 
      selectedProvider: null,
      pendingCalendarioProvider: null,
    }));
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    const provider = state.selectedProvider;
    if (provider) {
      setProviders(prev =>
        MisConexionesController.updateProviderState(prev, provider.id, ESTADOS_CONEXION.PAGO_CONFIRMADO)
      );
    }
    setState(prev => ({
      ...prev,
      showPaymentWebView: false,
      paymentUrl: null,
      selectedProvider: null,
      showMensajeFlotante: true,
      mensajeFlotante: {
        type: 'success',
        text: '¡Pago realizado! El dinero queda retenido hasta que ambos confirmen la finalización del servicio.',
      },
    }));
  }, [state.selectedProvider]);

  const handlePaymentFailure = useCallback(() => {
    setState(prev => ({
      ...prev,
      showPaymentWebView: false,
      paymentUrl: null,
      selectedProvider: null,
      showMensajeFlotante: true,
      mensajeFlotante: { type: 'error', text: 'El pago no pudo completarse. Intentá de nuevo.' },
    }));
  }, []);

  const handleClosePaymentWebView = useCallback(() => {
    paymentProviderRef.current = null;
    setState(prev => ({ ...prev, showPaymentWebView: false, paymentUrl: null, selectedProvider: null }));
    
    // Refrescar desde BD para sincronizar con webhook de MercadoPago
    // Delay para dar tiempo al webhook a procesar
    setTimeout(() => {
      refreshConexiones();
    }, 2000);
  }, [refreshConexiones]);

  const handleDeepLinkPaymentResult = useCallback((result, reservaId) => {
    paymentProviderRef.current = null;
    const id = reservaId ? String(reservaId) : null;
    if (id) {
      setProviders(prev =>
        result === 'success' || result === 'pending'
          ? MisConexionesController.updateProviderState(prev, id, ESTADOS_CONEXION.PAGO_CONFIRMADO)
          : prev
      );
    }

    let mensajeFlotante;
    if (result === 'success' || result === 'pending') {
      mensajeFlotante = id
        ? { type: 'success', text: '¡Pago realizado! El dinero queda retenido hasta que ambos confirmen la finalización del servicio.' }
        : { type: 'warning', text: 'No se encontró la reserva asociada al pago. Volvé a intentar o contactá soporte si el problema persiste.' };
    } else {
      mensajeFlotante = { type: 'error', text: 'El pago no pudo completarse. Intentá de nuevo.' };
    }

    setState(prev => ({
      ...prev,
      showPaymentWebView: false,
      paymentUrl: null,
      selectedProvider: null,
      showMensajeFlotante: true,
      mensajeFlotante,
    }));
  }, []);

  // Listener de deep link: volver de MercadoPago. En Android el custom tab se cierra solo; en iOS hay que cerrar Safari View Controller.
  useEffect(() => {
    const processPaymentUrl = (url) => {
      if (!url || !url.includes('pawtitas://payment/')) return;
      if (Platform.OS === 'ios') {
        WebBrowser.dismissBrowser();
      }
      const reservaIdMatch = url.match(/[?&]reserva_id=([^&]+)/);
      const reservaId = reservaIdMatch ? reservaIdMatch[1] : null;
      if (url.includes('/success')) handleDeepLinkPaymentResult('success', reservaId);
      else if (url.includes('/failure')) handleDeepLinkPaymentResult('failure', reservaId);
      else if (url.includes('/pending')) handleDeepLinkPaymentResult('pending', reservaId);
    };

    const subscription = Linking.addEventListener('url', (event) => {
      processPaymentUrl(event?.url);
    });

    Linking.getInitialURL().then((url) => {
      processPaymentUrl(url);
    });

    return () => subscription.remove();
  }, [handleDeepLinkPaymentResult]);

  const handleFinalizarServicio = useCallback(async (provider) => {
    const userId = isPrestadorView ? prestadorId : duenioId;
    if (!userId) {
      setState(prev => ({
        ...prev,
        showMensajeFlotante: true,
        mensajeFlotante: { type: 'error', text: 'Error: no se pudo identificar al usuario.' },
      }));
      return;
    }

    try {
      const res = await confirmarFinalizacionServicio({
        reservaId: provider.id,
        userId,
        esProveedor: isPrestadorView,
      });

      if (!res?.success) {
        setState(prev => ({
          ...prev,
          showMensajeFlotante: true,
          mensajeFlotante: { type: 'error', text: res?.message || 'Error al confirmar.' },
        }));
        return;
      }

      if (res.pagoLiberado) {
        setProviders(prev =>
          MisConexionesController.updateProviderState(prev, provider.id, ESTADOS_CONEXION.SERVICIO_FINALIZADO)
        );
        setState(prev => ({
          ...prev,
          showDetalles: false,
          selectedProvider: null,
          showMensajeFlotante: true,
          mensajeFlotante: {
            type: 'success',
            text: '¡Servicio finalizado! El pago fue liberado al prestador.',
          },
        }));
      } else {
        setState(prev => ({
          ...prev,
          showMensajeFlotante: true,
          mensajeFlotante: {
            type: 'info',
            text: res.message || 'Tu confirmación fue registrada. Esperando la otra parte.',
          },
        }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        showMensajeFlotante: true,
        mensajeFlotante: { type: 'error', text: err?.message || 'Error al confirmar. Intentá de nuevo.' },
      }));
    }
  }, [isPrestadorView, prestadorId, duenioId]);

  const handleRechazar = useCallback((provider) => {
    setState(prev => ({ 
      ...prev, 
      showDetalles: false,
      pendingRechazarProvider: provider,
    }));
  }, []);

  const handleConfirmarRechazo = useCallback(async () => {
    if (!state.selectedProvider) return;
    try {
      await cancelarReserva(state.selectedProvider.id);
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
        mensajeFlotante: message,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        showRechazarModal: false,
        selectedProvider: null,
        showMensajeFlotante: true,
        mensajeFlotante: { type: 'error', text: err?.message || 'Error al cancelar la solicitud' },
      }));
    }
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
      showDetalles: false,
      selectedProvider: provider,
      pendingResenaProvider: provider,
      showResenaModal: false,
    }));
  }, []);

  const handleDetallesModalHide = useCallback(() => {
    setState((prev) => {
      if (prev.pendingResenaProvider) {
        return {
          ...prev,
          selectedProvider: prev.pendingResenaProvider,
          pendingResenaProvider: null,
          showResenaModal: true,
        };
      }
      if (prev.pendingCalendarioProvider) {
        return {
          ...prev,
          showCalendarioModal: true,
          pendingCalendarioProvider: null,
        };
      }
      if (prev.pendingRechazarProvider) {
        return {
          ...prev,
          selectedProvider: prev.pendingRechazarProvider,
          pendingRechazarProvider: null,
          showRechazarModal: true,
        };
      }
      return prev;
    });
  }, []);

  const handleCloseResenaModal = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showResenaModal: false, 
      selectedProvider: null,
      pendingResenaProvider: null,
    }));
  }, []);

  const handleResenaGuardada = useCallback((resenaData) => {
    const reservaId = String(resenaData?.reservaId || '');
    const calificacion = Number(resenaData?.calificacion || 0);
    if (!reservaId || calificacion <= 0) return;

    setProviders((prev) =>
      prev.map((provider) => {
        const providerReservaId = String(provider?.reservaId || provider?.id || '');
        if (providerReservaId !== reservaId) {
          return provider;
        }
        return {
          ...provider,
          rating: calificacion,
          puedeResenar: false,
        };
      })
    );
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

  const handleResenas = useCallback((provider) => {
    handleCloseDetalles();
  }, [handleCloseDetalles]);

  const handleConectar = useCallback((provider) => {
    handleCloseDetalles();
  }, [handleCloseDetalles]);

  const handleChat = useCallback((provider, navigation) => {
    handleCloseDetalles();
  
    let targetUserId = null;
  
    if (isPrestadorView) {
      targetUserId = provider.duenioUsuarioId;
    } else {
      targetUserId = provider.prestadorUsuarioId;
    }
  
    if (!targetUserId) {
      console.warn('No se encontró usuarioId para abrir chat');
      return;
    }
  
    navigation.navigate('Chat', {
      targetUser: {
        id: String(targetUserId),
        name: provider.nombre,
        image: null, // puedes agregar avatar si lo incluyes luego
      },
    });
  
  }, [handleCloseDetalles, isPrestadorView]);
  

  return {
    state,
    providers: filteredProviders,
    loadingConexiones,
    isPrestadorView,
    role,
    handleSearch,
    handleFilterChange,
    handleProviderPress,
    handleCloseDetalles,
    handlePago,
    handleConfirmarPago,
    handleCancelarCalendario,
    handlePaymentSuccess,
    handlePaymentFailure,
    handleClosePaymentWebView,
    handleFinalizarServicio,
    handleRechazar,
    handleConfirmarRechazo,
    handleCancelarRechazo,
    handleAgregarResena,
    handleDetallesModalHide,
    handleResenaGuardada,
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