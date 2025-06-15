const express = require('express');
const router = express.Router();
const db = require("../conexion/db");
const { QueryTypes } = require('sequelize');

router.get('/', async (req, res) => {
  const userId = parseInt(req.headers['x-user-id']);
  const userRol = req.headers['x-user-rol'];

  try {
    let idprof = null;

    // Si no es administrador, obtener su Idprof
    if (userRol !== 'administrador') {
      const userResult = await db.query(
        'SELECT Idprof FROM usuario WHERE Iduser = ?',
        {
          replacements: [userId],
          type: QueryTypes.SELECT
        }
      );


      if (!userResult.length || !userResult[0].Idprof) {
        return res.status(400).json({ error: 'Profesional no encontrado o sin Idprof asociado.' });
      }

      idprof = userResult[0].Idprof;
    }

    // Consultas base con filtro por Idprof en ambas tablas si aplica
    let pacientesQuery = `
      SELECT COUNT(DISTINCT Idpac) AS total
      FROM tratamiento
      WHERE (Fecha_fin IS NULL OR Fecha_fin >= CURDATE())
    `;

    let citasQuery = `
      SELECT COUNT(*) AS total 
      FROM citasmd 
      WHERE fecha_cita >= CURDATE() 
        AND estado_cita = 'programada'
    `;

    let replacements = [];

    if (userRol !== 'administrador' && idprof !== null) {
      pacientesQuery += ` AND Idprof = ?`;
      citasQuery += ` AND Idprof = ?`;
      replacements.push(idprof);
    }

    const pacientes = await db.query(pacientesQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    const citas = await db.query(citasQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    res.json({
      pacientesEnTratamiento: pacientes[0]?.total || 0,
      citasProgramadas: citas[0]?.total || 0,
    });

  } catch (err) {
    console.error("Error en indicadores:", err);
    res.status(500).json({ error: 'Error al obtener indicadores' });
  }
});

module.exports = router;
