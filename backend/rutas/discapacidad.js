const express = require('express');
const router = express.Router();
const { Discapacidad } = require('../modelos');

// Ruta para registrar discapacidad
router.post('/registrar', async (req, res) => {
  try {
    const { Tipo_disc, Grado_disc, Obs } = req.body;

    const discp = await Discapacidad.create({ Tipo_disc, Grado_disc, Obs });
    console.log("Discapacidad creada:", discp);

    res.status(201).json(discp);
  } catch (error) {
    console.error("Error al registrar discapacidad:", error.message);
    res.status(400).json({ error: error.message });
  }
});


// Ruta para listar las discapacidades
router.get('/listar', async (req, res) => {
  try {
    const discp = await Discapacidad.findAll();
    res.json(discp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar una discapacidad
router.put('/editar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Tipo_disc, Grado_disc, Obs } = req.body;

    const discapacidad = await Discapacidad.findByPk(id);

    if (!discapacidad) {
      return res.status(404).json({ error: 'Discapacidad no encontrada' });
    }

    await discapacidad.update({
      Tipo_disc,
      Grado_disc,
      Obs
    });

    res.json({ message: 'Discapacidad actualizada correctamente', discapacidad });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;