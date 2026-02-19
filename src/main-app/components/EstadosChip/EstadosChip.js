import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/styles';
import { ESTADOS_CONEXION, ESTADOS_CONEXION_CONFIG } from '../../constants/estadosConexion';
import { styles } from './EstadosChip.styles';

// Componente para mostrar el estado de conexión en un chip
const EstadosChip = ({ 
  estado, 
  showIcon = false, 
  iconSize = 14,
  style,
  textStyle 
}) => {
  // No renderizar si no hay estado
  if (!estado) return null;

  const getStatusConfig = (estado) => {
    switch(estado) {
      case ESTADOS_CONEXION.PAGO_CONFIRMADO:
        return {
          backgroundColor: colors.success + '20',
          color: colors.success,
          icon: ESTADOS_CONEXION_CONFIG[ESTADOS_CONEXION.PAGO_CONFIRMADO].icon,
          label: ESTADOS_CONEXION_CONFIG[ESTADOS_CONEXION.PAGO_CONFIRMADO].label
        };
      case ESTADOS_CONEXION.PENDIENTE_DE_PAGO:
        return {
          backgroundColor: colors.warning + '20',
          color: colors.warning,
          icon: ESTADOS_CONEXION_CONFIG[ESTADOS_CONEXION.PENDIENTE_DE_PAGO].icon,
          label: ESTADOS_CONEXION_CONFIG[ESTADOS_CONEXION.PENDIENTE_DE_PAGO].label
        };
      case ESTADOS_CONEXION.SOLICITUD_CANCELADO:
        return {
          backgroundColor: colors.error + '20',
          color: colors.error,
          icon: ESTADOS_CONEXION_CONFIG[ESTADOS_CONEXION.SOLICITUD_CANCELADO].icon,
          label: ESTADOS_CONEXION_CONFIG[ESTADOS_CONEXION.SOLICITUD_CANCELADO].label
        };
      case ESTADOS_CONEXION.SERVICIO_FINALIZADO:
        return {
          backgroundColor: colors.success + '20',
          color: colors.success,
          icon: ESTADOS_CONEXION_CONFIG[ESTADOS_CONEXION.SERVICIO_FINALIZADO].icon,
          label: ESTADOS_CONEXION_CONFIG[ESTADOS_CONEXION.SERVICIO_FINALIZADO].label
        };
      default:
        return {
          backgroundColor: colors.text.disabled + '20',
          color: colors.text.disabled,
          label: estado
        };
    }
  };

  const config = getStatusConfig(estado);

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: config.backgroundColor },
        style
      ]}
    >
      {showIcon && (
        <Ionicons 
          name={config.icon} 
          size={iconSize} 
          color={config.color} 
          style={styles.icon}
        />
      )}
      <Text 
        style={[
          styles.text, 
          { color: config.color },
          textStyle
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

export default EstadosChip;

