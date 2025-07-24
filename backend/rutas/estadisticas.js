const express = require('express');
const router = express.Router();
const pool = require('../conexion/db');

router.get('/', async (req, res) => {
  try {
    const [
      usuarios, 
      pacientes, 
      sesiones,
      profesionales,
      areas,
      actividades,
      tecnicas,
      citasmd 
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM usuario'),
      pool.query('SELECT COUNT(*) AS total FROM paciente'),
      pool.query('SELECT COUNT(*) AS total FROM sesion'),
      pool.query('SELECT COUNT(*) AS total FROM prof_salud'),
      pool.query('SELECT COUNT(*) AS total FROM area'),
      pool.query('SELECT COUNT(*) AS total FROM actividades'),
      pool.query('SELECT COUNT(*) AS total FROM tecnicas'),
      pool.query("SELECT COUNT(*) AS total FROM citasmd WHERE estado_cita = 'Programada'"),
    ]);

    res.json({
      usuarios: usuarios[0][0].total,
      pacientes: pacientes[0][0].total,
      sesiones: sesiones[0][0].total,
      profesionales: profesionales[0][0].total,
      areas: areas[0][0].total,
      actividades: actividades[0][0].total,
      tecnicas: tecnicas[0][0].total,
      citasProgramadas: citasmd[0][0].total, 
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;