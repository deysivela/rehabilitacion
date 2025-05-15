const express = require('express');
const router = express.Router();
const { Diagnostico, Paciente, ProfSalud } = require('../modelos');

// Obtener todos los diagnósticos
router.get('/listar', async (req, res) => {
  try {
    const diagnosticos = await Diagnostico.findAll({
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['Idpac', 'Nombre_pac', 'Appaterno_pac', 'Apmaterno_pac']
        },
        {
          model: ProfSalud,
          as: 'profesional',
          attributes: ['Idprof', 'Nombre_prof', 'Appaterno_prof', 'Apmaterno_prof']
        }
      ],
      order: [['Iddiagnostico', 'DESC']]
    });
    res.json(diagnosticos);
  } catch (error) {
    console.error('Error al obtener diagnósticos:', error);
    res.status(500).json({ error: 'Error al obtener los diagnósticos', detalles: error.message });
  }
});

// Obtener un diagnóstico por ID
router.get('/:id', async (req, res) => {
  try {
    const diagnostico = await Diagnostico.findByPk(req.params.id, {
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['Idpac', 'Nombre_pac', 'Appaterno_pac', 'Apmaterno_pac']
        },
        {
          model: ProfSalud,
          as: 'profesional',
          attributes: ['Idprof', 'Nombre_prof', 'Appaterno_prof', 'Apmaterno_prof']
        }
      ]
    });

    if (!diagnostico) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    res.json(diagnostico);
  } catch (error) {
    console.error('Error al obtener diagnóstico:', error);
    res.status(500).json({ error: 'Error al obtener el diagnóstico', detalles: error.message });
  }
});

// Crear un nuevo diagnóstico
router.post('/crear', async (req, res) => {
  try {
    const { Detalle_diag, idprof, Idpac } = req.body;

    if (!Detalle_diag || !idprof || !Idpac) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        detalles: 'Detalle_diag, idprof e Idpac son campos obligatorios'
      });
    }

    const nuevoDiagnostico = await Diagnostico.create({ Detalle_diag, idprof, Idpac });

    const diagnosticoCompleto = await Diagnostico.findByPk(nuevoDiagnostico.Iddiagnostico, {
      include: [
        { model: Paciente, as: 'paciente' },
        { model: ProfSalud, as: 'profesional' }
      ]
    });

    res.status(201).json(diagnosticoCompleto);
  } catch (error) {
    console.error('Error al crear diagnóstico:', error);
    res.status(500).json({
      error: 'Error al crear el diagnóstico',
      detalles: error.message
    });
  }
});

// Editar un diagnóstico
router.put('/editar/:id', async (req, res) => {
  try {
    const { Detalle_diag, idprof, Idpac } = req.body;
    const { id } = req.params;

    const diagnostico = await Diagnostico.findByPk(id);

    if (!diagnostico) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    // Actualizar solo campos permitidos
    await diagnostico.update({ Detalle_diag, idprof, Idpac });

    const diagnosticoActualizado = await Diagnostico.findByPk(id, {
      include: [
        { model: Paciente, as: 'paciente' },
        { model: ProfSalud, as: 'profesional' }
      ]
    });

    res.json(diagnosticoActualizado);
  } catch (error) {
    console.error('Error al actualizar diagnóstico:', error);
    res.status(500).json({
      error: 'Error al actualizar el diagnóstico',
      detalles: error.message
    });
  }
});

// Eliminar un diagnóstico
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const diagnostico = await Diagnostico.findByPk(req.params.id);

    if (!diagnostico) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    await diagnostico.destroy();
    res.json({ mensaje: 'Diagnóstico eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar diagnóstico:', error);
    res.status(500).json({
      error: 'Error al eliminar el diagnóstico',
      detalles: error.message
    });
  }
});

// Diagnósticos por paciente
router.get('/paciente/:idPaciente', async (req, res) => {
  try {
    const diagnosticos = await Diagnostico.findAll({
      where: { Idpac: req.params.idPaciente },
      include: [
        {
          model: ProfSalud,
          as: 'profesional',
          attributes: ['Idprof', 'Nombre_prof', 'Appaterno_prof', 'Apmaterno_prof']
        }
      ],
      order: [['Iddiagnostico', 'DESC']]
    });

    res.json(diagnosticos);
  } catch (error) {
    console.error('Error al obtener diagnósticos por paciente:', error);
    res.status(500).json({
      error: 'Error al obtener diagnósticos del paciente',
      detalles: error.message
    });
  }
});

// Diagnósticos por profesional
router.get('/profesional/:idProfesional', async (req, res) => {
  try {
    const diagnosticos = await Diagnostico.findAll({
      where: { idprof: req.params.idProfesional },
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['Idpac', 'Nombre_pac', 'Appaterno_pac', 'Apmaterno_pac']
        }
      ],
      order: [['Iddiagnostico', 'DESC']]
    });

    res.json(diagnosticos);
  } catch (error) {
    console.error('Error al obtener diagnósticos por profesional:', error);
    res.status(500).json({
      error: 'Error al obtener diagnósticos del profesional',
      detalles: error.message
    });
  }
});

module.exports = router;
