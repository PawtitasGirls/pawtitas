import { useRef, useMemo } from 'react';
import { ConexionDetallesController } from '../controller';

export const useConexionDetalles = (provider, misConexiones, onClose, esVistaPrestador = false) => {
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

  const buttonConfig = useMemo(() => 
    ConexionDetallesController.getButtonConfig(provider?.estado, misConexiones, esVistaPrestador),
    [provider?.estado, misConexiones, esVistaPrestador]
  );

  // Configuración de estrellas
  const ratingStars = useMemo(() => 
    ConexionDetallesController.getRatingStars(provider?.rating || 0),
    [provider?.rating]
  );

  // Props del modal
  const modalProps = useMemo(() => 
    ConexionDetallesController.getModalProps(true, onClose, scrollViewRef),
    [onClose]
  );

  // Texto del tipo de proveedor
  const providerTypeText = useMemo(() => 
    ConexionDetallesController.getProviderTypeText(provider?.tipo),
    [provider?.tipo]
  );

  // Configuración de secciones
  const sectionConfig = useMemo(() => 
    ConexionDetallesController.getSectionConfig(misConexiones),
    [misConexiones]
  );

  // Pasos a seguir
  const steps = useMemo(() => 
    ConexionDetallesController.getSteps(),
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
