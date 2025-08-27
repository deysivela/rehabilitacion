const express = require('express');
const router = express.Router();
const { Sesion, Tratamiento, Paciente, ProfSalud, Tecnica, Area, Sesion_Tecnica } = require('../modelos');

router.post("/crear", async (req, res) => {
  try {
    const { Idtrat, Idpac, Idprof, Fecha, Hora_ini, Hora_fin, Tipo, Atencion, Notas, Novedades, Idtec } = req.body;

    if (!Array.isArray(Idtec)) {
      return res.status(400).json({ 
        success: false, 
        message: "Idtec debe ser un array de IDs de técnicas" 
      });
    }

    const nuevaSesion = await Sesion.create({
      Idtrat,
      Idpac,
      Idprof,
      Fecha,
      Hora_ini,
      Hora_fin,
      Tipo,
      Atencion,
      Notas,
      Novedades
    });

    if (Idtec && Idtec.length > 0) {
      const tecnicasIds = Idtec.map(id => parseInt(id));
      await nuevaSesion.addTecnicas(tecnicasIds);
    }
    
    res.status(201).json({ 
      success: true, 
      id: nuevaSesion.Idsesion,
      message: "Sesión creada con técnicas asociadas"
    });
  } catch (error) {
    console.error("Error al crear sesión:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al crear sesión",
      error: error.message 
    });
  }
});

router.get('/listar', async (req, res) => {
  try {
    const { Idprof } = req.query; // Obtener el Idprof de los query parameters
    
    const whereClause = {};
    if (Idprof) {
      whereClause.Idprof = Idprof; // Agregar filtro por profesional si existe
    }

    const sesiones = await Sesion.findAll({
      where: whereClause, // Aplicar el filtro aquí
      attributes: ['Idsesion', 'Idpac','Idtrat', 'Idprof', 'Fecha', 'Hora_ini', 'Hora_fin', 'Tipo', 'Atencion', 'Notas', 'Novedades'],
      include: [
        {
          model: Tecnica,
          as: 'tecnicas',
          attributes: ['Idtec', 'Descripcion'],
          through: { attributes: [] }
        },
        {
          model: Tratamiento,
          as: 'tratamiento',
          attributes: ['Idtrat','nombre', 'Fecha_ini', 'Estado'],
          include: [
            {
              model: Paciente,
              as: 'paciente',
              attributes: ['Nombre_pac', 'Appaterno_pac', 'Apmaterno_pac']
            }
          ]
        },
        {
          model: ProfSalud,
          as: 'profesional',
          attributes: ['Nombre_prof', 'Appaterno_prof', 'Apmaterno_prof']
        }
      ],
      order: [['Fecha', 'DESC'], ['Hora_ini', 'DESC']]
    });

    res.json({
      success: true,
      data: sesiones
    });
  } catch (error) {
    console.error('Error al listar sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar sesiones',
      error: error.message
    });
  }
});

// Obtener pacientes únicos por profesional
router.get('/pacientes/:idprof', async (req, res) => {
  try {
    const tratamientos = await Tratamiento.findAll({
      where: { Idprof: req.params.idprof },
      include: { 
        model: Paciente, 
        as: 'paciente',
        attributes: ['Idpac', 'Nombre_pac', 'Appaterno_pac', 'Apmaterno_pac']
      },
      attributes: [] // No necesitamos datos de tratamiento
    });

    // Extraer pacientes únicos
    const pacientesUnicos = [];
    const idsPacientes = new Set();
    
    tratamientos.forEach(trat => {
      if (trat.paciente && !idsPacientes.has(trat.paciente.Idpac)) {
        idsPacientes.add(trat.paciente.Idpac);
        pacientesUnicos.push(trat.paciente);
      }
    });

    res.json(pacientesUnicos);
  } catch (error) {
    console.error('Error al obtener pacientes por profesional:', error);
    res.status(500).json({ 
      error: 'Error al obtener pacientes',
      details: error.message 
    });
  }
});
router.get('/:id/tecnicas', async (req, res) => {
  try {
    const { id } = req.params;

    const sesion = await Sesion.findByPk(id, {
      include: [
        {
          model: Tecnica,
          as: 'tecnicas',
          attributes: ['Idtec', 'Descripcion', 'Idarea'],
          include: [
            {
              model: Area,
              as: 'area',
              attributes: ['Nombre']
            }
          ],
          through: { attributes: [] }
        }
      ]
    });

    if (!sesion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sesión no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      tecnicas: sesion.tecnicas 
    });
  } catch (error) {
    console.error('Error al obtener técnicas de sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener técnicas de sesión',
      error: error.message
    });
  }
});

router.put("/editar/:id", async (req, res) => {
  const { id } = req.params;
  const { Idtrat, Idpac, Idprof, Fecha, Hora_ini, Hora_fin, Tipo, Atencion, Notas, Novedades } = req.body;

  try {
    const sesion = await Sesion.findByPk(id);
    if (!sesion) {
      return res.status(404).json({ success: false, message: "Sesión no encontrada" });
    }

    await sesion.update({
      Idtrat,
      Idpac,
      Idprof,
      Fecha,
      Hora_ini,
      Hora_fin,
      Tipo,
      Atencion,
      Notas,
      Novedades
    });

    res.json({ success: true, message: "Sesión actualizada correctamente" });
  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar sesión', error: error.message });
  }
});

router.post("/editar/:id/tecnicas", async (req, res) => {
  try {
    const { id } = req.params;
    const { Idtec } = req.body;

    const sesion = await Sesion.findByPk(id);
    if (!sesion) {
      return res.status(404).json({ 
        success: false, 
        message: "Sesión no encontrada" 
      });
    }

    if (!Array.isArray(Idtec)) {
      return res.status(400).json({ 
        success: false, 
        message: "Idtec debe ser un array de IDs de técnicas" 
      });
    }

    await sesion.setTecnicas(Idtec);
    
    res.json({ 
      success: true,
      message: "Técnicas actualizadas correctamente"
    });
  } catch (error) {
    console.error("Error al asignar técnicas:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al asignar técnicas",
      error: error.message 
    });
  }
});

// Eliminar sesión
// Eliminar sesión
router.delete('/eliminar/:id', async (req, res) => {
  // Iniciar transacción a través del modelo Sesion
  const transaction = await Sesion.sequelize.transaction();
  
  try {
    // 1. Primero eliminar las relaciones en sesion_tecnica
    await Sesion_Tecnica.destroy({
      where: { Idsesion: req.params.id },
      transaction
    });

    // 2. Luego eliminar la sesión
    await Sesion.destroy({
      where: { Idsesion: req.params.id },
      transaction
    });

    await transaction.commit();
    res.json({ success: true, message: 'Sesión eliminada correctamente' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar sesión:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar sesión',
      error: error.message
    });
  }
});

router.get('/paciente/:idPaciente', async (req, res) => {
  try {
    const { idPaciente } = req.params;

    if (isNaN(idPaciente)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    const sesiones = await Sesion.findAll({
      where: { Idpac: idPaciente },
      attributes: ['Idsesion', 'Idpac', 'Idprof', 'Fecha', 'Hora_ini', 'Hora_fin', 'Tipo', 'Atencion', 'Notas', 'Novedades'],
      include: [
        {
          model: Tratamiento,
          as: 'tratamiento',
          where: { Idpac: idPaciente },
          attributes: ['Idtrat', 'Estado'],
          required: true
        },
        {
          model: ProfSalud,
          as: 'profesional',
          attributes: ['Nombre_prof', 'Appaterno_prof']
        },
        {
          model: Tecnica,
          as: 'tecnicas',
          attributes: ['Descripcion'],
          through: { attributes: [] }
        }
      ],
      order: [['Hora_ini', 'DESC']]
    });

    if (sesiones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron sesiones para este paciente'
      });
    }

    res.json({
      success: true,
      count: sesiones.length,
      data: sesiones
    });

  } catch (error) {
    console.error('Error al obtener sesiones por paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sesiones del paciente',
      error: error.message
    });
  }
});

module.exports = router;