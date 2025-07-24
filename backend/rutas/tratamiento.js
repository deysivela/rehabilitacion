const express = require('express');
const router = express.Router();
const { Tratamiento, Paciente, sequelize } = require('../modelos'); // Importa sequelize

// Obtener todos los tratamientos
router.get('/listar', async (req, res) => {
  try {
    const tratamientos = await Tratamiento.findAll({
      include: { model: Paciente, as: 'paciente' },
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

// Crear tratamiento
router.post('/crear', async (req, res) => {
  try {
    const nuevoTratamiento = await Tratamiento.create(req.body);
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
router.put('/:id', async (req, res) => {
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