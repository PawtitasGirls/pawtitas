const mascotaRepo = require('../repositories/mascota.repo');
const prisma = require('../config/prisma');

async function getMascotasByDuenioController(req, res) {
  try {
    const { duenioId } = req.params;

    if (!duenioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Falta ID de dueño' 
      });
    }

    let id;
    try {
      id = BigInt(duenioId);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido' 
      });
    }

    const mascotas = await mascotaRepo.findByDuenioId(id);
    const mascotaIds = mascotas.map((m) => m.id).filter((mId) => mId != null);
    const fotos = mascotaIds.length
      ? await prisma.mascotaFoto.findMany({
          where: { mascotaId: { in: mascotaIds }, field: 'profilePhoto' },
          select: { mascotaId: true },
        })
      : [];
    const fotoByMascotaId = fotos.reduce((acc, item) => {
      const key = item.mascotaId?.toString?.() || String(item.mascotaId);
      acc[key] = true;
      return acc;
    }, {});

    // Serializar BigInt a string para JSON
    const mascotasSerializadas = mascotas.map(m => ({
      ...m,
      id: m.id?.toString?.() || m.id,
      duenioId: m.duenioId?.toString?.() || m.duenioId,
      photoUrl: fotoByMascotaId[m.id?.toString?.() || String(m.id)]
        ? `/api/mascotas/${m.id?.toString?.() || m.id}/photo`
        : null,
    }));
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H1',location:'mascota.controller.js:getMascotasByDuenioController',message:'Mascotas serializadas con photoUrl',data:{host:req?.headers?.host || null,protocol:req?.protocol || null,hasMascotas:Boolean(mascotasSerializadas?.length),samplePhotoUrl:mascotasSerializadas?.[0]?.photoUrl || null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    return res.json({ 
      success: true, 
      mascotas: mascotasSerializadas 
    });
  } catch (err) {
    console.error('Error al obtener mascotas:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al obtener mascotas' 
    });
  }
}

async function createMascotaController(req, res) {
  try {
    const { nombre, tipo, raza, edad, edadUnidad, condiciones, infoAdicional, genero, duenioId } = req.body;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H1',location:'mascota.controller.js:createMascotaController',message:'Crear mascota: body recibido',data:{hasNombre:Boolean(nombre),hasTipo:Boolean(tipo),hasRaza:Boolean(raza),hasEdad:edad!=null,hasGenero:Boolean(genero),hasDuenioId:Boolean(duenioId)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // Validaciones
    if (!nombre || !tipo || !raza || edad == null || !genero || !duenioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos. Por favor, complete todos los campos obligatorios.' 
      });
    }

    let id;
    try {
      id = BigInt(duenioId);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de dueño inválido' 
      });
    }

    const mascotaData = {
      nombre,
      tipo,
      raza,
      edad: parseInt(edad, 10),
      edadUnidad: edadUnidad || 'años',
      condiciones: condiciones || null,
      infoAdicional: infoAdicional || null,
      genero,
      duenioId: id,
    };

    const nuevaMascota = await mascotaRepo.create(mascotaData);

    return res.status(201).json({ 
      success: true, 
      message: `${nombre} ha sido registrado correctamente`,
      mascota: {
        ...nuevaMascota,
        id: nuevaMascota.id?.toString?.() || nuevaMascota.id,
        duenioId: nuevaMascota.duenioId?.toString?.() || nuevaMascota.duenioId,
      }
    });
  } catch (err) {
    console.error('Error al crear mascota:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al registrar mascota' 
    });
  }
}

async function updateMascotaController(req, res) {
  try {
    const { id } = req.params;
    const { nombre, tipo, raza, edad, edadUnidad, condiciones, infoAdicional, genero } = req.body;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H2',location:'mascota.controller.js:updateMascotaController',message:'Actualizar mascota: body recibido',data:{hasId:Boolean(id),hasNombre: nombre !== undefined,hasTipo: tipo !== undefined,hasRaza: raza !== undefined,hasEdad: edad !== undefined,hasGenero: genero !== undefined},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Falta ID de mascota' 
      });
    }

    let mascotaId;
    try {
      mascotaId = BigInt(id);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido' 
      });
    }

    // Verificar que la mascota existe
    const mascotaExistente = await mascotaRepo.findById(mascotaId);
    if (!mascotaExistente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mascota no encontrada' 
      });
    }

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (tipo !== undefined) updateData.tipo = tipo;
    if (raza !== undefined) updateData.raza = raza;
    if (edad !== undefined) updateData.edad = parseInt(edad, 10);
    if (edadUnidad !== undefined) updateData.edadUnidad = edadUnidad;
    if (condiciones !== undefined) updateData.condiciones = condiciones;
    if (infoAdicional !== undefined) updateData.infoAdicional = infoAdicional;
    if (genero !== undefined) updateData.genero = genero;

    const mascotaActualizada = await mascotaRepo.update(mascotaId, updateData);

    return res.json({ 
      success: true, 
      message: `${nombre || 'Mascota'} ha sido actualizada/o correctamente`,
      mascota: {
        ...mascotaActualizada,
        id: mascotaActualizada.id?.toString?.() || mascotaActualizada.id,
        duenioId: mascotaActualizada.duenioId?.toString?.() || mascotaActualizada.duenioId,
      }
    });
  } catch (err) {
    console.error('Error al actualizar mascota:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar mascota' 
    });
  }
}

async function deleteMascotaController(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Falta ID de mascota' 
      });
    }

    let mascotaId;
    try {
      mascotaId = BigInt(id);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido' 
      });
    }

    // Verificar que la mascota existe
    const mascotaExistente = await mascotaRepo.findById(mascotaId);
    if (!mascotaExistente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mascota no encontrada' 
      });
    }

    await mascotaRepo.deleteById(mascotaId);

    return res.json({ 
      success: true, 
      message: 'Mascota eliminada correctamente' 
    });
  } catch (err) {
    // Verificar si hay reservas asociadas (constraint de FK)
    if (err.code === 'P2003') {
      return res.status(409).json({ 
        success: false, 
        message: 'No se puede eliminar: la mascota tiene reservas asociadas' 
      });
    }
    console.error('Error al eliminar mascota:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar mascota' 
    });
  }
}

async function uploadMascotaPhotoController(req, res) {
  try {
    const { id } = req.params;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d78051a-2c08-4bab-97c6-65d27df68b00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'mascota-photo-debug',hypothesisId:'H3',location:'mascota.controller.js:uploadMascotaPhotoController',message:'Upload foto mascota: entrada',data:{hasId:Boolean(id),hasFile:Boolean(req?.file?.buffer),mimeType:req?.file?.mimetype || null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!id) {
      return res.status(400).json({ success: false, message: 'Falta ID de mascota' });
    }

    let mascotaId;
    try {
      mascotaId = BigInt(id);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const mascotaExistente = await mascotaRepo.findById(mascotaId);
    if (!mascotaExistente) {
      return res.status(404).json({ success: false, message: 'Mascota no encontrada' });
    }

    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Formato incorrecto, solo puede ser jpg, jpeg o png',
      });
    }

    await prisma.mascotaFoto.deleteMany({
      where: { mascotaId, field: 'profilePhoto' },
    });

    await prisma.mascotaFoto.create({
      data: {
        mascotaId,
        field: 'profilePhoto',
        fileName: file.originalname || 'mascota-photo',
        mimeType: file.mimetype || 'application/octet-stream',
        size: typeof file.size === 'number' ? file.size : file.buffer.length,
        data: file.buffer,
      },
    });

    return res.json({
      success: true,
      data: { downloadUrl: `/api/mascotas/${id}/photo` },
    });
  } catch (err) {
    console.error('Error al subir foto de mascota:', err);
    return res.status(500).json({ success: false, message: 'Error al guardar foto de mascota' });
  }
}

async function getMascotaPhotoController(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Falta ID de mascota' });
    }

    let mascotaId;
    try {
      mascotaId = BigInt(id);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const foto = await prisma.mascotaFoto.findFirst({
      where: { mascotaId, field: 'profilePhoto' },
      orderBy: { createdAt: 'desc' },
    });

    if (!foto) {
      return res.status(404).json({
        success: false,
        message: 'No hay foto de mascota cargada',
      });
    }

    const mimeType = foto.mimeType || 'application/octet-stream';
    const fileName = foto.fileName || 'mascota-photo';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(foto.data);
  } catch (err) {
    console.error('Error al descargar foto de mascota:', err);
    return res.status(500).json({ success: false, message: 'Error al descargar' });
  }
}

module.exports = {
  getMascotasByDuenioController,
  createMascotaController,
  updateMascotaController,
  deleteMascotaController,
  uploadMascotaPhotoController,
  getMascotaPhotoController,
};
