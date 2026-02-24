import { useRef, useMemo, useState, useCallback } from 'react';
import { ConexionDetallesController } from '../controller';
import { ESTADOS_CONEXION } from '../constants/estadosConexion';

export const useConexionDetalles = (provider, misConexiones, visible = true, onClose, esVistaPrestador = false, onModalHide, isAdmin = false) => {
  const scrollViewRef = useRef(null);
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [scrollOffsetMax, setScrollOffsetMax] = useState(0);

  const handleScrollTo = useCallback((p) => {
    scrollViewRef.current?.scrollTo(p);
  }, []);

  const handleScroll = useCallback((event) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  }, []);

  const handleContentSizeChange = useCallback((_, contentHeight) => {
    contentHeightRef.current = contentHeight;
    setScrollOffsetMax(Math.max(0, contentHeight - layoutHeightRef.current));
  }, []);

  const handleScrollViewLayout = useCallback((event) => {
    layoutHeightRef.current = event.nativeEvent.layout.height;
    setScrollOffsetMax(Math.max(0, contentHeightRef.current - layoutHeightRef.current));
  }, []);

  const isValidProvider = ConexionDetallesController.validateProvider(provider);

  const providerInfo = useMemo(() =>
    ConexionDetallesController.getProviderInfo(provider),
    [provider]
  );

  const createActionHandlers = (handlers) => ({
    handleResenas: () => handlers.onResenas?.(provider),
    handleConectar: () => handlers.onConectar?.(provider),
    handleChat: () => handlers.onChat?.(provider),
    handlePago: () => handlers.onPago?.(provider),
    handleFinalizarServicio: () => handlers.onFinalizarServicio?.(provider),
    handleAgregarResena: () => handlers.onAgregarResena?.(provider),
    handleCancelar: () => handlers.onCancelar?.(provider),
  });

  const getMenuItems = (actionHandlers) =>
    ConexionDetallesController.getMenuItems(provider?.estado, misConexiones, actionHandlers);

  const buttonConfig = useMemo(() => {
    const esFinalizado = provider?.estado === ESTADOS_CONEXION.SERVICIO_FINALIZADO;

    if (misConexiones && esFinalizado && !esVistaPrestador) {
      return {
        primary: {
          label: 'Nueva \nreserva',
          action: 'handlePago',
          variant: 'primary',
        },
        secondary: {
          label: 'Chat',
          action: 'handleChat',
          showCancel: true,
        },
        tertiary: {
          label: 'Agregar\nreseña',
          action: 'handleAgregarResena',
          variant: 'secondary',
        },
      };
    }

    if (provider?.puedeResenar) {
      return {
        primary: {
          label: 'Agregar reseña',
          action: 'handleAgregarResena',
          variant: 'primary',
        },
        secondary: null,
      };
    }

    return ConexionDetallesController.getButtonConfig(
      provider?.estado,
      misConexiones,
      esVistaPrestador,
      isAdmin
    );
  }, [
    provider?.estado,
    provider?.puedeResenar,
    misConexiones,
    esVistaPrestador,
    isAdmin,
  ]);


  const ratingStars = useMemo(() =>
    ConexionDetallesController.getRatingStars(provider?.rating || 0),
    [provider?.rating]
  );

  const modalProps = useMemo(() =>
    ConexionDetallesController.getModalProps(visible, onClose, onModalHide),
    [visible, onClose, onModalHide]
  );

  const providerTypeText = useMemo(() => 
    ConexionDetallesController.getProviderTypeText(provider?.tipo),
    [provider?.tipo]
  );

  const sectionConfig = useMemo(() => 
    ConexionDetallesController.getSectionConfig(misConexiones),
    [misConexiones]
  );

  const steps = useMemo(() => 
    ConexionDetallesController.getSteps(),
    []
  );

  return {
    scrollViewRef,
    scrollOffset,
    scrollOffsetMax,
    handleScrollTo,
    handleScroll,
    handleContentSizeChange,
    handleScrollViewLayout,
    providerInfo,
    isValidProvider,
    buttonConfig,
    ratingStars,
    modalProps,
    providerTypeText,
    sectionConfig,
    steps,
    createActionHandlers,
    getMenuItems
  };
};
