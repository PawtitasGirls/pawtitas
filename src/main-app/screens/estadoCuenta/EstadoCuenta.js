import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts';
import { clearAuthToken } from '../../services';
import { LogoutBtn, ContactoService } from '../perfil/components';
import { styles } from './EstadoCuenta.styles';

// Estados de cuenta para usuarios == false, prestador.estado == 'RECHAZADO'
const ESTADO_CONFIG = {
  rechazado: {
    icon: '⚠️',
    title: 'Tu cuenta no fue aprobada 😕',
    message:
      '¡Gracias por postularte en Pawtitas! 💛\n\n' +
      'Revisamos tu perfil y, por el momento, no pudimos aprobarlo.\n\n' +
      'No te preocupes, podés contactar a nuestro equipo para revisar el caso o actualizar tu información 📝',
    motivoKey: 'motivoRechazo',
  },
  suspendido: {
    icon: '🚫',
    title: 'Cuenta deshabilitada',
    message:
      'Tu cuenta fue deshabilitada por incumplir las normas de Pawtitas.\n\n' +
      'Por razones de seguridad, no es posible reactivar el acceso.\n' +
      'Para más información, podés contactar a soporte.',
    motivoKey: 'motivoSuspension',
  },
};

export default function EstadoCuenta({ route }) {
  const navigation = useNavigation();
  const { user, clearAuth } = useAuth();
  const params = route?.params ?? {};

  const type = params.type ?? 'rechazado';
  const config = ESTADO_CONFIG[type] ?? ESTADO_CONFIG.rechazado;

  const icon = params.icon ?? config.icon;
  const title = params.title ?? config.title;
  const message = params.message ?? config.message;
  const motivo = params.motivo ?? user?.[config.motivoKey] ?? null;

  const handleSalir = () => {
    clearAuth();
    clearAuthToken();
    navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
  };

  const primaryActionLabel = params.primaryActionLabel ?? 'Contactar a Pawtitas 📨';
  const secondaryActionLabel = params.secondaryActionLabel ?? 'Cerrar sesión';
  const onPrimaryAction = params.onPrimaryAction ?? ContactoService.contactEmail;
  const onSecondaryAction = params.onSecondaryAction ?? handleSalir;

  const showPrimaryAction = Boolean(primaryActionLabel);
  const showSecondaryAction = Boolean(secondaryActionLabel);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {motivo ? (
        <Text style={styles.motivo}>
          Motivo de la revisión: {motivo}
        </Text>
      ) : null}
      <View style={styles.buttonGroup}>
        {showPrimaryAction ? (
          <LogoutBtn label={primaryActionLabel} onPress={onPrimaryAction} />
        ) : null}
        {showSecondaryAction ? (
          <LogoutBtn label={secondaryActionLabel} onPress={onSecondaryAction} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
