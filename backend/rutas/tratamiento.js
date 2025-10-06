const express = require('express');
const router = express.Router();
const { Tratamiento, Paciente, sequelize } = require('../modelos'); // Importa sequelize

// Obtener todos los tratamientos
router.get('/listar', async (req, res) => {
  try {
    const tratamientos = await Tratamiento.findAll({
      include: { model: Paciente, as: 'paciente' },
      order: [['Fecha_ini', 'DESC']] 
    });
    res.json(tratamientos);
  } catch (error) {
    console.error('Error al listar tratamientos:', error);
    res.status(500).json({ 
      error: 'Error al obtener tratamientos',
      details: error.message 
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

// Crear tratamiento
router.post('/crear', async (req, res) => {
  try {
    const { Idtrat, Fecha_fin, ...resto } = req.body;

    // Validamos Fecha_fin
    const fechaFinValida = parseDateOrNull(Fecha_fin);

    const nuevoTratamiento = await Tratamiento.create({
      ...resto,
      Fecha_fin: fechaFinValida
    });

    res.status(201).json(nuevoTratamiento);
  } catch (error) {
    console.error('Error al crear tratamiento:', error);
    res.status(400).json({ 
      error: 'Error al crear tratamiento',
      details: error.errors?.map(e => e.message) || error.message 
    });
  }
});



// Actualizar tratamiento
router.put('/actualizar/:id', async (req, res) => {
  try {
    const tratamiento = await Tratamiento.findByPk(req.params.id);
    if (!tratamiento) {
      return res.status(404).json({ error: 'Tratamiento no encontrado' });
    }

    await tratamiento.update(req.body);
    res.json(tratamiento);
  } catch (error) {
    console.error('Error al actualizar tratamiento:', error);
    res.status(400).json({ 
      error: 'Error al actualizar tratamiento',
      details: error.errors?.map(e => e.message) || error.message 
    });
  }
});
// Obtener tratamientos por ID de paciente
router.get('/paciente/:idpac', async (req, res) => {
  try {
    const tratamientos = await Tratamiento.findAll({
      where: { Idpac: req.params.idpac },
      include: { model: Paciente, as: 'paciente' }
    });

    res.json(tratamientos);
  } catch (error) {
    console.error('Error al obtener tratamientos por paciente:', error);
    res.status(500).json({ 
      error: 'Error al obtener tratamientos por paciente',
      details: error.message 
    });
  }
});


module.exports = router;