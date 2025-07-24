const express = require('express');
const router = express.Router();
const { generarExcelReporte } = require('../servicios/excel');
const db = require('../modelos');
const { Op } = require('sequelize');

// Validación de parámetros
const validarParametros = (req, res, next) => {
  const { fecha, tipoReporte } = req.body;
  
  if (!fecha || !/^\d{4}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM' });
  }
  
  if (tipoReporte === 'por-profesional' && !req.body.profesional) {
    return res.status(400).json({ error: 'Se requiere seleccionar un profesional' });
  }
  
  if (tipoReporte === 'por-area' && !req.body.areaProfesional) {
    return res.status(400).json({ error: 'Se requiere seleccionar un área' });
  }
  
  next();
};

// Función para calcular edad en años decimales
function calcularEdad(fechaNacimientoStr) {
  if (!fechaNacimientoStr) return null;
  
  try {
    const nacimiento = new Date(fechaNacimientoStr);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    // Para grupos menores de 1 año
    if (edad === 0) {
      const meses = (hoy.getMonth() + 12 * hoy.getFullYear()) - 
                   (nacimiento.getMonth() + 12 * nacimiento.getFullYear());
      if (meses < 6) return 0.4;   // Menos de 6 meses
      return 0.8;                  // Entre 6 meses y 1 año
    }
    
    return edad;
  } catch (e) {
    console.error('Error calculando edad:', e);
    return null;
  }
}

// Función para determinar grupo etario
function obtenerGrupoEtario(edad) {
  if (edad === null || edad === undefined) return null;
  if (edad < 0.5) return '<6 MESES';
  if (edad < 1) return '6 M A 1 AÑO';
  if (edad < 5) return '1 A 4 AÑOS';
  if (edad < 10) return '5 A 9 AÑOS';
  if (edad < 15) return '10 A 14 AÑOS';
  if (edad < 20) return '15 A 19 AÑOS';
  if (edad < 40) return '20 A 39 AÑOS';
  if (edad < 50) return '40 A 49 AÑOS';
  if (edad < 60) return '50 A 59 AÑOS';
  return '>60 AÑOS';
}

// Procesamiento de sesiones
function procesarSesiones(sesiones, areaFiltro = null, profesionalFiltro = null) {
  const resultado = {};

  // Si no hay sesiones, devolver array vacío
  if (!sesiones || sesiones.length === 0) {
    return [];
  }

  sesiones.forEach(sesion => {
    // Verificar que exista paciente y profesional
    if (!sesion.paciente || !sesion.profesional) {
      return;
    }

    const nombreProfesional = `${sesion.profesional.Nombre_prof} ${sesion.profesional.Appaterno_prof}`.trim();
    const area = sesion.profesional?.area?.Nombre?.trim().toUpperCase() || 'OTROS';
    
    // Filtrar por área si es necesario
    if (areaFiltro && area !== areaFiltro.trim().toUpperCase()) {
      return;
    }
    
    // Filtrar por profesional si es necesario
    if (profesionalFiltro && sesion.profesional.Idprof != profesionalFiltro) {
      return;
    }

    const tipoSesion = sesion.Tipo === 'Nuevo' ? 'Nuevo' : 'Repetido';
    const clave = `${area}_${nombreProfesional}_${tipoSesion}`;
    
    if (!resultado[clave]) {
      resultado[clave] = {
        area,
        profesional: nombreProfesional,
        tipo_sesion: tipoSesion,
        id_profesional: sesion.profesional.Idprof,
        '<6 MESES_M': 0,
        '<6 MESES_F': 0,
        '6 M A 1 AÑO_M': 0,
        '6 M A 1 AÑO_F': 0,
        '1 A 4 AÑOS_M': 0,
        '1 A 4 AÑOS_F': 0,
        '5 A 9 AÑOS_M': 0,
        '5 A 9 AÑOS_F': 0,
        '10 A 14 AÑOS_M': 0,
        '10 A 14 AÑOS_F': 0,
        '15 A 19 AÑOS_M': 0,
        '15 A 19 AÑOS_F': 0,
        '20 A 39 AÑOS_M': 0,
        '20 A 39 AÑOS_F': 0,
        '40 A 49 AÑOS_M': 0,
        '40 A 49 AÑOS_F': 0,
        '50 A 59 AÑOS_M': 0,
        '50 A 59 AÑOS_F': 0,
        '>60 AÑOS_M': 0,
        '>60 AÑOS_F': 0
      };
    }

    // Calcular edad solo si existe fecha de nacimiento
    if (sesion.paciente.Fnaci_pac) {
      const edad = calcularEdad(sesion.paciente.Fnaci_pac);
      const grupo = obtenerGrupoEtario(edad);
      const genero = sesion.paciente.Genero_pac === 'M' ? '_M' : '_F';
      
      if (grupo) {
        const campo = `${grupo}${genero}`;
        if (resultado[clave][campo] !== undefined) {
          resultado[clave][campo]++;
        }
      }
    }
  });

  return Object.values(resultado);
}

// Ruta para generar reportes
router.post('/generar', validarParametros, async (req, res) => {
  try {
    const { areaProfesional, profesional, fecha, tipoReporte } = req.body;

    // Obtener información del profesional si es reporte por profesional
    let profesionalInfo = null;
    if (tipoReporte === 'por-profesional' && profesional) {
      profesionalInfo = await db.ProfSalud.findByPk(profesional, {
        include: {
          model: db.Area,
          as: 'area',
          attributes: ['Nombre']
        }
      });
      
      if (!profesionalInfo) {
        return res.status(400).json({ error: 'Profesional no encontrado' });
      }
    }

    // Verificar si el área existe para reportes por área
    let areaInfo = null;
    if (tipoReporte === 'por-area' && areaProfesional) {
      areaInfo = await db.Area.findOne({
        where: { Nombre: areaProfesional }
      });
      
      if (!areaInfo) {
        return res.status(400).json({ error: 'El área especificada no existe' });
      }
    }

    const fechaInicio = `${fecha}-01`;
    const fechaFin = new Date(fecha.split('-')[0], parseInt(fecha.split('-')[1]), 0).toISOString().slice(0, 10);

    // Configurar filtros para la consulta SQL
    const whereProf = {};
    if (tipoReporte === 'por-area' && areaInfo) {
      whereProf.Idarea = areaInfo.Idarea;
    }
    if (tipoReporte === 'por-profesional' && profesional) {
      whereProf.Idprof = profesional;
    }

    const sesiones = await db.Sesion.findAll({
      include: [
        {
          model: db.Paciente,
          as: 'paciente',
          attributes: ['Fnaci_pac', 'Genero_pac'],
        },
        {
          model: db.ProfSalud,
          as: 'profesional',
          where: whereProf,
          required: tipoReporte === 'por-area' || tipoReporte === 'por-profesional',
          include: [
            {
              model: db.Area,
              as: 'area',
              attributes: ['Nombre'],
            }
          ],
          attributes: ['Idprof', 'Nombre_prof', 'Appaterno_prof']
        }
      ],
      where: {
        Fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        },
        Tipo: ['Nuevo', 'Repetido']
      },
      attributes: ['Idsesion', 'Tipo']
    });

    // Procesar sesiones con los filtros adecuados
    const datosProcesados = procesarSesiones(
      sesiones, 
      tipoReporte === 'por-area' ? areaProfesional : null,
      tipoReporte === 'por-profesional' ? profesional : null
    );

    // Generar el reporte Excel
    const libroExcel = await generarExcelReporte(datosProcesados, {
      tipoReporte,
      areaSeleccionada: tipoReporte === 'por-area' ? areaProfesional : (profesionalInfo?.area?.Nombre || null),
      profesionalSeleccionado: profesionalInfo || profesional,
      fechaReporte: fecha
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-${fecha}.xlsx`);
    await libroExcel.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: 'Error al generar el reporte', detalles: error.message });
  }
});

module.exports = router;