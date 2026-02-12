const mascotaRepo = require('../repositories/mascota.repo');

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

    // Serializar BigInt a string para JSON
    const mascotasSerializadas = mascotas.map(m => ({
      ...m,
      id: m.id?.toString?.() || m.id,
      duenioId: m.duenioId?.toString?.() || m.duenioId,
    }));

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

module.exports = {
  getMascotasByDuenioController,
  createMascotaController,
  updateMascotaController,
  deleteMascotaController,
};
