// Entry point para la app principal
import { registerRootComponent } from 'expo';
import App from '../main-app/App';
import Constants from 'expo-constants';

// Logs para debugging
console.log('App Principal iniciada');
console.log(`APP_TYPE: ${Constants.expoConfig?.extra?.appType || 'no definido'}`);

// Registrar el componente raíz para la app principal
registerRootComponent(App);
