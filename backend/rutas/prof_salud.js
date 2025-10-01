const express = require('express');
const router = express.Router();
const ProfSalud = require('../modelos/ProfSalud');

// GET /prof_salud/listar
router.get('/listar', async (req, res) => {
  try {
    const lista = await ProfSalud.findAll();
    res.json(lista);
  } catch (err) {
    console.error('Error al listar profesionales:', err);
    res.status(500).json({ error: 'Error al listar profesionales' });
  }
});

// POST /prof_salud/crear
router.post('/crear', async (req, res) => {
  try {
    const nuevo = await ProfSalud.create(req.body);
    // IMPORTANTE: devolver el registro creado
    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error al crear profesional:', err);
    res.status(500).json({ error: 'Error al crear profesional', details: err.message });
  }
});

// PUT /prof_salud/actualizar/:id
router.put('/actualizar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await ProfSalud.update(req.body, { where: { Idprof: id } });
    const actualizado = await ProfSalud.findByPk(id);
    res.json(actualizado);
  } catch (err) {
    console.error('Error al actualizar profesional:', err);
    res.status(500).json({ error: 'Error al actualizar profesional' });
  }
});

// DELETE /prof_salud/eliminar/:id
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await ProfSalud.destroy({ where: { Idprof: id } });
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar profesional:', err);
    res.status(500).json({ error: 'Error al eliminar profesional' });
  }
});

module.exports = router;
