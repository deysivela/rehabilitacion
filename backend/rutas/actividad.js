const express = require('express');
const router = express.Router();
const Actividad = require('../modelos/Actividad');

// Listar todas las actividades
router.get('/listar', async (req, res) => {
  try {
    const actividades = await Actividad.findAll();
    res.json(actividades);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar actividades' });
  }
});

// Crear nueva actividad
router.post('/crear', async (req, res) => {
  try {
    const nuevaActividad = await Actividad.create(req.body);
    res.status(201).json(nuevaActividad);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear actividad' });
  }
});

// Obtener actividad por ID
router.get('/obtener/:id', async (req, res) => {
  try {
    const actividad = await Actividad.findByPk(req.params.id);
    if (actividad) {
      res.json(actividad);
    } else {
      res.status(404).json({ error: 'Actividad no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener actividad' });
  }
});

// Actualizar actividad
router.put('/actualizar/:id', async (req, res) => {
  try {
    const [updated] = await Actividad.update(req.body, {
      where: { Idact: req.params.id }
    });
    if (updated) {
      res.json({ mensaje: 'Actividad actualizada correctamente' });
    } else {
      res.status(404).json({ error: 'Actividad no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar actividad' });
  }
});

// Eliminar actividad
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const deleted = await Actividad.destroy({
      where: { Idact: req.params.id }
    });
    if (deleted) {
      res.json({ mensaje: 'Actividad eliminada correctamente' });
    } else {
      res.status(404).json({ error: 'Actividad no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar actividad' });
  }
});
// Contar actividades según Tipo y tipoReporte
async function contarActividadesPorTipo(tipoReporte, profesionalId = null, areaNombre = null) {
  const where = {};
  let include = [];

  if (tipoReporte === "por-profesional" && profesionalId) {
    where.Idprof = profesionalId;
  } else if (tipoReporte === "por-area" && areaNombre) {
    // Unir con prof_salud para filtrar por área
    include = [
      {
        model: db.ProfSalud,
        as: "profesional",
        attributes: [],
        where: { Idarea: db.Sequelize.literal(`(SELECT Idarea FROM Area WHERE Nombre='${areaNombre}')`) },
        required: true,
      },
    ];
  }

  const conteo = await db.Actividad.findAll({
    attributes: [
      "Tipo",
      [db.Sequelize.fn("COUNT", db.Sequelize.col("Tipo")), "total"],
    ],
    where,
    include,
    group: ["Tipo"],
    raw: true,
  });

  // Mostrar en consola
  console.log("📊 Conteo de actividades por Tipo:");
  conteo.forEach((row) => {
    console.log(`Tipo: ${row.Tipo} | Total: ${row.total}`);
  });

  return conteo;
}

// Ejemplo de uso en ruta
router.post("/reporte-actividades", async (req, res) => {
  try {
    const { tipoReporte, profesional, areaProfesional } = req.body;

    const conteo = await contarActividadesPorTipo(
      tipoReporte,
      profesional || null,
      areaProfesional || null
    );

    res.json({ conteo });
  } catch (error) {
    console.error("❌ Error al contar actividades:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
