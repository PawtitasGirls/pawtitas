import React from 'react';
import { Alert, ActionSheetIOS, Platform } from 'react-native';

// Componente para manejar el menú de configuración
export const MenuConfig = {
  showMainMenu: (onContactSupport) => {
    // iOS
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Contactar a Pawtitas'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: -1,
          title: 'Escribinos a contacto@pawtitas-ar.com y te responderemos a la brevedad.'
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            onContactSupport();
          }
        }
      );
    } else {
      // Android
      Alert.alert(
        'Contáctanos',
        'Escribinos a contacto@pawtitas-ar.com y te responderemos a la brevedad.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Contactar a Pawtitas', onPress: onContactSupport },
        ]
      );
    }
  },
};

