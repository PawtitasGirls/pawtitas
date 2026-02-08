import { colors } from '../../../shared/styles';
import { ESTADOS_CONEXION } from '../../constants/estadosConexion';

export class PrestadorServiciosDetailsController {
  static getMenuItems(estado, misConexiones, actionHandlers, _esVistaPrestador) {
    if (misConexiones && estado === ESTADOS_CONEXION.PENDIENTE_DE_PAGO) {
      return [{
        text: 'Rechazar solicitud',
        icon: 'close-circle-outline',
        iconColor: colors.error,
        textStyle: { color: colors.error },
        onPress: actionHandlers?.handleRechazar
      }];
    }
    return [];
  }

  // Configuración de botones. esVistaPrestador = true oculta "Realizar Pago".
  static getButtonConfig(estado, misConexiones, esVistaPrestador = false) {
    if (misConexiones && estado === ESTADOS_CONEXION.PAGO_CONFIRMADO) {
      return {
        primary: { 
          label: 'Finalizar servicio', 
          action: 'handleFinalizarServicio',
          variant: 'primary'
        },
        secondary: { 
          label: 'Chat', 
          action: 'handleChat',
          showCancel: true
        }
      };
    }
    
    if (misConexiones && (estado === ESTADOS_CONEXION.SOLICITUD_RECHAZADA || estado === ESTADOS_CONEXION.SERVICIO_FINALIZADO)) {
      return {
        primary: { 
          label: 'Agregar reseña', 
          action: 'handleAgregarResena',
          variant: 'primary'
        },
        secondary: null
      };
    }
    
    if (misConexiones && esVistaPrestador) {
      return {
        primary: { 
          label: 'Chat', 
          action: 'handleChat',
          variant: 'primary'
        },
        secondary: null
      };
    }
    
    return {
      primary: { 
        label: misConexiones ? "Realizar Pago" : "Conectar", 
        action: misConexiones ? 'handlePago' : 'handleConectar',
        variant: 'primary'
      },
      secondary: { 
        label: misConexiones ? "Chat" : "Reseñas", 
        action: misConexiones ? 'handleChat' : 'handleResenas',
        showCancel: true
      }
    };
  }

  // Texto del tipo de proveedor, o dueño en vista prestador
  static getProviderTypeText(providerType) {
    switch(providerType) {
      case 'cuidador': return 'cuidador';
      case 'paseador': return 'paseador';
      case 'veterinario': return 'veterinario';
      case 'dueño': return 'dueño';
      default: return 'prestador de servicio';
    }
  }

  static getRatingStars(rating) {
    const maxStars = 5;
    return Array.from({ length: maxStars }, (_, i) => ({
      filled: (i + 1) <= rating,
      key: i + 1
    }));
  }

  static getModalProps(visible, onClose, scrollViewRef) {
    return {
      isVisible: visible,
      onBackdropPress: onClose,
      onBackButtonPress: onClose,
      onSwipeComplete: onClose,
      swipeDirection: ['down'],
      style: 'modalContainer',
      propagateSwipe: true,
      scrollTo: (reactNode) => scrollViewRef.current?.scrollTo(reactNode),
      backdropTransitionOutTiming: 0,
      useNativeDriverForBackdrop: true,
      avoidKeyboard: true,
      // Animaciones
      animationIn: 'slideInUp',
      animationOut: 'slideOutDown',
      animationInTiming: 300,
      animationOutTiming: 300,
      backdropOpacity: 0.5,
      deviceHeight: null,
      deviceWidth: null
    };
  }

  static getSectionConfig(misConexiones) {
    return {
      showSteps: !misConexiones,
      showWarning: misConexiones,
      warningTitle: 'A tener en cuenta:',
      warningIcon: '💬',
      warningItems: [
        'El pago será procesado con Mercado Pago de manera segura.',
        'Al completar el pago, la solicitud pasará a estado "Confirmado" y el servicio quedará validado.',
        'El pago se libera al prestador únicamente cuando ambas partes (el cliente y el prestador) marquen el servicio como "Finalizado".',
        'Si tenés dudas o querés coordinar algo, podés comunicarte con el usuario a través del chat cuando el estado esté "Pendiente" o "Confirmado".'
      ]
    };
  }

  static getSteps() {
    return [
      { number: '1', text: 'Enviá tu solicitud de conexión al prestador.' },
      { number: '2', text: 'Coordiná el horario y los detalles del servicio a través del chat.' },
      { number: '3', text: 'Realizá el pago de manera segura desde la app.' },
      { number: '4', text: '¡Listo! El servicio se realizará según lo acordado.' }
    ];
  }

  static validateProvider(provider) {
    return provider && provider.id;
  }

  static getProviderInfo(provider) {
    if (!this.validateProvider(provider)) {
      return null;
    }

    return {
      id: provider.id,
      nombre: provider.nombre || '',
      ubicacion: provider.ubicacion || '',
      precio: provider.precio || '',
      horario: provider.horario || '',
      disponibilidad: provider.disponibilidad || '',
      descripcion: provider.descripcion || '',
      descripcionDuenio: provider.descripcionDuenio ?? null,
      mascota: provider.mascota ?? null,
      mascotas: Array.isArray(provider.mascotas) && provider.mascotas.length > 0 ? provider.mascotas : null,
      estado: provider.estado || '',
      rating: provider.rating || 0,
      tipo: provider.tipo || '',
      distance: provider.distance !== undefined ? provider.distance : null,
    };
  }
}
