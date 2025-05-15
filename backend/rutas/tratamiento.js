const express = require('express');
const router = express.Router();
const { Tratamiento, Paciente } = require('../modelos');

// Obtener todos los tratamientos
router.get('/listar', async (req, res) => {
  try {
    const tratamientos = await Tratamiento.findAll({
      include: { model: Paciente, as: 'paciente' },
    });
    res.json(tratamientos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tratamientos' });
  }
});


// Crear tratamiento
router.post('/crear', async (req, res) => {
  try {
    const nuevoTratamiento = await Tratamiento.create(req.body);
    res.status(201).json(nuevoTratamiento);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear tratamiento' });
  }
});

// Actualizar tratamiento
router.put('/:id', async (req, res) => {
  try {
    const tratamiento = await Tratamiento.findByPk(req.params.id);
    if (tratamiento) {
      await tratamiento.update(req.body);
      res.json(tratamiento);
    } else {
      res.status(404).json({ error: 'Tratamiento no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar tratamiento' });
  }
});

module.exports = router;
