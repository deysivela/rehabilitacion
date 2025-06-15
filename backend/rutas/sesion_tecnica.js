const express = require('express');
const router = express.Router();
const db = require('../modelos'); 

// Crear asignaciones técnicas a una sesión
router.post('/crear', async (req, res) => {
  try {
    const { Idsesion, Idtecnicas } = req.body;
    if (!Idsesion || !Array.isArray(Idtecnicas)) {
      return res.status(400).json({ mensaje: 'Idsesion y Idtecnicas son requeridos y deben ser válidos' });
    }

    const relaciones = Idtecnicas.map(Idtec => ({ Idsesion, Idtec }));
    await db.Sesion_Tecnica.bulkCreate(relaciones);

    res.status(201).json({ mensaje: 'Técnicas asignadas a la sesión correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/listar', async (req, res) => {
  try {
    const asignaciones = await db.Sesion_Tecnica.findAll({
      include: [
        {
          model: db.Sesion,
          attributes: ['Idsesion',  'Hora_ini'] // Ajusta a tus campos reales
        },
        {
          model: db.Tecnica,
          attributes: ['Idtec', 'Descripcion'] // Ajusta a tus campos reales
        }
      ]
    });

    res.status(200).json(asignaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
