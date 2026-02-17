import { Alert, Linking } from 'react-native';

// Servicio para manejar las comunicaciones de contacto
export const ContactoService = {
  // Abrir cliente de email con información del usuario
  contactEmail: (userInfo = {}) => {
    const userContext = userInfo.email
      ? `\n\n---\nUsuario: ${userInfo.email}${userInfo.id ? `\nID: ${userInfo.id}` : ''}`
      : '';

    const email = 'contacto@pawtitas-ar.com';
    const subject = 'Contacto - Pawtitas App';
    const body = `Hola equipo de Pawtitas,\n\n[Describe tu consulta aquí]${userContext}`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(mailtoUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mailtoUrl);
        }

        Alert.alert(
          'No pudimos abrir tu app de correo',
          `Abrí tu correo y escribinos a:\n\n${email}\n\nAsunto sugerido: ${subject}`,
          [{ text: 'Entendido' }]
        );
      })
      .catch(() => {
        Alert.alert(
          'No pudimos abrir tu app de correo',
          `Abrí tu correo y escribinos a:\n\n${email}\n\nAsunto sugerido: ${subject}`,
          [{ text: 'Entendido' }]
        );
      });
  }
};

