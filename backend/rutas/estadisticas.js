const express = require('express');
const router = express.Router();
const pool = require('../conexion/db');

router.get('/', async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT COUNT(*) AS total FROM usuario');
    const [pacientes] = await pool.query('SELECT COUNT(*) AS total FROM paciente');
    const [sesion] = await pool.query('SELECT COUNT(*) AS total FROM sesion');

    res.json({
      usuarios: usuarios[0].total,
      pacientes: pacientes[0].total,
      sesion: sesion[0].total,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;

