import { useRef, useMemo } from 'react';
import { ConexionDetallesController } from '../controller';

export const useConexionDetalles = (provider, misConexiones, visible = true, onClose, esVistaPrestador = false, onModalHide, isAdmin = false) => {
  const scrollViewRef = useRef(null);

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
    handleRechazar: () => handlers.onRechazar?.(provider),
  });

  const getMenuItems = (actionHandlers) =>
    ConexionDetallesController.getMenuItems(provider?.estado, misConexiones, actionHandlers);

 const buttonConfig = useMemo(() => {
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

  if (misConexiones && provider?.estado === 'finalizado' && provider?.puedeResenar === false) {
    return {
      primary: {
        label: 'Chat',
        action: 'handleChat',
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
  isAdmin
]);


  const ratingStars = useMemo(() =>
    ConexionDetallesController.getRatingStars(provider?.rating || 0),
    [provider?.rating]
  );

  const modalProps = useMemo(() =>
    ConexionDetallesController.getModalProps(visible, onClose, scrollViewRef, onModalHide),
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
