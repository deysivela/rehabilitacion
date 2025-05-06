const express = require('express');
const router = express.Router();
const { Sesion, CitaMedica, Tratamiento, Paciente, ProfSalud } = require('../modelos');
const { Op } = require('sequelize');

// Middleware para validar datos de sesión (actualizado)
const validarSesion = (req, res, next) => {
  const { Hora_ini, Hora_fin, Tipo, Idtrat } = req.body;
  
  if (!Hora_ini || !Hora_fin || !Tipo || !Idtrat) {
    return res.status(400).json({ 
      mensaje: 'Faltan campos requeridos: Hora_ini, Hora_fin, Tipo, Idtrat' 
    });
  }
  
  if (Hora_ini >= Hora_fin) {
    return res.status(400).json({ 
      mensaje: 'La hora de inicio debe ser anterior a la hora de fin' 
    });
  }
  
  next();
};

// Listar todas las sesiones (actualizado)
router.get('/listar', async (req, res) => {
  try {
    const sesiones = await Sesion.findAll({
      include: [
        {
          model: CitaMedica,
          as: 'cita',
          required: false,
          attributes: ['fecha_cita', 'hora_cita', 'motivo_cita'],
          include: [{
            model: ProfSalud,
            as: 'profesional',
            attributes: ['Idprof', 'Nombre_prof', 'Appaterno_prof', 'Apmaterno_prof']
          }]
        },
        {
          model: Tratamiento,
          as: 'tratamiento',
          attributes: ['Idtrat', 'Fecha_ini', 'Estado'],
          include: [{
            model: Paciente,
            as: 'paciente',
            attributes: ['Idpac', 'Nombre_pac', 'Appaterno_pac', 'Apmaterno_pac']
          }]
        }
      ],
      order: [['Hora_ini', 'DESC']]
    });

    console.log('Sesiones desde la base de datos:', sesiones); // <-- AÑADE ESTO

    res.json({
      success: true,
      data: sesiones
    });
  } catch (error) {
    console.error('Error al listar sesiones:', error); // <-- Esto también es importante
    res.status(500).json({
      success: false,
      message: 'Error al listar sesiones'
    });
  }
});




// Crear nueva sesión (actualizado)
router.post('/crear', validarSesion, async (req, res) => {
  const { Idcita, Hora_ini, Hora_fin, Tipo, Notas, Novedades, Idtrat } = req.body;

  try {
    // Verificar que el tratamiento exista
    const tratamiento = await Tratamiento.findByPk(Idtrat);
    if (!tratamiento) {
      return res.status(404).json({ mensaje: 'El tratamiento no existe' });
    }

    // Crear la sesión
    const nuevaSesion = await Sesion.create({
      Idcita,
      Hora_ini,
      Hora_fin,
      Tipo,
      Notas,
      Novedades,
      Idtrat
    });

    res.status(201).json(nuevaSesion);
  } catch (error) {
    console.error('Error al crear sesión:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear la sesión' 
    });
  }
});

// Actualizar sesión (actualizado)
router.put('/editar/:id', validarSesion, async (req, res) => {
  try {
    const sesion = await Sesion.findByPk(req.params.id);
    if (!sesion) {
      return res.status(404).json({ 
        success: false,
        message: 'Sesión no encontrada' 
      });
    }

    await sesion.update(req.body);
    res.json({
      success: true,
      data: sesion
    });
  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar la sesión' 
    });
  }
});

// Eliminar sesión (sin cambios)
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const sesion = await Sesion.findByPk(req.params.id);
    if (!sesion) {
      return res.status(404).json({ 
        success: false,
        message: 'Sesión no encontrada' 
      });
    }

    await sesion.destroy();
    res.json({
      success: true,
      message: 'Sesión eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar la sesión' 
    });
  }
});

// Obtener sesiones por tratamiento (actualizado)
router.get('/por-tratamiento/:idTratamiento', async (req, res) => {
  try {
    const sesiones = await Sesion.findAll({
      where: { Idtrat: req.params.idTratamiento },
      include: [
        { 
          model: CitaMedica, 
          as: 'cita',
          include: [{
            model: ProfSalud,
            as: 'profesional'
          }]
        }
      ],
      order: [
        ['Hora_ini', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: sesiones
    });
  } catch (error) {
    console.error('Error al obtener sesiones por tratamiento:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener sesiones por tratamiento' 
    });
  }
});

module.exports = router;