const express = require('express');
const Area = require('../modelos/Area');
const router = express.Router();

// Crear una nueva área
router.post('/crear', async (req, res) => {
  const { Nombre, Descripcion } = req.body;

  try {
    if (!Nombre) {
      return res.status(400).json({ message: 'El nombre del área es obligatorio' });
    }

    const areaExistente = await Area.findOne({ where: { Nombre } });
    if (areaExistente) {
      return res.status(400).json({ message: 'El área ya existe' });
    }

    const nuevaArea = await Area.create({ Nombre, Descripcion });
    res.status(201).json({ message: 'Área creada exitosamente', area: nuevaArea });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el área', error });
  }
});

// Listar todas las áreas
router.get('/listar', async (req, res) => {
  try {
    const areas = await Area.findAll();
    res.status(200).json(areas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las áreas', error });
  }
});

// Eliminar área
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Area.destroy({ where: { Idarea: id } });

    if (!deleted) {
      return res.status(404).json({ error: "El área no existe." });
    }

    res.json({ message: "Área eliminada correctamente." });
  } catch (error) {
    console.error(error);

    // Si el error es por la FK
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({ 
        error: "No se puede eliminar el área porque tiene profesionales de salud asociados." 
      });
    }

    // Cualquier otro error
    res.status(500).json({ 
      error: `Hubo un problema al eliminar el área: ${error.message}` 
    });
  }
});

// Actualizar
router.put('/actualizar/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await Area.update(req.body, { where: { Idarea: id } });
      const upd = await Area.findByPk(id);
      res.json(upd);
    } catch (err) {
      console.error('Error al actualizar área:', err);
      res.status(500).json({ error: 'Error al actualizar área' });
    }
  });

module.exports = router;
