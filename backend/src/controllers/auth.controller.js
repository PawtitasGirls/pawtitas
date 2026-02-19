const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const usuarioRepo = require('../repositories/usuario.repo');
const prestadorRepo = require('../repositories/prestador.repo');
const mascotaRepo = require('../repositories/mascota.repo');
const { registerUser } = require('../services/registro.service');
const { sendRecoveryCodeEmail } = require('../services/email.service');
const streamChatService = require('../services/streamChat.service');
const { buildPublicUrl } = require('../utils/publicUrl');

// Login
async function loginController(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Faltan email y/o password' });
    }

    // Verificar si es admin
    const admin = await prisma.admin.findUnique({ where: { email } });
    const isAdminPasswordValid = admin
      ? await bcrypt.compare(password, admin.password)
      : false;
    if (admin && isAdminPasswordValid) {
      return res.json({
        success: true,
        admin: true,
        user: false,
        userData: {
          id: admin.id?.toString?.() || admin.id,
          nombre: 'Administrador',
          apellido: '',
          email: admin.email,
          rol: 'ADMIN',
        },
      });
    }

    // Verificar si es usuario
    const usuario = await usuarioRepo.findByEmail(email);

    const isValidPassword = usuario
      ? await bcrypt.compare(password, usuario.clave)
      : false;

    if (!usuario || !isValidPassword) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const userData = {
      id: usuario.id?.toString?.() || usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      avatar: buildPublicUrl(req, usuario.avatar),
      email: usuario.email,
      celular: usuario.celular,
      activo: usuario.activo,
      rol: usuario.rol,
      domicilio: usuario.domicilio
        ? {
            calle: usuario.domicilio.calle,
            numero: usuario.domicilio.numero,
            ciudad: usuario.domicilio.ciudad,
          }
        : null,
      creadoEn: usuario.creadoEn,
    };

    if (usuario.rol === 'DUENIO' && usuario.duenio) {
      userData.duenioId = usuario.duenio.id?.toString?.() || usuario.duenio.id;
      if (usuario.duenio.comentarios) {
        userData.descripcion = usuario.duenio.comentarios;
      }
      
      // Contar las mascotas del dueño
      const mascotas = await mascotaRepo.findByDuenioId(usuario.duenio.id);
      userData.petsCount = mascotas.length;
    }

  // Agregar datos del servicio si es prestador
  if (usuario.rol === 'PRESTADOR') {
    const prestador = await prestadorRepo.findByUsuarioId(usuario.id);
    const servicio = prestador?.prestadorservicio?.[0]?.servicio;

    Object.assign(userData, {
      prestadorId: prestador?.id != null ? String(prestador.id) : null,
      descripcion: servicio?.descripcion ?? userData.descripcion,
      perfil: prestador?.perfil ?? userData.perfil,
      tipoMascota: servicio?.tipoMascota ?? userData.tipoMascota,
      horarios: servicio?.horarios ?? userData.horarios,
      precio: servicio?.precio ?? userData.precio,
      serviceActive: servicio?.disponible != null ? Boolean(servicio.disponible) : userData.serviceActive,
      estadoPrestador: prestador?.estado ?? 'PENDIENTE',
      motivoRechazo: prestador?.motivoRechazo ?? null,
    });
  }
  let tokenStream = null;
  try {
    tokenStream = await streamChatService.createUserToken(String(userData.id));
  } catch (err) {
    console.error('Stream token error:', err);
  }

  return res.json({ success: true, admin: false, user: true, userData, tokenStream });  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
}

// Registro
async function registroController(req, res) {
  try {
    const perfil = (req.body && req.body.perfil) ? String(req.body.perfil).toLowerCase() : '';
    const isPrestador = perfil === 'prestador';
    const fileKeys = req.files ? Object.keys(req.files) : [];
    const docFile = req.files?.documentosFile?.[0];
    const certFile = req.files?.certificadosFile?.[0];
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.controller.js:registroController',message:'registro multipart',data:{perfil,isPrestador,fileKeys,hasDocBuffer:!!docFile?.buffer,hasCertBuffer:!!certFile?.buffer},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    console.log('[REGISTRO] perfil=', perfil, 'isPrestador=', isPrestador, 'req.files keys=', fileKeys, 'hasBuffer doc=', !!docFile?.buffer, 'cert=', !!certFile?.buffer);

    if (isPrestador) {
      if (!docFile) {
        return res.status(400).json({ success: false, message: 'documentosFile es requerido' });
      }
      if (!certFile) {
        return res.status(400).json({ success: false, message: 'certificadosFile es requerido' });
      }
    }

    const documentosFile = docFile || req.body?.documentosFile || null;
    const certificadosFile = certFile || req.body?.certificadosFile || null;

    const result = await registerUser({
      ...(req.body || {}),
      documentosFile,
      certificadosFile,
    });

    return res.status(201).json({ success: true, user: result });
  } catch (err) {
    if (err.code === 'P2002') {
      return res
        .status(409)
        .json({ success: false, message: 'Email o documento ya registrado' });
    }
    console.error('registro error', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error al registrar',
      detail: err?.message || String(err),
      code: err?.code,
    });
  }
}

/** Genera un código de 6 dígitos para recuperación */
function generarCodigoRecuperacion() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Solicitar código de recuperación: recibe email, genera código, guarda en usuario y envía email.
 */
async function solicitarCodigoRecuperacion(req, res) {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email es requerido' });
    }
    const usuario = await usuarioRepo.findByEmail(email.trim());
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'No existe una cuenta con ese email' });
    }
    const codigo = generarCodigoRecuperacion();
    await usuarioRepo.update(usuario.id, { codigoRecuperarContrasena: codigo });
    await sendRecoveryCodeEmail({ email: usuario.email, codigo });
    return res.json({ success: true, message: 'Se envió un código a tu email' });
  } catch (err) {
    console.error('solicitarCodigoRecuperacion error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'No se pudo enviar el código',
    });
  }
}

/**
 * Verificar código: recibe email y codigo. Si coinciden, permite continuar al cambio de clave.
 */
async function verificarCodigoRecuperacion(req, res) {
  try {
    const { email, codigo } = req.body || {};
    if (!email || !codigo) {
      return res.status(400).json({ success: false, message: 'Email y código son requeridos' });
    }
    const usuario = await usuarioRepo.findByEmail(email.trim());
    if (!usuario || !usuario.codigoRecuperarContrasena) {
      return res.status(400).json({ success: false, message: 'Código inválido o expirado' });
    }
    if (usuario.codigoRecuperarContrasena !== String(codigo).trim()) {
      return res.status(400).json({ success: false, message: 'Código incorrecto' });
    }
    return res.json({ success: true, message: 'Código correcto' });
  } catch (err) {
    console.error('verificarCodigoRecuperacion error:', err);
    return res.status(500).json({ success: false, message: 'Error al verificar' });
  }
}

/**
 * Actualizar clave tras recuperación: email, codigo, nuevaClave. Verifica código y actualiza.
 */
async function actualizarClaveRecuperacion(req, res) {
  try {
    const { email, codigo, nuevaClave } = req.body || {};
    if (!email || !codigo || !nuevaClave) {
      return res.status(400).json({ success: false, message: 'Faltan email, código o nueva contraseña' });
    }
    if (nuevaClave.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    const usuario = await usuarioRepo.findByEmail(email.trim());
    if (!usuario || usuario.codigoRecuperarContrasena !== String(codigo).trim()) {
      return res.status(400).json({ success: false, message: 'Código inválido o expirado' });
    }
    const claveHash = await bcrypt.hash(nuevaClave, 10);
    await usuarioRepo.update(usuario.id, {
      clave: claveHash,
      codigoRecuperarContrasena: null,
    });
    return res.json({ success: true, message: 'Contraseña actualizada. Ya podés iniciar sesión.' });
  } catch (err) {
    console.error('actualizarClaveRecuperacion error:', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar la contraseña' });
  }
}

module.exports = {
  loginController,
  registroController,
  solicitarCodigoRecuperacion,
  verificarCodigoRecuperacion,
  actualizarClaveRecuperacion,
};
