const express = require('express');
const router = express.Router();
const db = require('../modelos'); 
const Tecnica = db.Tecnica;
const Area = db.Area;

router.get('/listar', async (req, res) => {
  try {
    const tecnicas = await Tecnica.findAll({
      include: {
        model: Area,
        as: 'area',
        attributes: ['Idarea', 'Nombre'] 
      },
    });
    res.json(tecnicas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una técnica por ID
router.get('/:id', async (req, res) => {
  try {
    const tecnica = await Tecnica.findByPk(req.params.id, {
      include: {
        model: Area,
        as: 'area',
        attributes: ['Idarea', 'Nombre']
      },
    });
    if (!tecnica) return res.status(404).json({ mensaje: 'Técnica no encontrada' });
    res.json(tecnica);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva técnica
router.post('/crear', async (req, res) => {
  try {
    const { Descripcion, Idarea } = req.body;
    const nuevaTecnica = await Tecnica.create({ Descripcion, Idarea });
    res.status(201).json(nuevaTecnica);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una técnica
router.put('/editar/:id', async (req, res) => {
  try {
    const { Descripcion, Idarea } = req.body;
    const tecnica = await Tecnica.findByPk(req.params.id);
    if (!tecnica) return res.status(404).json({ mensaje: 'Técnica no encontrada' });

    tecnica.Descripcion = Descripcion;
    tecnica.Idarea = Idarea;
    await tecnica.save();

    res.json(tecnica);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
