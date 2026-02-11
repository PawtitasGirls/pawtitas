// Punto de entrada principal que decide qué aplicación cargar
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determinar qué punto de entrada cargar basado en EXPO_PUBLIC_APP_TYPE
const appType = Constants.expoConfig?.extra?.appType || 'app';

console.log(`📱 Platform: ${Platform.OS}`);
console.log(`🔍 EXPO_PUBLIC_APP_TYPE: ${Constants.expoConfig?.extra?.appType || 'no definido'}`);

// Cargar el entry point apropiado según appType
if (appType === 'landing') {
  console.log('📱 Cargando Landing Page...');
  require('./entry-points/landing');
} else {
  console.log('📱 Cargando App Principal...');
  require('./entry-points/app');
}
