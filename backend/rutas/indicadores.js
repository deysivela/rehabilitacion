const express = require('express');
const router = express.Router();
const db = require("../conexion/db");
const { QueryTypes } = require('sequelize');

router.get('/', async (req, res) => {
  const userId = parseInt(req.headers['x-user-id']);
  const userRol = req.headers['x-user-rol'].toLowerCase();

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

    // Consultas para cada indicador
    const queries = {
      citasProgramadas: {
        query: `
          SELECT COUNT(*) AS total 
          FROM citasmd 
          WHERE fecha_cita >= CURDATE() 
            AND estado_cita = 'Programada'
          ${userRol !== 'administrador' ? 'AND Idprof = ?' : ''}
        `,
        needsReplacement: userRol !== 'administrador'
      },
      
      totalPacientes: {
        query: 'SELECT COUNT(*) AS total FROM paciente',
        needsReplacement: false
      },
      
      tratamientosActivos: {
        query: `
          SELECT COUNT(*) AS total 
          FROM tratamiento 
          WHERE (Fecha_fin IS NULL OR Fecha_fin >= CURDATE())
          ${userRol !== 'administrador' ? 'AND Idprof = ?' : ''}
        `,
        needsReplacement: userRol !== 'administrador'
      },
      
      sesionesRealizadas: {
        query: `
          SELECT COUNT(*) AS total 
          FROM sesion 
          ${userRol !== 'administrador' ? 'WHERE Idprof = ?' : ''}
        `,
        needsReplacement: userRol !== 'administrador'
      },
      
      tecnicasDisponibles: {
        query: 'SELECT COUNT(*) AS total FROM tecnicas',
        needsReplacement: false
      }
    };

    // Ejecutar todas las consultas en paralelo
    const results = await Promise.all(
      Object.entries(queries).map(async ([key, {query, needsReplacement}]) => {
        try {
          const result = await db.query(query, {
            replacements: needsReplacement ? [idprof] : [],
            type: QueryTypes.SELECT
          });
          
          return { key, value: result[0]?.total || 0 };
        } catch (err) {
          console.error(`Error en consulta ${key}:`, err);
          return { key, value: 0 }; // Retornar 0 si hay error
        }
      })
    );

    // Convertir resultados a objeto
    const indicadores = results.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    res.json(indicadores);

  } catch (err) {
    console.error("Error en indicadores:", err);
    res.status(500).json({ 
      error: 'Error al obtener indicadores',
      details: err.message 
    });
  }
});

module.exports = router;