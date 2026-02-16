const { Resend } = require('resend');

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Enviar email de contacto
async function sendContactEmail({ nombre, email, mensaje }) {
  // Validar campos requeridos
  if (!nombre || !email || !mensaje) {
    throw new Error('Todos los campos son requeridos');
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('El email no es válido');
  }

  // Verificar que la API key de Resend esté configurada
  if (!process.env.RESEND_API_KEY) {
    console.error('Resend no configurado: falta RESEND_API_KEY');
    throw new Error('Error de configuración del servidor');
  }

  // Configurar y enviar el email con Resend
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to: process.env.CONTACTO_EMAIL || 'pawtitas.app@gmail.com',
    reply_to: email,
    subject: `Contacto desde Pawtitas - ${nombre}`,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${mensaje.replace(/\n/g, '<br>')}</p>
    `,
  });

  if (error) {
    console.error('Error al enviar email:', error);
    throw new Error(error.message || 'Error al enviar el email');
  }

  console.log('Email enviado:', data.id);
  return data;
}

/**
 * Envía email con código de recuperación de contraseña
 */
async function sendRecoveryCodeEmail({ email, codigo }) {
  if (!email || !codigo) {
    throw new Error('Email y código son requeridos');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('El email no es válido');
  }
  
  if (!process.env.RESEND_API_KEY) {
    console.error('Resend no configurado: falta RESEND_API_KEY');
    throw new Error('Error de configuración del servidor');
  }

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to: email,
    subject: 'Pawtitas - Código para recuperar tu contraseña',
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Tu código de verificación es:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${codigo}</p>
      <p>Ingresalo en la app para continuar. Si no solicitaste este código, podés ignorar este mensaje.</p>
      <p>— Equipo Pawtitas</p>
    `,
  });

  if (error) {
    console.error('Error al enviar email de recuperación:', error);
    throw new Error(error.message || 'Error al enviar el email');
  }

  console.log('Email recuperación enviado:', data.id);
  return data;
}

module.exports = {
  sendContactEmail,
  sendRecoveryCodeEmail,
};
