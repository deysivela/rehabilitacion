const express = require('express');
const router = express.Router();
const { Sesion, CitaMedica, Tratamiento, Paciente, ProfSalud, Tecnica, Area } = require('../modelos');
const { Op } = require('sequelize');

router.post("/crear", async (req, res) => {
  try {
    const { Idcita, Hora_ini, Hora_fin, Tipo, Atencion, Notas, Novedades, Idtrat, Idtec } = req.body;

    // Validar que Idtec sea un array
    if (!Array.isArray(Idtec)) {
      return res.status(400).json({ 
        success: false, 
        message: "Idtec debe ser un array de IDs de técnicas" 
      });
    }

    const nuevaSesion = await Sesion.create({
      Idcita,
      Hora_ini,
      Hora_fin,
      Tipo,
      Atencion,
      Notas,
      Novedades,
      Idtrat,
    });

    // Asociar técnicas si existen
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

// Listar todas las sesiones
router.get('/listar', async (req, res) => {
  try {
    const sesiones = await Sesion.findAll({
      include: [
        {
          model: CitaMedica,
          as: 'cita',
          required: false,
          attributes: ['fecha_cita', 'hora_cita', 'motivo_cita'],
          include: [
            {
              model: ProfSalud,
              as: 'profesional',
              attributes: ['Idprof', 'Nombre_prof', 'Appaterno_prof', 'Apmaterno_prof']
            }
          ]
        },
        {
          model: Tecnica,
          as: 'tecnicas',
          attributes: ['Idtec', 'Descripcion'],
          through: { attributes: [] }
        },
        {
          model: Tratamiento,
          as: 'tratamiento',
          attributes: ['Idtrat', 'Fecha_ini', 'Estado'],
          include: [
            {
              model: Paciente,
              as: 'paciente',
              attributes: ['Idpac', 'Nombre_pac', 'Appaterno_pac', 'Apmaterno_pac']
            }
          ]
        }
      ],
      order: [['Hora_ini', 'DESC']]
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

// Obtener las técnicas asociadas a una sesión específica
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
  const datos = req.body;

  try {
    const sesion = await Sesion.findByPk(id);
    if (!sesion) {
      return res.status(404).json({ 
        success: false,
        message: "Sesión no encontrada" 
      });
    }

    await sesion.update(datos);
    res.json({ 
      success: true, 
      message: "Sesión actualizada correctamente" 
    });
  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar sesión',
      error: error.message
    });
  }
});

// Actualizar técnicas
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
      message: 'Error al eliminar la sesión',
      error: error.message
    });
  }
});

// Obtener sesiones por paciente
router.get('/paciente/:idPaciente', async (req, res) => {
  try {
    const { idPaciente } = req.params;

    // Validar que el ID sea un número
    if (isNaN(idPaciente)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    const sesiones = await Sesion.findAll({
      include: [
        {
          model: Tratamiento,
          as: 'tratamiento',
          where: { Idpac: idPaciente },
          attributes: ['Idtrat', 'Estado'],
          required: true
        },
        {
          model: CitaMedica,
          as: 'cita',
          attributes: ['fecha_cita', 'hora_cita'],
          include: [{
            model: ProfSalud,
            as: 'profesional',
            attributes: ['Nombre_prof', 'Appaterno_prof']
          }]
        },
        {
          model: Tecnica,
          as: 'tecnicas',
          attributes: ['Descripcion'],
          through: { attributes: [] }
        }
      ],
      order: [
        ['Hora_ini', 'DESC']
      ]
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