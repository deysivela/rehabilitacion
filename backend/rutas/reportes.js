const express = require('express');
const router = express.Router();
const { generarExcelReporte } = require('../servicios/excel');
const db = require('../modelos');
const { Op } = require('sequelize');

const validarParametros = (req, res, next) => {
  const { fecha, tipoReporte } = req.body;
  if (!fecha || !/^\d{4}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM' });
  }
  if (tipoReporte === 'por-profesional' && !req.body.profesional) {
    return res.status(400).json({ error: 'Se requiere seleccionar un profesional' });
  }
  next();
};

// Calcular edad en años decimales
function calcularEdad(fechaNacimientoStr) {
  const nacimiento = new Date(fechaNacimientoStr);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  const d = hoy.getDate() - nacimiento.getDate();

  // Ajuste de meses/días
  if (m < 0 || (m === 0 && d < 0)) {
    edad--;
  }

  // Para grupos menores de 1 año, calcular en meses
  if (edad === 0) {
    const meses = (hoy.getMonth() + 12 * hoy.getFullYear()) - (nacimiento.getMonth() + 12 * nacimiento.getFullYear());
    if (meses < 6) return 0.4;   // Menos de 6 meses, representa con 0.4
    else return 0.8;            // Entre 6 meses y 1 año, representa con 0.8
  }

  return edad;
}

function obtenerGrupoEtario(edad) {
  if (edad < 0) return null;
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

function procesarSesiones(sesiones, areaFiltro = null, profesionalFiltro = null) {
  const resultado = {};

  sesiones.forEach(sesion => {
    // Normalizar el nombre del área
    const area = sesion.profesional?.area?.Nombre 
      ? sesion.profesional.area.Nombre.trim().toUpperCase() 
      : 'OTROS';
    
    // Verificar filtros
    if (areaFiltro && area !== areaFiltro.trim().toUpperCase()) {
      return; // Saltar si no coincide con el área filtrada
    }
    
    if (profesionalFiltro && sesion.profesional?.Idprof !== profesionalFiltro) {
      return; // Saltar si no coincide con el profesional filtrado
    }

    const tipoSesion = sesion.Tipo === 'Nuevo' ? 'Nuevo' : 'Repetido';
    const clave = `${area}_${tipoSesion}`;
    
    if (!resultado[clave]) {
      resultado[clave] = {
        area,
        tipo_sesion: tipoSesion,
        id_profesional: sesion.profesional?.Idprof || null,
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
        '>60 AÑOS_F': 0,
      };
    }

    // Calcular edad y grupo etario
    const edad = calcularEdad(sesion.paciente.Fnaci_pac);
    const grupo = obtenerGrupoEtario(edad);
    const genero = sesion.paciente.Genero_pac === 'M' ? '_M' : '_F';
    const campo = `${grupo}${genero}`;

    if (resultado[clave][campo] !== undefined) {
      resultado[clave][campo]++;
    }
  });

  return Object.values(resultado);
}

router.post('/generar', validarParametros, async (req, res) => {
  try {
    const { areaProfesional, profesional, fecha, tipoReporte } = req.body;
    
    console.log('Parámetros recibidos:', {
      areaProfesional,
      profesional,
      fecha,
      tipoReporte
    });

    // Obtener el área si se filtró por área (CORRECCIÓN IMPORTANTE)
    let nombreAreaFiltro = null;
    let idAreaFiltro = null;
    
    if (tipoReporte === 'por-area' && areaProfesional) {
      // Buscar por NOMBRE del área en lugar de ID
      const area = await db.Area.findOne({ 
        where: { Nombre: areaProfesional }
      });
      
      if (area) {
        nombreAreaFiltro = area.Nombre;
        idAreaFiltro = area.Idarea;
        console.log('Área encontrada:', {
          nombre: nombreAreaFiltro,
          id: idAreaFiltro
        });
      } else {
        console.log('Área no encontrada:', areaProfesional);
        return res.status(400).json({ error: 'Área no encontrada' });
      }
    }

    const fechaInicio = `${fecha}-01`;
    const fechaFin = new Date(fecha.split('-')[0], parseInt(fecha.split('-')[1]), 0).toISOString().slice(0, 10);

    // Configurar filtros para la consulta SQL (USAR ID DEL ÁREA)
    const whereProf = {};
    if (tipoReporte === 'por-area' && idAreaFiltro) {
      whereProf.Idarea = idAreaFiltro; // Usar el ID numérico del área
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
      required: tipoReporte === 'por-area',
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
    Tipo: ['Nuevo', 'Repetido'] // Asegurar ambos tipos
  },
  attributes: ['Idsesion', 'Tipo']
});

    console.log(`Total sesiones encontradas: ${sesiones.length}`);
    if (sesiones.length > 0) {
      console.log('Ejemplo de sesión:', {
        id: sesiones[0].Idsesion,
        tipo: sesiones[0].Tipo,
        area: sesiones[0].profesional?.area?.Nombre,
        profesional: sesiones[0].profesional?.Nombre_prof
      });
    }

    // Procesar sesiones con los filtros adecuados
    const datosProcesados = procesarSesiones(
      sesiones, 
      nombreAreaFiltro, // Pasar el nombre del área para el filtrado
      tipoReporte === 'por-profesional' ? profesional : null
    );

    console.log('Datos procesados:', datosProcesados.length);
    if (datosProcesados.length > 0) {
      console.log('Ejemplo de dato procesado:', datosProcesados[0]);
    }

    // Generar el reporte Excel
    const libroExcel = await generarExcelReporte(datosProcesados, {
      tipoReporte,
      areaSeleccionada: nombreAreaFiltro, // Pasar el nombre del área
      profesionalSeleccionado: profesional,
      fechaReporte: fecha
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-${fecha}.xlsx`);
    await libroExcel.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});

module.exports = router;