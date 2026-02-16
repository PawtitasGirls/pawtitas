const transporter = require('../config/mailer');

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

  // Verificar que las credenciales SMTP estén configuradas
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP no configurado: faltan SMTP_USER o SMTP_PASS');
    throw new Error('Error de configuración del servidor');
  }

  // Configurar el email
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.CONTACTO_EMAIL || process.env.SMTP_USER,
    replyTo: email,
    subject: `Contacto desde Pawtitas - ${nombre}`,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${mensaje.replace(/\n/g, '<br>')}</p>
    `,
    text: `
      Nuevo mensaje de contacto
      
      Nombre: ${nombre}
      Email: ${email}
      Mensaje: ${mensaje}
    `,
  };

  // Enviar email
  const info = await transporter.sendMail(mailOptions);
  console.log('Email enviado:', info.messageId);

  return info;
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
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP no configurado: faltan SMTP_USER o SMTP_PASS');
    throw new Error('Error de configuración del servidor');
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Pawtitas - Código para recuperar tu contraseña',
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Tu código de verificación es:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${codigo}</p>
      <p>Ingresalo en la app para continuar. Si no solicitaste este código, podés ignorar este mensaje.</p>
      <p>— Equipo Pawtitas</p>
    `,
    text: `Recuperación de contraseña - Tu código: ${codigo}. Ingresalo en la app para continuar.`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email recuperación enviado:', info.messageId);
  return info;
}

module.exports = {
  sendContactEmail,
  sendRecoveryCodeEmail,
};
