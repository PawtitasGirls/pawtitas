import { useRef, useMemo } from 'react';
import { PrestadorServiciosDetailsController } from '../controller';

export const usePrestadorServiciosDetails = (provider, misConexiones, onClose, esVistaPrestador = false) => {
  const scrollViewRef = useRef(null);
  
  const isValidProvider = PrestadorServiciosDetailsController.validateProvider(provider);
  
  const providerInfo = useMemo(() => 
    PrestadorServiciosDetailsController.getProviderInfo(provider),
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
    PrestadorServiciosDetailsController.getMenuItems(provider?.estado, misConexiones, actionHandlers);

  const buttonConfig = useMemo(() => 
    PrestadorServiciosDetailsController.getButtonConfig(provider?.estado, misConexiones, esVistaPrestador),
    [provider?.estado, misConexiones, esVistaPrestador]
  );

  // Configuración de estrellas
  const ratingStars = useMemo(() => 
    PrestadorServiciosDetailsController.getRatingStars(provider?.rating || 0),
    [provider?.rating]
  );

  // Props del modal
  const modalProps = useMemo(() => 
    PrestadorServiciosDetailsController.getModalProps(true, onClose, scrollViewRef),
    [onClose]
  );

  // Texto del tipo de proveedor
  const providerTypeText = useMemo(() => 
    PrestadorServiciosDetailsController.getProviderTypeText(provider?.tipo),
    [provider?.tipo]
  );

  // Configuración de secciones
  const sectionConfig = useMemo(() => 
    PrestadorServiciosDetailsController.getSectionConfig(misConexiones),
    [misConexiones]
  );

  // Pasos a seguir
  const steps = useMemo(() => 
    PrestadorServiciosDetailsController.getSteps(),
    []
  );

  return {
    // Referencias
    scrollViewRef,
    
    // Data
    providerInfo,
    isValidProvider,
    
    // Configuraciones
    buttonConfig,
    ratingStars,
    modalProps,
    providerTypeText,
    sectionConfig,
    steps,
    
    // Utils
    createActionHandlers,
    getMenuItems
  };
};
