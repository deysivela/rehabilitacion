const express = require("express");
const router = express.Router();
const { generarExcelReporte } = require("../servicios/excel");
const db = require("../modelos");
const { Op } = require("sequelize");

// Lista de patologías
const PATOLOGIAS = [
  "Algias vertebrales",
  "Amputacion",
  "Artritis",
  "Artritis reumatoidea",
  "Artrosis",
  "Bursitis",
  "Contractura muscular",
  "Deformidades angulares de rodilla",
  "Deformidades de columna",
  "Displasia del desarrollo de cadera",
  "Distrofias musculares",
  "Enf. Respiratorias (asma, epoc)",
  "Enf. Vascular Cerebral (secuelas)",
  "Esclerosis Multiple",
  "Esguince",
  "Fascitis plantar",
  "Fracturas",
  "Lesion medular",
  "Luxacion",
  "Mialgias",
  "Paralisis Braquial",
  "Paralisis Cerebral",
  "Paralisis fascial periferico",
  "Parkinson",
  "Pie equino varo",
  "Pie Plano",
  "Polineuropatia",
  "Sindrome de Down",
  "Sindrome de inmovilidad",
  "Sindrome post poliomielitis",
  "Sinovitis",
  "Tendinitis - tendinosis",
  "Trastorno del Desarrollo",
  "Traumatismo craneoencefalico",
  "Ulceras por presion",
  "Otros",
];

// Razones de abandono
const RAZONES_ABANDONO = [
  "Familiar",
  "Vivienda",
  "Violencia",
  "Educación",
  "Transporte",
  "Económico",
  "Desastre natural",
];

// Grupos etarios
const GRUPOS_ETARIOS = [
  "<6 MESES",
  "6 M A 1 AÑO",
  "1 A 4 AÑOS",
  "5 A 9 AÑOS",
  "10 A 14 AÑOS",
  "15 A 19 AÑOS",
  "20 A 39 AÑOS",
  "40 A 49 AÑOS",
  "50 A 59 AÑOS",
  ">60 AÑOS",
];

// Todas las técnicas posibles
const TODAS_TECNICAS = [
  // Fonoaudiología
  "Evaluación Fonoaudiologica",
  "Terapia en patologías auditivas",
  "Terapias en patologías de la deglución",
  "Terapia en patologías de la voz",
  "Terapia en patologías del habla",
  "Terapia en patologías del lenguaje",
  "Terapia en trastornos de la comunicación",
  "Fonoaudiología en la comunidad",
  // Exámenes audiológicos
  "Audiometria tonal",
  "Audiometria tonal mas acufenometria",
  "Audiometria vocal o logoaudiometria",
  "Otoemisiones acusticas",
  "Pruebas vestibulares",
  "Otros",
  // Terapia ocupacional
  "Evaluación en Terapia ocupacional",
  "Terapia ocupacional en integración sensorial",
  "Terapia Ocupacional en integración social",
  "Terapia Ocupacional en intervencion comunitaria",
  "Terapia Ocupacional física",
  "Terapia ocupacional intelectual",
  "Promoción de la independencia y de la autonomia",
  // Psicomotricidad
  "Atención psicomotriz",
  "Evaluación psicomotriz",
  // Fisioterapia
  "Electroterapia",
  "Estimulación temprana",
  "Evaluación en Fisioterapia",
  "Fisioterapia cardiovascular",
  "Fisioterapia en la comunidad",
  "Fisioterapia en Terapia Intensiva",
  "Fisioterapia Geriatrica",
  "Fisioterapia Musculoesqueletica",
  "Fisioterapia Neonatal",
  "Fisioterapia Neurológica",
  "Fisioterapia Obstétrica",
  "Fisioterapia Oncológica",
  "Fisioterapia Pre y Post operatoria",
  "Fisioterapia Preventiva",
  "Fisioterapia Psicomotora",
  "Fisioterapia Traumatológica",
  "Fisioterapia/Kinesioterapia general",
  "Fisioterapia/kinesioterapia respiratoria",
  "Hidrocinesiterapia",
  "Termoterapia",
  "Masoterapia",
  // Psicología
  "Dificultad de adaptación",
  "Dificultad de aprendizaje",
  "Dificultad de concentración",
  "Dificultad de toma de decisiones",
  // Psicopedagogía
  "Atención psicopedagógica",
  "Evaluación psicopedagógica",
];

// Tipos de actividades
const TIPOS_ACTIVIDAD = [
  "N° de CAI de establecimiento",
  "N° de CAI de la red funcional de salud",
  "Nº de actividades realizadas con participación de la comunidad",
  "N° de actividades de la comunidad con participación del establecimiento",
  "Nº de capacitaciones impartidas",
  "Nº de participación en Ferias",
  "Nº de actividades educativas realizadas",
  "Nº de visitas familiares realizadas",
  "Nº de supervisiones y autoevaluaciones del establecimiento de Rehabilitación",
  "Nº de quejas y reclamos realizadas por los usuarios",
  "Nº de sugerencias y agradecimientos realizados por los usuarios",
  "N° de evaluaciones de satisfaccion realizadas",
  "N° de actividades a favor de las Personas con Discapacidad",
];

// Función para normalizar texto con problemas de codificación
function normalizarTexto(texto) {
  if (!texto) return '';
  
  // Reemplazar caracteres problemáticos
  return texto
    .replace(/┬║/g, 'º')
    .replace(/├│/g, 'ó')
    .replace(/├¡/g, 'í')
    .replace(/├▒/g, 'ñ')
    .replace(/├®/g, 'é')
    .replace(/├í/g, 'á')
    .replace(/├║/g, 'ú')
    .trim();
}

const validarParametros = (req, res, next) => {
  const { fecha, tipoReporte } = req.body;
  if (!fecha || !/^\d{4}-\d{2}$/.test(fecha))
    return res
      .status(400)
      .json({ error: "Formato de fecha inválido. Use YYYY-MM" });

  if (tipoReporte === "por-profesional" && !req.body.profesional)
    return res
      .status(400)
      .json({ error: "Se requiere seleccionar un profesional" });

  if (tipoReporte === "por-area" && !req.body.areaProfesional)
    return res.status(400).json({ error: "Se requiere seleccionar un área" });

  next();
};

function calcularEdad(fechaNacimientoStr) {
  if (!fechaNacimientoStr) return null;
  try {
    const nacimiento = new Date(fechaNacimientoStr);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    if (edad === 0) {
      const meses =
        (hoy.getFullYear() - nacimiento.getFullYear()) * 12 +
        (hoy.getMonth() - nacimiento.getMonth());
      return meses < 6 ? 0.4 : 0.8;
    }
    return edad;
  } catch {
    return null;
  }
}

function obtenerGrupoEtario(edad) {
  if (edad === null) return null;
  if (edad < 0.5) return "<6 MESES";
  if (edad < 1) return "6 M A 1 AÑO";
  if (edad < 5) return "1 A 4 AÑOS";
  if (edad < 10) return "5 A 9 AÑOS";
  if (edad < 15) return "10 A 14 AÑOS";
  if (edad < 20) return "15 A 19 AÑOS";
  if (edad < 40) return "20 A 39 AÑOS";
  if (edad < 50) return "40 A 49 AÑOS";
  if (edad < 60) return "50 A 59 AÑOS";
  return ">60 AÑOS";
}

async function determinarEstadoTratamiento(Idtrat) {
  if (!Idtrat) return "Sin tratamiento";
  try {
    const tratamiento = await db.Tratamiento.findByPk(Idtrat, {
      attributes: ["Estado", "Fecha_fin", "Razon"],
    });
    if (!tratamiento) return "Tratamiento no encontrado";
    switch (tratamiento.Estado) {
      case "Alta definitiva":
        return "Alta definitiva";
      case "Alta temporal":
        return "Alta temporal";
      case "En tratamiento":
        return tratamiento.Fecha_fin === null
          ? "En tratamiento"
          : "Estado desconocido";
      case "Abandono":
        return tratamiento.Razon
          ? `Abandono - ${tratamiento.Razon}`
          : "Abandono - Razón no especificada";
      default:
        return tratamiento.Estado || "Estado desconocido";
    }
  } catch {
    return "Error al consultar tratamiento";
  }
}

function inicializarEstructuraReporte(profesionalFiltro = null) {
  const estructuraBase = {
    area: "",
    profesional: profesionalFiltro ? "" : "VARIOS",
    tipo_sesion: "",
    id_profesional: profesionalFiltro || null,
    ...Object.fromEntries(
      GRUPOS_ETARIOS.flatMap((g) => ["_M", "_F"].map((s) => [`${g}${s}`, 0]))
    ),
    ...Object.fromEntries(
      GRUPOS_ETARIOS.flatMap((g) =>
        ["_M", "_F"].map((s) => [`DISC_${g}${s}`, 0])
      )
    ),
    ...Object.fromEntries(
      ["Moderado", "Grave", "Muy Grave"].flatMap((g) =>
        ["_M", "_F"].map((s) => [`${g}${s}`, 0])
      )
    ),
    ...Object.fromEntries(
      ["FÍSICA", "INTELECTUAL", "MÚLTIPLE", "VISUAL", "AUDITIVO", "MENTAL"].map(
        (t) => [t, 0]
      )
    ),
    ...Object.fromEntries(PATOLOGIAS.map((p) => [p, 0])),
    ...Object.fromEntries(RAZONES_ABANDONO.map((r) => [`Abandono - ${r}`, 0])),
    "Alta definitiva": 0,
    "Alta temporal": 0,
    "En tratamiento": 0,
    Abandono: 0,
    "Abandono - Razón no especificada": 0,
    "Sin tratamiento": 0,
    "Tratamiento no encontrado": 0,
    "Error al consultar tratamiento": 0,
    "Estado desconocido": 0,
    tecnicas: Object.fromEntries(TODAS_TECNICAS.map((tec) => [tec, 0])),
    actividades: Object.fromEntries(TIPOS_ACTIVIDAD.map((act) => [act, 0])),
  };
  return estructuraBase;
}

// -------------------- Procesar sesiones --------------------
async function procesarSesiones(
  sesiones,
  areaFiltro = null,
  profesionalFiltro = null
) {
  const resultado = {};
  const pacientesProcesados = {};
  const pacientesDiscapacidadUnicos = {}; 

  if (!sesiones || sesiones.length === 0) return [];

  for (const sesion of sesiones) {
    if (!sesion.paciente || !sesion.profesional) continue;

    const nombreProfesional =
      `${sesion.profesional.Nombre_prof} ${sesion.profesional.Appaterno_prof}`.trim();
    const area =
      sesion.profesional?.area?.Nombre?.trim().toUpperCase() || "OTROS";
    if (areaFiltro && area !== areaFiltro.trim().toUpperCase()) continue;
    if (profesionalFiltro && sesion.profesional.Idprof != profesionalFiltro)
      continue;

    const tipoSesion = sesion.Tipo === "Nuevo" ? "Nuevo" : "Repetido";
    const clave = profesionalFiltro
      ? `${area}_${nombreProfesional}_${tipoSesion}`
      : `${area}_${tipoSesion}`;
      //console.log(" Área detectada:", area, "| Tipo:", tipoSesion);

    if (!resultado[clave]) {
      resultado[clave] = inicializarEstructuraReporte(profesionalFiltro);
      resultado[clave].area = area;
      resultado[clave].profesional = profesionalFiltro
        ? nombreProfesional
        : "VARIOS";
      resultado[clave].tipo_sesion = tipoSesion;
      resultado[clave].id_profesional = profesionalFiltro
        ? sesion.profesional.Idprof
        : null;
      
      // Inicializar el tracking de pacientes únicos con discapacidad para esta clave
      pacientesDiscapacidadUnicos[clave] = new Set();
    }

    const idPaciente = sesion.paciente.Idpac;
    if (!pacientesProcesados[clave]) pacientesProcesados[clave] = {};

    // Edad y grupo etario
    let grupo = null,
      genero = "";
    if (sesion.paciente.Fnaci_pac) {
      const edad = calcularEdad(sesion.paciente.Fnaci_pac);
      grupo = obtenerGrupoEtario(edad);
      genero = sesion.paciente.Genero_pac === "M" ? "_M" : "_F";
      if (grupo) {
        const campo = `${grupo}${genero}`;
        if (resultado[clave][campo] !== undefined) resultado[clave][campo]++;
      }
    }

    // Discapacidad - MODIFICACIÓN PRINCIPAL
    if (sesion.paciente.Tienediscapacidad) {
      const disc = sesion.paciente.detalleDiscapacidad;
      
      // Verificar si este paciente ya fue contado en esta clave
      const pacienteKey = `${idPaciente}_${grupo}_${genero}`;
      
      if (!pacientesDiscapacidadUnicos[clave].has(pacienteKey)) {
        // Contar solo una vez por paciente en este grupo
        pacientesDiscapacidadUnicos[clave].add(pacienteKey);
        
        if (grupo) {
          const campoDisc = `DISC_${grupo}${genero}`;
          if (resultado[clave][campoDisc] !== undefined)
            resultado[clave][campoDisc]++;
        }

        let grado = disc?.Grado_disc?.trim() || "NO ESPECIFICADO";
        grado = grado
          .toLowerCase()
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        const campoGrado = `${grado}${genero}`;
        if (resultado[clave][campoGrado] !== undefined)
          resultado[clave][campoGrado]++;
        else console.warn(`Clave de grado no encontrada: ${campoGrado}`);

        const tipo = disc?.Tipo_disc?.trim().toUpperCase() || "NO ESPECIFICADO";
        if (resultado[clave][tipo] !== undefined) resultado[clave][tipo]++;
      }
    }

    // Patologías
    if (sesion.Notas) {
      const notasLower = sesion.Notas.toLowerCase();
      let patologiaDetectada = false;
      PATOLOGIAS.forEach((p) => {
        if (p === "Otros") return;
        if (notasLower.includes(p.toLowerCase())) {
          resultado[clave][p]++;
          patologiaDetectada = true;
        }
      });
      if (!patologiaDetectada && notasLower.trim().length > 10)
        resultado[clave]["Otros"]++;
    }

    // Técnicas
    if (sesion.tecnicas && sesion.tecnicas.length > 0) {
      sesion.tecnicas.forEach((tec) => {
        if (tec && (tec.Descripcion || tec.Nombre)) {
          const nombreTec = (tec.Descripcion || tec.Nombre).trim();
          const claveNormalizada = nombreTec
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

          for (const tecnicaDef of Object.keys(resultado[clave].tecnicas)) {
            const tecnicaNorm = tecnicaDef
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase();
            if (claveNormalizada === tecnicaNorm) {
              resultado[clave].tecnicas[tecnicaDef]++;
              break;
            }
          }
        }
      });
    }

    // Estado tratamiento
    if (!pacientesProcesados[clave][idPaciente]) {
      let estadoTratamiento = await determinarEstadoTratamiento(sesion.Idtrat);
      estadoTratamiento = estadoTratamiento.trim();
      pacientesProcesados[clave][idPaciente] = estadoTratamiento;

      const keys = Object.keys(resultado[clave]);
      const keyEncontrada = keys.find(
        (k) =>
          k.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
          estadoTratamiento.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      );
      if (keyEncontrada) resultado[clave][keyEncontrada]++;
      else resultado[clave]["Estado desconocido"]++;
    }
  }

  return Object.values(resultado);
}

// -------------------- Procesar actividades por separado --------------------
async function procesarActividades(
  datosProcesados,
  areaFiltro = null,
  profesionalFiltro = null,
  fechaInicio,
  fechaFin,
  tipoReporte
) {
  
  // Construir condiciones para filtrar actividades
  const whereActividad = {
    Fecha: { [Op.between]: [fechaInicio, fechaFin] }
  };

  // Si es reporte por profesional, filtrar actividades por ese profesional
  if (tipoReporte === "por-profesional" && profesionalFiltro) {
    whereActividad.Idprof = profesionalFiltro;
  }
  
  // Si es reporte por área, obtener profesionales de esa área
  let profesionalesArea = [];
  if (tipoReporte === "por-area" && areaFiltro) {
    const areaInfo = await db.Area.findOne({ 
      where: { Nombre: areaFiltro },
      include: [{
        model: db.ProfSalud,
        as: 'profesionales',
        attributes: ['Idprof']
      }]
    });
    
    if (areaInfo) {
      profesionalesArea = areaInfo.profesionales.map(p => p.Idprof);
      whereActividad.Idprof = { [Op.in]: profesionalesArea };
      console.log(`   Filtro: Área "${areaFiltro}" con profesionales: ${profesionalesArea.join(', ')}`);
    }
  }

  // Traer todas las actividades filtradas
  const actividadesDB = await db.Actividad.findAll({
    where: whereActividad,
    include: [{
      model: db.ProfSalud,
      as: 'profesional',
      attributes: ['Idprof', 'Nombre_prof', 'Appaterno_prof'],
      include: [{
        model: db.Area,
        as: 'area',
        attributes: ['Nombre']
      }]
    }],
    raw: false
  });

  // Reiniciar contadores de actividades en todos los grupos
  for (const dato of datosProcesados) {
    TIPOS_ACTIVIDAD.forEach(act => {
      dato.actividades[act] = 0;
    });
  }

  // Procesar cada actividad
  actividadesDB.forEach(actividad => {
    const tipoNormalizado = normalizarTexto(actividad.Tipo);
    const idProf = actividad.Idprof;
    const areaProfesional = actividad.profesional?.area?.Nombre?.toUpperCase() || "OTROS";

    // Buscar el tipo de actividad correspondiente
    let tipoActividadEncontrado = null;
    for (const tipo of TIPOS_ACTIVIDAD) {
      if (tipoNormalizado.includes(tipo) || tipo.includes(tipoNormalizado)) {
        tipoActividadEncontrado = tipo;
        break;
      }
    }

    // Buscar el grupo correspondiente para esta actividad
    let grupoEncontrado = null;
    
    if (tipoReporte === "por-profesional" && profesionalFiltro) {
      // Buscar grupo por profesional
      grupoEncontrado = datosProcesados.find(d => 
        d.id_profesional === idProf
      );
    } else if (tipoReporte === "por-area" && areaFiltro) {
      // Buscar grupo por área
      grupoEncontrado = datosProcesados.find(d => 
        d.area.toUpperCase() === areaFiltro.toUpperCase()
      );
    } else {
      // Reporte general - buscar cualquier grupo del mismo área
      grupoEncontrado = datosProcesados.find(d => 
        d.area.toUpperCase() === areaProfesional
      );
    }

    if (grupoEncontrado) {
      grupoEncontrado.actividades[tipoActividadEncontrado]++;
    } 
  });

  // Mostrar resumen final
  for (const dato of datosProcesados) {
    let tieneActividades = false;
    TIPOS_ACTIVIDAD.forEach(act => {
      if (dato.actividades[act] > 0) {
        tieneActividades = true;
      }
    });
  }

  return datosProcesados;
}

// -------------------- Ruta POST --------------------
router.post("/generar", validarParametros, async (req, res) => {
  try {
    const { areaProfesional, profesional, fecha, tipoReporte } = req.body;

    let profesionalInfo = null;
    if (tipoReporte === "por-profesional" && profesional) {
      profesionalInfo = await db.ProfSalud.findByPk(profesional, {
        include: { model: db.Area, as: "area", attributes: ["Nombre"] },
      });
      if (!profesionalInfo)
        return res.status(400).json({ error: "Profesional no encontrado" });
    }

    let areaInfo = null;
    if (tipoReporte === "por-area" && areaProfesional) {
      areaInfo = await db.Area.findOne({ where: { Nombre: areaProfesional } });
      if (!areaInfo)
        return res
          .status(400)
          .json({ error: "El área especificada no existe" });
    }

    const fechaInicio = `${fecha}-01`;
    const fechaFin = new Date(
      fecha.split("-")[0],
      parseInt(fecha.split("-")[1]),
      0
    )
      .toISOString()
      .slice(0, 10);

    console.log(`   Período: ${fechaInicio} a ${fechaFin}`);

    const whereProf = {};
    if (tipoReporte === "por-area" && areaInfo)
      whereProf.Idarea = areaInfo.Idarea;
    if (tipoReporte === "por-profesional" && profesional)
      whereProf.Idprof = profesional;

    const sesiones = await db.Sesion.findAll({
      include: [
        {
          model: db.Paciente,
          as: "paciente",
          include: [
            {
              model: db.Discapacidad,
              as: "detalleDiscapacidad",
              required: false,
            },
          ],
        },
        {
          model: db.ProfSalud,
          as: "profesional",
          where: whereProf,
          required: true,
          include: [{ model: db.Area, as: "area", attributes: ["Nombre"] }],
          attributes: ["Idprof", "Nombre_prof", "Appaterno_prof"],
        },
        { model: db.Tecnica, as: "tecnicas", through: { attributes: [] } },
      ],
      where: {
        Fecha: { [Op.between]: [fechaInicio, fechaFin] },
        Tipo: ["Nuevo", "Repetido"],
      },
      attributes: ["Idsesion", "Tipo", "Notas", "Idtrat"],
    });

    const datosProcesados = await procesarSesiones(
      sesiones,
      tipoReporte === "por-area" ? areaProfesional : null,
      tipoReporte === "por-profesional" ? profesional : null,
      fechaInicio,
      fechaFin,
      tipoReporte
    );

    // Procesar actividades por separado
    const datosConActividades = await procesarActividades(
      datosProcesados,
      tipoReporte === "por-area" ? areaProfesional : null,
      tipoReporte === "por-profesional" ? profesional : null,
      fechaInicio,
      fechaFin,
      tipoReporte
    );

    const libroExcel = await generarExcelReporte(datosConActividades, {
      tipoReporte,
      areaSeleccionada:
        tipoReporte === "por-area"
          ? areaProfesional
          : profesionalInfo?.area?.Nombre || null,
      profesionalSeleccionado: profesionalInfo || profesional,
      fechaReporte: fecha,
      patologias: PATOLOGIAS,
      razonesAbandono: RAZONES_ABANDONO,
      todasTecnicas: TODAS_TECNICAS,
    });
    

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte-${fecha}.xlsx`
    );
    await libroExcel.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(" ERROR CRÍTICO AL GENERAR REPORTE:", error);
    res
      .status(500)
      .json({ error: "Error al generar el reporte", detalles: error.message });
  }
});

module.exports = router;