const express = require('express');
const router = express.Router();
const { Discapacidad, Paciente } = require('../modelos');

// Ruta para registrar discapacidad
router.post('/registrar', async (req, res) => {
  try {
    
    const { Tipo_disc, Grado_disc, Obs } = req.body;

    const discapacidad = await Discapacidad.create({ 
      Tipo_disc: Tipo_disc || '', 
      Grado_disc: Grado_disc || '', 
      Obs: Obs || '' 
    });

    res.status(201).json({
      Iddisc: discapacidad.Iddisc,
      Tipo_disc: discapacidad.Tipo_disc,
      Grado_disc: discapacidad.Grado_disc,
      Obs: discapacidad.Obs
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener discapacidad por paciente
router.get('/paciente/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido',
        details: 'Se requiere un ID numérico'
      });
    }

    const paciente = await Paciente.findOne({
      where: { Idpac: id },
      include: {
        model: Discapacidad,
        as: 'detalleDiscapacidad',
        required: false,
        attributes: ['Iddisc', 'Tipo_disc', 'Grado_disc', 'Obs']
      }
    });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    const tieneDisc = paciente.Tienediscapacidad === true || 
                     paciente.Tienediscapacidad === 1 || 
                     paciente.Tienediscapacidad === '1' || 
                     (typeof paciente.Tienediscapacidad === 'string' && 
                      paciente.Tienediscapacidad.toLowerCase() === 'sí');

    res.json({
      success: true,
      tieneDiscapacidad: tieneDisc,
      discapacidad: tieneDisc ? paciente.detalleDiscapacidad : null
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: error.message
    });
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

// Ruta para eliminar una discapacidad
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const discapacidad = await Discapacidad.findByPk(id);

    if (!discapacidad) {
      return res.status(404).json({ error: 'Discapacidad no encontrada' });
    }

    await discapacidad.destroy();

    res.json({ message: 'Discapacidad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;