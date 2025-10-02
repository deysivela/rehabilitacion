const ExcelJS = require("exceljs");
const axios = require("axios");
const db = require("../modelos");
const { Op } = require("sequelize");
import { API_URL } from '../config';

// Función utilitaria para aplicar bordes a celdas combinadas
function aplicarBordesCeldasCombinadas(hoja, rango, estilo) {
  const [celdaInicio, celdaFin] = rango.split(":");
  const colInicio = celdaInicio.match(/[A-Z]+/)[0];
  const filaInicio = parseInt(celdaInicio.match(/\d+/)[0]);
  const colFin = celdaFin.match(/[A-Z]+/)[0];
  const filaFin = parseInt(celdaFin.match(/\d+/)[0]);

  // Convertir columnas a números
  const colInicioNum = colInicio.charCodeAt(0);
  const colFinNum = colFin.charCodeAt(0);

  for (let fila = filaInicio; fila <= filaFin; fila++) {
    for (let col = colInicioNum; col <= colFinNum; col++) {
      const colLetter = String.fromCharCode(col);
      const celda = hoja.getCell(`${colLetter}${fila}`);
      celda.style = { ...celda.style, ...estilo };
    }
  }
}

async function generarExcelReporte(datos, config) {
  const {
    areaSeleccionada,
    profesionalSeleccionado,
    fechaReporte,
    tipoReporte,
    patologias,
    razonesAbandono,
  } = config;
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet("FORM GENERAL Y PCD");

  // Estilos
  const estiloEncabezado = {
    font: { bold: true, size: 12 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
    alignment: { horizontal: "center" },
  };

  const estiloTitulo = {
    font: { bold: true, size: 20 },
    alignment: { horizontal: "center" },
  };

  const estiloCelda = {
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const estiloCeldaRelleno = {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const estiloInfo = {
    font: { bold: true },
  };
  
  // Obtener las áreas desde la API
  let areas = [];
  try {
    const response = await axios.get(`${API_URL}/area/listar`);
    areas = response.data.map((area) => ({
      Idarea: area.Idarea,
      Nombre: area.Nombre.toUpperCase(),
    }));
  } catch (error) {
    console.error("Error al obtener áreas:", error);
  }
/*   let areas = [];

try {
  // Traer todas las áreas de la base de datos
  const areasDB = await Area.findAll({
    attributes: ['Idarea', 'Nombre'], 
  });

  // Transformar nombres a mayúsculas
  areas = areasDB.map(area => ({
    Idarea: area.Idarea,
    Nombre: area.Nombre.toUpperCase(),
  }));

  console.log(areas); // o usarlo donde necesites
} catch (error) {
  console.error("Error al obtener áreas:", error);
} */

  // Si es reporte por profesional, usar su área
  if (tipoReporte === "por-profesional" && profesionalSeleccionado) {
    try {
      const profesional = await db.ProfSalud.findByPk(
        typeof profesionalSeleccionado === "object"
          ? profesionalSeleccionado.Idprof
          : profesionalSeleccionado,
        {
          include: {
            model: db.Area,
            as: "area",
          },
        }
      );

      if (profesional && profesional.area) {
        areas = [
          {
            Idarea: profesional.area.Idarea,
            Nombre: profesional.area.Nombre.toUpperCase(),
          },
        ];
      }
    } catch (error) {
      console.error("Error al obtener área del profesional:", error);
    }
  } else if (tipoReporte === "por-area" && areaSeleccionada) {
    // Filtrar solo el área seleccionada
    const area = areas.find((a) => a.Nombre === areaSeleccionada.toUpperCase());
    if (area) {
      areas = [area];
    }
  }

  // 1. Encabezado principal
  let filaActual = 3;

  // 1. Encabezado principal
  safeMerge(`B${filaActual}:X${filaActual}`);
  hoja.getCell(`B${filaActual}`).value =
    "FORMULARIO DE CONSOLIDACION DE PRODUCCIÓN DE SERVICIOS/CENTROS DE REHABILITACIÓN";
  hoja.getCell(`B${filaActual}`).style = {
    font: { bold: true, size: 14 },
    alignment: { horizontal: "center", vertical: "middle" },
  };
  filaActual += 2; 

  // 2. Info establecimiento

  hoja.getCell(`B${filaActual}`).value = "SEDES: POTOSI";
  hoja.getCell(`B${filaActual}`).style = estiloInfo;
  
  hoja.getCell(`K${filaActual}`).value = "RED DE SALUD: UNCIA";
  hoja.getCell(`K${filaActual}`).style = estiloInfo;
  
  hoja.getCell(`P${filaActual}`).value = "NIVEL: 1";
  hoja.getCell(`P${filaActual}`).style = estiloInfo;
  
  hoja.getCell(`U${filaActual}`).value = "SUBSECTOR PÚBLICO";
  hoja.getCell(`U${filaActual}`).style = estiloInfo;
  
  filaActual++;
  
  hoja.getCell(`B${filaActual}`).value = "ESTABLECIMIENTO: C. R. LLALLAGUA";
  hoja.getCell(`B${filaActual}`).style = estiloInfo;
  
  hoja.getCell(`K${filaActual}`).value = "MES REPORTADO: " + fechaReporte;
  hoja.getCell(`K${filaActual}`).style = estiloInfo;
  
  hoja.getCell(`P${filaActual}`).value = "GESTIÓN: " + new Date().getFullYear();
  hoja.getCell(`P${filaActual}`).style = estiloInfo;

  filaActual += 2;
  // 3. Sección de consultas - Título general con formato especial
  safeMerge(`B${filaActual}:X${filaActual}`);

  let tituloReporte = "NÚMERO DE ATENCIONES EN GENERAL";

  if (tipoReporte === "por-area" && areaSeleccionada) {
    tituloReporte += ` - ÁREA: ${areaSeleccionada.toUpperCase()}`;
  } else if (tipoReporte === "por-profesional" && profesionalSeleccionado) {
    const nombreProf =
      typeof profesionalSeleccionado === "object"
        ? `${profesionalSeleccionado.Nombre_prof} ${profesionalSeleccionado.Appaterno_prof} ${profesionalSeleccionado.Apmaterno_prof}`
        : "Profesional";
    tituloReporte += ` - PROFESIONAL: ${nombreProf}`;
  }
  hoja.getCell(`B${filaActual}`).value = tituloReporte;
  hoja.getCell(`B${filaActual}`).style = {
    font: { bold: true, size: 14 },
    alignment: { horizontal: "center", vertical: "middle" },
  };

  filaActual++;
  safeMerge(`B${filaActual}:C${filaActual + 1}`);
  aplicarBordesCeldasCombinadas(hoja, `B${filaActual}:C${filaActual + 1}`, {
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } },
    font: { bold: true, size: 12 },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
  });
 

  hoja.getCell(`B${filaActual}`).value = "1. CONSULTAS";

  // 5. Rangos de edad y sexo
  const rangosEdad = [
    { col: "D", rango: "<6 MESES", sexo: "M" },
    { col: "E", rango: "<6 MESES", sexo: "F" },
    { col: "F", rango: "6 M A 1 AÑO", sexo: "M" },
    { col: "G", rango: "6 M A 1 AÑO", sexo: "F" },
    { col: "H", rango: "1 A 4 AÑOS", sexo: "M" },
    { col: "I", rango: "1 A 4 AÑOS", sexo: "F" },
    { col: "J", rango: "5 A 9 AÑOS", sexo: "M" },
    { col: "K", rango: "5 A 9 AÑOS", sexo: "F" },
    { col: "L", rango: "10 A 14 AÑOS", sexo: "M" },
    { col: "M", rango: "10 A 14 AÑOS", sexo: "F" },
    { col: "N", rango: "15 A 19 AÑOS", sexo: "M" },
    { col: "O", rango: "15 A 19 AÑOS", sexo: "F" },
    { col: "P", rango: "20 A 39 AÑOS", sexo: "M" },
    { col: "Q", rango: "20 A 39 AÑOS", sexo: "F" },
    { col: "R", rango: "40 A 49 AÑOS", sexo: "M" },
    { col: "S", rango: "40 A 49 AÑOS", sexo: "F" },
    { col: "T", rango: "50 A 59 AÑOS", sexo: "M" },
    { col: "U", rango: "50 A 59 AÑOS", sexo: "F" },
    { col: "V", rango: ">60 AÑOS", sexo: "M" },
    { col: "W", rango: ">60 AÑOS", sexo: "F" },
  ];

  // 6. Encabezados rangos de edad en fila 10
  const rangosUnicos = [...new Set(rangosEdad.map((r) => r.rango))];
  rangosUnicos.forEach((rango, index) => {
    const startCol = String.fromCharCode(68 + index * 2);
    const endCol = String.fromCharCode(69 + index * 2);
    safeMerge(`${startCol}9:${endCol}9`);
    aplicarBordesCeldasCombinadas(
      hoja,
      `${startCol}9:${endCol}9`,
      estiloEncabezado
    );
    const cell = hoja.getCell(`${startCol}9`);
    cell.value = rango;
    cell.style = estiloEncabezado;
  });
  hoja.getCell(`X${filaActual}`).style = estiloEncabezado;
  safeMerge(`X${filaActual}:X${filaActual + 1}`);
  filaActual ++;
  hoja.getCell(`X${filaActual}`).style = estiloEncabezado;
  hoja.getCell(`X${filaActual}`).value = "TOTAL";
  // 7. Encabezados sexo en fila 11
  rangosEdad.forEach((rango) => {
    const cell = hoja.getCell(`${rango.col}10`);
    cell.value = rango.sexo;
    cell.style = estiloEncabezado;
  });
  //console.log("DATOS CRUDOS:", datos);
  // 8. Agrupar datos por área y profesional
const datosAgrupados = {};
datos.forEach((dato) => {
  const clave = `${dato.area}_${dato.profesional}`;
  if (!datosAgrupados[clave]) {
    datosAgrupados[clave] = {
      area: dato.area,
      profesional: dato.profesional,
      nuevos: [],
      repetidos: [],
    };
  }

  if (dato.tipo_sesion === "Nuevo") {
    datosAgrupados[clave].nuevos.push(dato);
  } else {
    datosAgrupados[clave].repetidos.push(dato);
  }
});

// 9. Escribir filas de consultas por cada área y tipo (N y R)
filaActual = 11;
let contadorConsulta = 1;

for (const area of areas) {
  const clavesArea = Object.keys(datosAgrupados).filter(
    (clave) => datosAgrupados[clave].area.toUpperCase() === area.Nombre.toUpperCase()
  );

  //  CORRECCIÓN: Si no hay datos para el área, crear una entrada vacía
  if (clavesArea.length === 0) {
    
    // Crear estructura vacía para el área
    const datosAreaVacia = {
      area: area.Nombre,
      profesional: "",
      nuevos: [],
      repetidos: [],
    };

    // --- FILA NUEVOS (N) VACÍA ---
    const numeracionN = `1.${contadorConsulta}`;
    hoja.getCell(`B${filaActual}`).value = `${numeracionN} ${area.Nombre}`;
    hoja.getCell(`B${filaActual}`).style = estiloCeldaRelleno;
    hoja.getCell(`C${filaActual}`).value = "N";
    hoja.getCell(`C${filaActual}`).style = estiloCeldaRelleno;

    // Todas las celdas de rangos vacías
    rangosEdad.forEach(({ col }) => {
      const cell = hoja.getCell(`${col}${filaActual}`);
      cell.value = "";
      cell.style = estiloCelda;
    });

    hoja.getCell(`X${filaActual}`).value = 0;
    hoja.getCell(`X${filaActual}`).style = estiloEncabezado;

    filaActual++;
    contadorConsulta++;

    // --- FILA REPETIDOS (R) VACÍA ---
    const numeracionR = `1.${contadorConsulta}`;
    hoja.getCell(`B${filaActual}`).value = `${numeracionR} ${area.Nombre}`;
    hoja.getCell(`B${filaActual}`).style = estiloCeldaRelleno;
    hoja.getCell(`C${filaActual}`).value = "R";
    hoja.getCell(`C${filaActual}`).style = estiloCeldaRelleno;

    // Todas las celdas de rangos vacías
    rangosEdad.forEach(({ col }) => {
      const cell = hoja.getCell(`${col}${filaActual}`);
      cell.value = "";
      cell.style = estiloCelda;
    });

    hoja.getCell(`X${filaActual}`).value = 0;
    hoja.getCell(`X${filaActual}`).style = estiloEncabezado;

    filaActual++;
    contadorConsulta++;
    
    continue; // Saltar al siguiente área
  }

  // 🔥 PROCESAR ÁREAS CON DATOS (código original)
  for (const clave of clavesArea) {
    const datosArea = datosAgrupados[clave];

    let nombreFila = datosArea.area;

    if (tipoReporte === "por-profesional" && datosArea.profesional) {
      nombreFila = ` ${datosArea.area}`;
    }

    // --- FILA NUEVOS (N) ---
    const numeracionN = `1.${contadorConsulta}`;
    hoja.getCell(`B${filaActual}`).value = `${numeracionN} ${nombreFila}`;
    hoja.getCell(`B${filaActual}`).style = estiloCeldaRelleno;
    hoja.getCell(`C${filaActual}`).value = "N";
    hoja.getCell(`C${filaActual}`).style = estiloCeldaRelleno;

    rangosEdad.forEach(({ col, rango, sexo }) => {
      const claveEdad = `${rango}_${sexo}`;
      const suma = datosArea.nuevos.reduce(
        (acc, cur) => acc + (cur[claveEdad] || 0),
        0
      );
      const cell = hoja.getCell(`${col}${filaActual}`);
      cell.value = suma === 0 ? "" : suma;
      cell.style = estiloCelda;
    });

    hoja.getCell(`X${filaActual}`).value = {
      formula: `SUM(D${filaActual}:W${filaActual})`,
    };
    hoja.getCell(`X${filaActual}`).style = estiloEncabezado;

    filaActual++;
    contadorConsulta++;

    // --- FILA REPETIDOS (R) ---
    const numeracionR = `1.${contadorConsulta}`;
    hoja.getCell(`B${filaActual}`).value = `${numeracionR} ${nombreFila}`;
    hoja.getCell(`B${filaActual}`).style = estiloCeldaRelleno;
    hoja.getCell(`C${filaActual}`).value = "R";
    hoja.getCell(`C${filaActual}`).style = estiloCeldaRelleno;

    rangosEdad.forEach(({ col, rango, sexo }) => {
      const claveEdad = `${rango}_${sexo}`;
      const suma = datosArea.repetidos.reduce(
        (acc, cur) => acc + (cur[claveEdad] || 0),
        0
      );
      const cell = hoja.getCell(`${col}${filaActual}`);
      cell.value = suma === 0 ? "" : suma;
      cell.style = estiloCelda;
    });

    hoja.getCell(`X${filaActual}`).value = {
      formula: `SUM(D${filaActual}:W${filaActual})`,
    };
    hoja.getCell(`X${filaActual}`).style = estiloEncabezado;

    filaActual++;
    contadorConsulta++;
  }
}

// Función  - debe recibir solo el rango
function safeMerge(rango) {
  try {
    hoja.mergeCells(rango);
  } catch (e) {
    console.warn(` No se pudo combinar el rango ${rango}:`, e.message);
  }
}
  // 10. Total vertical: suma de cada columna (D to W)
  const filaTotal = filaActual;
  hoja.getCell(`B${filaTotal}`).value = "TOTAL";
  hoja.getCell(`B${filaTotal}`).style = estiloEncabezado;

  const colD = "D".charCodeAt(0);
  const colW = "W".charCodeAt(0);
  for (let c = colD; c <= colW; c++) {
    const letra = String.fromCharCode(c);
    const formula = `SUM(${letra}11:${letra}${filaActual - 1})`;
    hoja.getCell(`${letra}${filaTotal}`).value = { formula };
    hoja.getCell(`${letra}${filaTotal}`).style = estiloEncabezado;
  }

  // Total general para columna X
  hoja.getCell(`X${filaTotal}`).value = {
    formula: `SUM(X11:X${filaActual - 1})`,
  };
  hoja.getCell(`X${filaTotal}`).style = estiloEncabezado;

  // 11. Aplicar bordes a toda la tabla
  const primeraFilaTabla = 10;
  const ultimaFilaTabla = filaTotal;
  const primeraCol = "B";
  const ultimaCol = "X";

  for (let row = primeraFilaTabla; row <= ultimaFilaTabla; row++) {
    for (
      let col = primeraCol.charCodeAt(0);
      col <= ultimaCol.charCodeAt(0);
      col++
    ) {
      const colLetter = String.fromCharCode(col);
      const cell = hoja.getCell(`${colLetter}${row}`);

      if (!cell.style || !cell.style.border) {
        cell.style = {
          ...cell.style,
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          },
        };
      }
    }
  }


  // 12. Tabla de PATOLOGÍAS DETECTADAS
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
    "Sindrome post poliomielitas",
    "Sinovitis",
    "Tendinitis - tendinosis",
    "Trastorno del Desarrollo",
    "Traumatismo craneoencefalico",
    "Ulceras por presion",
    "Otros",
  ];
  filaActual += 2; 

  // Encabezados de la tabla de patologías - COLUMNAS COMBINADAS
  safeMerge(`B${filaActual}:E${filaActual}`);
  aplicarBordesCeldasCombinadas(
    hoja,
    `B${filaActual}:E${filaActual}`,
    estiloEncabezado
  );
  hoja.getCell(`B${filaActual}`).value = "2. USUARIOS EN REHABILITACIÓN POR:";
  hoja.getCell(`B${filaActual}`).style = {
    ...estiloEncabezado,
    alignment: {  vertical: "middle" },
  };

  hoja.getCell(`F${filaActual}`).value = "NUMERO";
  hoja.getCell(`F${filaActual}`).style = estiloEncabezado;
  filaActual++;

  // Sumar todas las patologías de todos los datos
  const totalPatologias = {};
  patologias.forEach((patologia) => {
    totalPatologias[patologia] = 0;
  });

  datos.forEach((dato) => {
    patologias.forEach((patologia) => {
      totalPatologias[patologia] += dato[patologia] || 0;
    });
  });

  // CADA NOMBRE DE PATOLOGÍA OCUPA COLUMNAS COMBINADAS
  let totalGeneralPatologias = 0;
  PATOLOGIAS.forEach((patologia, index) => {
    const cantidad = totalPatologias[patologia] || 0;

    // Aplicar bordes primero y luego combinar
    aplicarBordesCeldasCombinadas(
      hoja,
      `B${filaActual}:E${filaActual}`,
      estiloCelda
    );
    safeMerge(`B${filaActual}:E${filaActual}`);

    hoja.getCell(`B${filaActual}`).value = `2.${index + 1} ${patologia}`;
    hoja.getCell(`B${filaActual}`).style = {
      ...estiloCelda,
      alignment: { horizontal: "left", vertical: "middle" },
    };

    hoja.getCell(`F${filaActual}`).value = cantidad;
    hoja.getCell(`F${filaActual}`).style = estiloCelda;

    totalGeneralPatologias += cantidad;
    filaActual++;
  });

  // Total de patologías - TAMBIÉN CON COLUMNAS COMBINADAS
  aplicarBordesCeldasCombinadas(
    hoja,
    `B${filaActual}:E${filaActual}`,
    estiloCeldaRelleno
  );
  safeMerge(`B${filaActual}:E${filaActual}`);

  hoja.getCell(`B${filaActual}`).value = "TOTAL";
  hoja.getCell(`B${filaActual}`).style = {
    ...estiloCeldaRelleno,
    alignment: { horizontal: "center", vertical: "middle" },
  };

  hoja.getCell(`F${filaActual}`).value = totalGeneralPatologias;
  hoja.getCell(`F${filaActual}`).style = estiloCeldaRelleno;
  filaActual++;

  // 13. Tabla de TÉCNICAS EN 3 COLUMNAS - Comenzando en la misma fila que patologías
  const TECNICAS_POR_AREA = {
    "3. FONOAUDIOLOGÍA": [
      "Evaluación Fonoaudiologica",
      "Terapia en patologías auditivas",
      "Terapias en patologías de la deglución",
      "Terapia en patologías de la voz",
      "Terapia en patologías del habla",
      "Terapia en patologías del lenguaje",
      "Terapia en trastornos de la comunicación",
      "Fonoaudiología en la comunidad",
    ],
    "4. EXAMENES COMPLEMENTARIOS AUDIOLÓGICOS": [
      "Audiometria tonal",
      "Audiometria tonal mas acufenometria",
      "Audiometria vocal o logoaudiometria",
      "Otoemisiones acusticas",
      "Pruebas vestibulares",
      "Otros",
    ],
    "5. TERAPIA OCUPACIONAL": [
      "Evaluación en Terapia ocupacional",
      "Terapia ocupacional en integración sensorial",
      "Terapia Ocupacional en integración social",
      "Terapia Ocupacional en intervencion comunitaria",
      "Terapia Ocupacional física",
      "Terapia ocupacional intelectual",
      "Promoción de la independencia y de la autonomia",
    ],
    "6. PSICOMOTRICIDAD": ["Atención psicomotriz", "Evaluación psicomotriz"],
    "7. FISIOTERAPIA Y KINESIOLOGÍA": [
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
    ],
    "8. PSICOLOGÍA": [
      "Dificultad de adaptación",
      "Dificultad de aprendizaje",
      "Dificultad de concentración",
      "Dificultad de toma de decisiones",
    ],
    "9. PSICOPEDAGOGIA": [
      "Atención psicopedagógica",
      "Evaluación psicopedagógica",
    ],
  };

  // Obtener la fila donde comienza la tabla de patologías
  const filaInicioPatologias = filaActual - (PATOLOGIAS.length + 2); // +2 por el encabezado y total

  // SEGUNDA COLUMNA: H a O (Técnicas 3-6)
  const areasCol2 = [
    "3. FONOAUDIOLOGÍA",
    "4. EXAMENES COMPLEMENTARIOS AUDIOLÓGICOS",
    "5. TERAPIA OCUPACIONAL",
    "6. PSICOMOTRICIDAD",
  ];

  let filaActualCol2 = filaInicioPatologias;

  for (const area of areasCol2) {
    const numeroArea = area.split(".")[0];

    // Encabezado del área
    safeMerge(`H${filaActualCol2}:N${filaActualCol2}`);
    aplicarBordesCeldasCombinadas(
      hoja,
      `H${filaActualCol2}:N${filaActualCol2}`,
      estiloEncabezado
    );
    hoja.getCell(`H${filaActualCol2}`).value = area;
    hoja.getCell(`H${filaActualCol2}`).style = {
      ...estiloEncabezado,
      alignment: { horizontal: "left", vertical: "middle" },
    };

    hoja.getCell(`O${filaActualCol2}`).value = "NUMERO";
    hoja.getCell(`O${filaActualCol2}`).style = estiloEncabezado;

    filaActualCol2++;

    // Técnicas del área
    let numeroTecnica = 1;
    let totalArea = 0;

    for (const tecnica of TECNICAS_POR_AREA[area]) {
      safeMerge(`H${filaActualCol2}:N${filaActualCol2}`);
      aplicarBordesCeldasCombinadas(
        hoja,
        `H${filaActualCol2}:N${filaActualCol2}`,
        estiloCelda
      );
      hoja.getCell(
        `H${filaActualCol2}`
      ).value = `${numeroArea}.${numeroTecnica} ${tecnica}`;
      hoja.getCell(`H${filaActualCol2}`).style = {
        ...estiloCelda,
        alignment: { horizontal: "left", vertical: "middle" },
      };

      // CORRECCIÓN: Sumar a través de todos los datos
      const valor = datos.reduce((sum, dato) => {
        return (
          sum +
          (dato.tecnicas && dato.tecnicas[tecnica] ? dato.tecnicas[tecnica] : 0)
        );
      }, 0);

      hoja.getCell(`O${filaActualCol2}`).value = valor;
      hoja.getCell(`O${filaActualCol2}`).style = estiloCelda;

      totalArea += valor;
      filaActualCol2++;
      numeroTecnica++;
    }

    // Fila TOTAL del área
    safeMerge(`H${filaActualCol2}:N${filaActualCol2}`);
    aplicarBordesCeldasCombinadas(
      hoja,
      `H${filaActualCol2}:N${filaActualCol2}`,
      estiloCeldaRelleno
    );
    hoja.getCell(`H${filaActualCol2}`).value = "TOTAL";
    hoja.getCell(`H${filaActualCol2}`).style = {
      ...estiloCeldaRelleno,
      alignment: { horizontal: "center", vertical: "middle" },
    };

    hoja.getCell(`O${filaActualCol2}`).value = totalArea;
    hoja.getCell(`O${filaActualCol2}`).style = estiloCeldaRelleno;

    filaActualCol2++;

    // Espacio entre áreas
    filaActualCol2++;
  }

  // TERCERA COLUMNA: Q a X (Técnicas 7-9)
  const areasCol3 = [
    "7. FISIOTERAPIA Y KINESIOLOGÍA",
    "8. PSICOLOGÍA",
    "9. PSICOPEDAGOGIA",
  ];

  let filaActualCol3 = filaInicioPatologias;

  for (const area of areasCol3) {
    const numeroArea = area.split(".")[0];

    // Encabezado del área
    safeMerge(`Q${filaActualCol3}:W${filaActualCol3}`);
    aplicarBordesCeldasCombinadas(
      hoja,
      `Q${filaActualCol3}:W${filaActualCol3}`,
      estiloEncabezado
    );
    hoja.getCell(`Q${filaActualCol3}`).value = area;

    hoja.getCell(`Q${filaActualCol3}`).style = {
      ...estiloEncabezado,
      alignment: { horizontal: "left", vertical: "middle" },
    };

    hoja.getCell(`X${filaActualCol3}`).value = "NUMERO";
    hoja.getCell(`X${filaActualCol3}`).style = estiloEncabezado;

    filaActualCol3++;

    // Técnicas del área
    let numeroTecnica = 1;
    let totalArea = 0;

    for (const tecnica of TECNICAS_POR_AREA[area]) {
      safeMerge(`Q${filaActualCol3}:W${filaActualCol3}`);
      aplicarBordesCeldasCombinadas(
        hoja,
        `Q${filaActualCol3}:W${filaActualCol3}`,
        estiloCelda
      );
      hoja.getCell(
        `Q${filaActualCol3}`
      ).value = `${numeroArea}.${numeroTecnica} ${tecnica}`;
      hoja.getCell(`Q${filaActualCol3}`).style = {
        ...estiloCelda,
        alignment: { horizontal: "left", vertical: "middle" },
      };

      const valor = datos.reduce((sum, dato) => {
        return (
          sum +
          (dato.tecnicas && dato.tecnicas[tecnica] ? dato.tecnicas[tecnica] : 0)
        );
      }, 0);

      hoja.getCell(`X${filaActualCol3}`).value = valor;
      hoja.getCell(`X${filaActualCol3}`).style = estiloCelda;

      totalArea += valor;
      filaActualCol3++;
      numeroTecnica++;
    }

    // Fila TOTAL del área
    safeMerge(`Q${filaActualCol3}:W${filaActualCol3}`);
    aplicarBordesCeldasCombinadas(
      hoja,
      `Q${filaActualCol3}:W${filaActualCol3}`,
      estiloCeldaRelleno
    );
    hoja.getCell(`Q${filaActualCol3}`).value = "TOTAL";
    hoja.getCell(`Q${filaActualCol3}`).style = {
      ...estiloCeldaRelleno,
      alignment: { horizontal: "center", vertical: "middle" },
    };

    hoja.getCell(`X${filaActualCol3}`).value = totalArea;
    hoja.getCell(`X${filaActualCol3}`).style = estiloCeldaRelleno;

    filaActualCol3++;
    // Espacio entre áreas
    filaActualCol3++;
  }

  filaActual = Math.max(filaActual, filaActualCol2, filaActualCol3);


// 13. Tabla de ACTIVIDADES DEL ESTABLECIMIENTO Y CON LA COMUNIDAD

const ultimaFilaTecnicas = Math.max(filaActual, filaActualCol2, filaActualCol3);
filaActual = ultimaFilaTecnicas -2 ; // Espacio después de las tablas de técnicas

// Encabezado principal - ocupa de H a X
safeMerge(`H${filaActual}:W${filaActual}`);
aplicarBordesCeldasCombinadas(
  hoja,
  `H${filaActual}:W${filaActual}`,
  estiloEncabezado
);
hoja.getCell(`H${filaActual}`).value = "13. ACTIVIDADES DEL ESTABLECIMIENTO Y CON LA COMUNIDAD";
hoja.getCell(`H${filaActual}`).style = {
  ...estiloEncabezado,
  alignment: { vertical: "middle" },
};

hoja.getCell(`X${filaActual}`).value = "NUMERO";
hoja.getCell(`X${filaActual}`).style = estiloEncabezado;
filaActual++;

// Lista de actividades (según TIPOS_ACTIVIDAD)
const actividades = [
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
  "N° de actividades a favor de las Personas con Discapacidad"
];

// Sumar todas las actividades de todos los datos
const totalActividades = {};
actividades.forEach((actividad) => {
  totalActividades[actividad] = 0;
});

datos.forEach((dato) => {
  actividades.forEach((actividad) => {
    totalActividades[actividad] += dato.actividades && dato.actividades[actividad] ? dato.actividades[actividad] : 0;
  });
});

// Escribir cada actividad
let totalGeneralActividades = 0;
actividades.forEach((actividad, index) => {
  const cantidad = totalActividades[actividad] || 0;

  // Aplicar bordes y combinar columnas H-W
  aplicarBordesCeldasCombinadas(
    hoja,
    `H${filaActual}:W${filaActual}`,
    estiloCelda
  );
  safeMerge(`H${filaActual}:W${filaActual}`);

  hoja.getCell(`H${filaActual}`).value = `13.${index + 1} ${actividad}`;
  hoja.getCell(`H${filaActual}`).style = {
    ...estiloCelda,
    alignment: { horizontal: "left", vertical: "middle" },
  };

  hoja.getCell(`X${filaActual}`).value = cantidad;
  hoja.getCell(`X${filaActual}`).style = estiloCelda;

  totalGeneralActividades += cantidad;
  filaActual++;
});

// Total de actividades - también de H a X
aplicarBordesCeldasCombinadas(
  hoja,
  `H${filaActual}:W${filaActual}`,
  estiloCeldaRelleno
);
safeMerge(`H${filaActual}:W${filaActual}`);

hoja.getCell(`H${filaActual}`).value = "TOTAL";
hoja.getCell(`H${filaActual}`).style = {
  ...estiloCeldaRelleno,
  alignment: { horizontal: "center", vertical: "middle" },
};

hoja.getCell(`X${filaActual}`).value = totalGeneralActividades;
hoja.getCell(`X${filaActual}`).style = estiloCeldaRelleno;
filaActual++;




  // 13. Tabla de ESTADOS DE TRATAMIENTO
  filaActual =filaActual-13;
  // Estados normales sin Abandono
  const estadosTratamiento = [
    { nombre: "N° DE ALTAS DEFINITIVAS", key: "Alta definitiva" },
    { nombre: "N° DE ALTAS TEMPORALES", key: "Alta temporal" },
    {
      nombre: "N° PACIENTES QUE CONTINUAN EN TRATAMIENTO",
      key: "En tratamiento",
    },
  ];

  // Razones de abandono
  const razones = razonesAbandono || [];
  const abandonos = razones.map((r) => `Abandono - ${r}`);
  abandonos.push("Abandono - Razón no especificada");

  // Inicializar todos los estados con 0 para mostrar siempre
  const totalEstados = {};

  // Inicializar estados normales
  estadosTratamiento.forEach((estado) => {
    totalEstados[estado.key] = 0;
  });

  // Inicializar abandonos
  abandonos.forEach((abandono) => {
    totalEstados[abandono] = 0;
  });

  // Sumar los datos
  datos.forEach((dato) => {
    estadosTratamiento.forEach((estado) => {
      totalEstados[estado.key] += dato[estado.key] || 0;
    });
    abandonos.forEach((abandono) => {
      totalEstados[abandono] += dato[abandono] || 0;
    });
  });

  // 1️ Escribir todos los estados normales
  let totalGeneralEstados = 0;
  estadosTratamiento.forEach((estado) => {
    // Aplicar bordes y combinar columnas B y E
    aplicarBordesCeldasCombinadas(
      hoja,
      `B${filaActual}:E${filaActual}`,
      estiloCeldaRelleno
    );
    safeMerge(`B${filaActual}:E${filaActual}`);

    hoja.getCell(`B${filaActual}`).value = estado.nombre;
    hoja.getCell(`B${filaActual}`).style = {
      ...estiloCeldaRelleno,
      alignment: { horizontal: "left", vertical: "middle" },
    };

    hoja.getCell(`F${filaActual}`).value = totalEstados[estado.key];
    hoja.getCell(`F${filaActual}`).style = estiloCeldaRelleno;

    totalGeneralEstados += totalEstados[estado.key];
    filaActual++;
  });

  // 2️ Total de Abandonos (solo sumando total, no las razones)
  const totalAbandonos = abandonos.reduce(
    (sum, key) => sum + (totalEstados[key] || 0),
    0
  );

  // Aplicar bordes y combinar columnas B y E
  aplicarBordesCeldasCombinadas(
    hoja,
    `B${filaActual}:E${filaActual}`,
    estiloCeldaRelleno
  );
  safeMerge(`B${filaActual}:E${filaActual}`);

  hoja.getCell(`B${filaActual}`).value = "N° ABANDONO DE REHABILITACIÓN";
  hoja.getCell(`B${filaActual}`).style = {
    ...estiloCeldaRelleno,
    alignment: { horizontal: "left", vertical: "middle" },
  };

  hoja.getCell(`F${filaActual}`).value = totalAbandonos;
  hoja.getCell(`F${filaActual}`).style = estiloCeldaRelleno;
  filaActual++;

  // 3️ Desglose por razón de abandono
  abandonos.forEach((abandono) => {
    // Aplicar bordes y combinar columnas B y E
    aplicarBordesCeldasCombinadas(
      hoja,
      `B${filaActual}:E${filaActual}`,
      estiloCelda
    );
    safeMerge(`B${filaActual}:E${filaActual}`);

    hoja.getCell(`B${filaActual}`).value = `   ${abandono.replace(
      "Abandono - ",
      ""
    )}`;
    hoja.getCell(`B${filaActual}`).style = {
      ...estiloCelda,
      alignment: { horizontal: "left", vertical: "middle" },
    };

    hoja.getCell(`F${filaActual}`).value = totalEstados[abandono];
    hoja.getCell(`F${filaActual}`).style = estiloCelda;
    filaActual++;
  });

  // 4️ Total general de estados (suma normal + abandonos)
  const totalTodosEstados = totalGeneralEstados + totalAbandonos;

  // Aplicar bordes y combinar columnas B y C
  aplicarBordesCeldasCombinadas(
    hoja,
    `B${filaActual}:E${filaActual}`,
    estiloCeldaRelleno
  );
  safeMerge(`B${filaActual}:E${filaActual}`);

  hoja.getCell(`B${filaActual}`).value = "TOTAL";
  hoja.getCell(`B${filaActual}`).style = {
    ...estiloCeldaRelleno,
    alignment: { horizontal: "center", vertical: "middle" },
  };

  hoja.getCell(`F${filaActual}`).value = totalTodosEstados;
  hoja.getCell(`F${filaActual}`).style = estiloCeldaRelleno;

  // Aplicar bordes a toda la tabla de estados
  const primeraFilaEstados =
    filaActual - (estadosTratamiento.length + abandonos.length + 3);
  const ultimaFilaEstados = filaActual - 1;

  for (let row = primeraFilaEstados; row <= ultimaFilaEstados; row++) {
    for (let col = "B".charCodeAt(0); col <= "D".charCodeAt(0); col++) {
      const colLetter = String.fromCharCode(col);
      const cell = hoja.getCell(`${colLetter}${row}`);
      if (!cell.style.border) {
        cell.style = { ...cell.style, ...estiloCelda };
      }
    }
  }

  // 14. TABLAS DE DISCAPACIDAD
  filaActual += 2; 

  // 14.1 Título principal de discapacidad
  safeMerge(`B${filaActual}:W${filaActual}`);
  aplicarBordesCeldasCombinadas(
    hoja,
    `B${filaActual}:W${filaActual}`,
    estiloTitulo
  );
  hoja.getCell(`B${filaActual}`).value =
    "NUMERO DE ATENCIONES A PERSONAS CON DISCAPACIDAD";
  hoja.getCell(`B${filaActual}`).style = estiloTitulo;
  filaActual++;

  // 14.3 Encabezados de rangos de edad
  rangosUnicos.forEach((rango, index) => {
    const startCol = String.fromCharCode(68 + index * 2);
    const endCol = String.fromCharCode(69 + index * 2);
    safeMerge(`${startCol}${filaActual}:${endCol}${filaActual}`);
    aplicarBordesCeldasCombinadas(
      hoja,
      `${startCol}${filaActual}:${endCol}${filaActual}`,
      estiloEncabezado
    );
    const cell = hoja.getCell(`${startCol}${filaActual}`);
    cell.value = rango;
    cell.style = estiloEncabezado;
  });

  // 14.4 Encabezado TOTAL
  hoja.getCell(`X${filaActual}`).value = "TOTAL";
  hoja.getCell(`X${filaActual}`).style = estiloEncabezado;
  filaActual++;


  // 14.5 Encabezados de sexo
  hoja.getCell(`B${filaActual}`).value = "";
  hoja.getCell(`B${filaActual}`).style = estiloEncabezado;
  hoja.getCell(`C${filaActual}`).value = "";
  hoja.getCell(`C${filaActual}`).style = estiloEncabezado;

  rangosEdad.forEach((rango) => {
    const cell = hoja.getCell(`${rango.col}${filaActual}`);
    cell.value = rango.sexo;
    cell.style = estiloEncabezado;
  });

  hoja.getCell(`X${filaActual}`).value = "";
  hoja.getCell(`X${filaActual}`).style = estiloEncabezado;
  filaActual++;

  // 14.6 Filas de datos para discapacidad (NUEVAS y REPETIDAS)
  // NUEVAS
  hoja.getCell(`B${filaActual}`).value = "NUEVAS";
  hoja.getCell(`B${filaActual}`).style = estiloCeldaRelleno;
  hoja.getCell(`C${filaActual}`).value = "N";
  hoja.getCell(`C${filaActual}`).style = estiloCeldaRelleno;

  // Calcular y escribir datos para NUEVAS con discapacidad
  let totalNuevasDisc = 0;
  rangosEdad.forEach(({ col, rango, sexo }) => {
    const clave = `DISC_${rango}_${sexo}`;
    const suma = datos.reduce((acc, dato) => {
      // Solo sumar datos de sesiones NUEVAS
      if (dato.tipo_sesion === "Nuevo") {
        return acc + (dato[clave] || 0);
      }
      return acc;
    }, 0);
    const cell = hoja.getCell(`${col}${filaActual}`);
    cell.value = suma === 0 ? "" : suma;
    cell.style = estiloCelda;
    totalNuevasDisc += suma;
  });

  hoja.getCell(`X${filaActual}`).value =
    totalNuevasDisc === 0 ? "" : totalNuevasDisc;
  hoja.getCell(`X${filaActual}`).style = estiloEncabezado;
  filaActual++;

  // REPETIDAS
  hoja.getCell(`B${filaActual}`).value = "REPETIDAS";
  hoja.getCell(`B${filaActual}`).style = estiloCeldaRelleno;
  hoja.getCell(`C${filaActual}`).value = "R";
  hoja.getCell(`C${filaActual}`).style = estiloCeldaRelleno;

  // Calcular y escribir datos para REPETIDAS con discapacidad
  let totalRepetidasDisc = 0;
  rangosEdad.forEach(({ col, rango, sexo }) => {
    const clave = `DISC_${rango}_${sexo}`;
    const suma = datos.reduce((acc, dato) => {
      // Solo sumar datos de sesiones REPETIDAS
      if (dato.tipo_sesion === "Repetido") {
        return acc + (dato[clave] || 0);
      }
      return acc;
    }, 0);
    const cell = hoja.getCell(`${col}${filaActual}`);
    cell.value = suma === 0 ? "" : suma;
    cell.style = estiloCelda;
    totalRepetidasDisc += suma;
  });

  hoja.getCell(`X${filaActual}`).value =
    totalRepetidasDisc === 0 ? "" : totalRepetidasDisc;
  hoja.getCell(`X${filaActual}`).style = estiloEncabezado;
  filaActual++;

  // 14.7 TOTAL
  hoja.getCell(`B${filaActual}`).value = "TOTAL";
  hoja.getCell(`B${filaActual}`).style = estiloEncabezado;
  hoja.getCell(`C${filaActual}`).value = "";
  hoja.getCell(`C${filaActual}`).style = estiloEncabezado;

  // Calcular y escribir TOTALES por columna
  rangosEdad.forEach(({ col, rango, sexo }) => {
    const clave = `DISC_${rango}_${sexo}`;
    const suma = datos.reduce((acc, dato) => acc + (dato[clave] || 0), 0);
    const cell = hoja.getCell(`${col}${filaActual}`);
    cell.value = suma === 0 ? "" : suma;
    cell.style = estiloEncabezado;
  });

  const totalGeneralDisc = totalNuevasDisc + totalRepetidasDisc;
  hoja.getCell(`X${filaActual}`).value =
    totalGeneralDisc === 0 ? "" : totalGeneralDisc;
  hoja.getCell(`X${filaActual}`).style = estiloEncabezado;
  filaActual++;

  // 14.8 Aplicar bordes a la tabla de discapacidad
  const primeraFilaDisc = filaActual - 5; 
  const ultimaFilaDisc = filaActual - 1; 
  for (let row = primeraFilaDisc; row <= ultimaFilaDisc; row++) {
    for (let col = "B".charCodeAt(0); col <= "X".charCodeAt(0); col++) {
      const colLetter = String.fromCharCode(col);
      const cell = hoja.getCell(`${colLetter}${row}`);
      if (!cell.style.border) {
        cell.style = { ...cell.style, ...estiloCelda };
      }
    }
  }
  filaActual += 1;
  const filaInicioTablasDisc = filaActual;

  // 15.1 Tabla de GRADO DE DISCAPACIDAD (izquierda)
  const gradosDiscapacidad = ["Moderado", "Grave", "Muy Grave"];

  // Combinar B-D para el título
  safeMerge(`B${filaActual}:D${filaActual}`);
  aplicarBordesCeldasCombinadas(
    hoja,
    `B${filaActual}:D${filaActual}`,
    estiloEncabezado
  );
  hoja.getCell(`B${filaActual}`).value = "ATENCIÓN POR GRADO DE DISCAPACIDAD";
  hoja.getCell(`B${filaActual}`).style = {
    ...estiloEncabezado,
    alignment: { horizontal: "center" },
  };

  // M, F, TOTAL en la misma fila
  hoja.getCell(`E${filaActual}`).value = "M";
  hoja.getCell(`E${filaActual}`).style = estiloEncabezado;

  hoja.getCell(`F${filaActual}`).value = "F";
  hoja.getCell(`F${filaActual}`).style = estiloEncabezado;

  hoja.getCell(`G${filaActual}`).value = "TOTAL";
  hoja.getCell(`G${filaActual}`).style = estiloEncabezado;

  filaActual++;

  let totalGeneralGradoDisc = 0;

  gradosDiscapacidad.forEach((grado) => {
    const totalM = datos.reduce(
      (sum, dato) => sum + (dato[`${grado}_M`] || 0),
      0
    );
    const totalF = datos.reduce(
      (sum, dato) => sum + (dato[`${grado}_F`] || 0),
      0
    );
    const totalGrado = totalM + totalF;
    totalGeneralGradoDisc += totalGrado;

    // Nombre del grado ocupa 3 columnas combinadas
    safeMerge(`B${filaActual}:D${filaActual}`);
    aplicarBordesCeldasCombinadas(
      hoja,
      `B${filaActual}:D${filaActual}`,
      estiloCelda
    );
    hoja.getCell(`B${filaActual}`).value = grado;
    hoja.getCell(`B${filaActual}`).style = {
      ...estiloCelda,
      alignment: { horizontal: "center" },
    };

    // M
    hoja.getCell(`E${filaActual}`).value = totalM || "";
    hoja.getCell(`E${filaActual}`).style = estiloCelda;

    // F
    hoja.getCell(`F${filaActual}`).value = totalF || "";
    hoja.getCell(`F${filaActual}`).style = estiloCelda;

    // TOTAL
    hoja.getCell(`G${filaActual}`).value = totalGrado || "";
    hoja.getCell(`G${filaActual}`).style = estiloCelda;

    filaActual++;
  });
  // --- Total general de la tabla de grado ---
  const totalMGeneral = datos.reduce(
    (sum, dato) =>
      sum +
      (dato["Moderado_M"] || 0) +
      (dato["Grave_M"] || 0) +
      (dato["Muy Grave_M"] || 0),
    0
  );
  const totalFGeneral = datos.reduce(
    (sum, dato) =>
      sum +
      (dato["Moderado_F"] || 0) +
      (dato["Grave_F"] || 0) +
      (dato["Muy Grave_F"] || 0),
    0
  );

  safeMerge(`B${filaActual}:D${filaActual}`);
  aplicarBordesCeldasCombinadas(
    hoja,
    `B${filaActual}:D${filaActual}`,
    estiloCeldaRelleno
  );
  hoja.getCell(`B${filaActual}`).value = "TOTAL";
  hoja.getCell(`B${filaActual}`).style = {
    ...estiloCeldaRelleno,
    alignment: { horizontal: "center" },
  };

  hoja.getCell(`E${filaActual}`).value = totalMGeneral || "";
  hoja.getCell(`E${filaActual}`).style = estiloCeldaRelleno;

  hoja.getCell(`F${filaActual}`).value = totalFGeneral || "";
  hoja.getCell(`F${filaActual}`).style = estiloCeldaRelleno;

  hoja.getCell(`G${filaActual}`).value = totalGeneralGradoDisc || "";
  hoja.getCell(`G${filaActual}`).style = estiloCeldaRelleno;

  // 15.2 Tabla de TIPO DE DISCAPACIDAD (derecha) con 2 columnas por tipo
  const tiposDiscapacidad = [
    "FÍSICA",
    "INTELECTUAL",
    "MÚLTIPLE",
    "VISUAL",
    "AUDITIVO",
    "MENTAL",
  ];

  // Fila donde inicia la tabla
  let filaTipoDisc = filaInicioTablasDisc;

  safeMerge(`L${filaTipoDisc}:W${filaTipoDisc}`);
  aplicarBordesCeldasCombinadas(
    hoja,
    `L${filaTipoDisc}:W${filaTipoDisc}`,
    estiloEncabezado
  );
  hoja.getCell(`L${filaTipoDisc}`).value =
    "NÚMERO DE ATENCIONES POR TIPO DE DISCAPACIDAD";
  hoja.getCell(`L${filaTipoDisc}`).style = estiloEncabezado;
  hoja.getCell(`L${filaTipoDisc}`).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  filaTipoDisc++;

  let colInicial = "L".charCodeAt(0);

  tiposDiscapacidad.forEach((tipo, index) => {
    const colLetterStart = String.fromCharCode(colInicial + index * 2);
    const colLetterEnd = String.fromCharCode(colInicial + index * 2 + 1);

    // Fusionar dos columnas por tipo y aplicar bordes
    safeMerge(
      `${colLetterStart}${filaTipoDisc}:${colLetterEnd}${filaTipoDisc}`
    );
    aplicarBordesCeldasCombinadas(
      hoja,
      `${colLetterStart}${filaTipoDisc}:${colLetterEnd}${filaTipoDisc}`,
      estiloEncabezado
    );

    hoja.getCell(`${colLetterStart}${filaTipoDisc}`).value = tipo;
    hoja.getCell(`${colLetterStart}${filaTipoDisc}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    hoja.getCell(`${colLetterStart}${filaTipoDisc}`).style = estiloEncabezado;
  });

  tiposDiscapacidad.forEach((tipo, index) => {
    const colLetterStart = String.fromCharCode(colInicial + index * 2);
    const colLetterEnd = String.fromCharCode(colInicial + index * 2 + 1);

    const totalTipo = datos.reduce(
      (sum, dato) => sum + (dato[tipo.toUpperCase()] || 0),
      0
    );

    // Fusionar dos columnas para el valor y aplicar bordes
    safeMerge(
      `${colLetterStart}${filaTipoDisc + 1}:${colLetterEnd}${filaTipoDisc + 1}`
    );
    aplicarBordesCeldasCombinadas(
      hoja,
      `${colLetterStart}${filaTipoDisc + 1}:${colLetterEnd}${filaTipoDisc + 1}`,
      estiloCelda
    );

    hoja.getCell(`${colLetterStart}${filaTipoDisc + 1}`).value =
      totalTipo || "";
    hoja.getCell(`${colLetterStart}${filaTipoDisc + 1}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    hoja.getCell(`${colLetterStart}${filaTipoDisc + 1}`).style = estiloCelda;
  });

  const filaTotales = filaTipoDisc + 2;
  const totalGeneral = tiposDiscapacidad.reduce(
    (sum, tipo) =>
      sum + datos.reduce((s, d) => s + (d[tipo.toUpperCase()] || 0), 0),
    0
  );

  safeMerge(`L${filaTotales}:W${filaTotales}`);
  aplicarBordesCeldasCombinadas(
    hoja,
    `L${filaTotales}:W${filaTotales}`,
    estiloEncabezado
  );
  hoja.getCell(`L${filaTotales}`).value = totalGeneral;
  hoja.getCell(`L${filaTotales}`).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  hoja.getCell(`L${filaTotales}`).style = estiloEncabezado;

  const aplicarBordesTabla = (filaInicio, filaFin, colInicio, colFin) => {
    for (let row = filaInicio; row <= filaFin; row++) {
      for (
        let col = colInicio.charCodeAt(0);
        col <= colFin.charCodeAt(0);
        col++
      ) {
        const colLetter = String.fromCharCode(col);
        const cell = hoja.getCell(`${colLetter}${row}`);
        if (!cell.style.border) {
          cell.style = { ...cell.style, ...estiloCelda };
        }
      }
    }
  };

  // Bordes tabla de tipo (L a W)
  aplicarBordesTabla(filaTipoDisc, filaTotales, "L", "W");

  // Bordes tabla de grado (izquierda)
  aplicarBordesTabla(filaInicioTablasDisc, filaActual, "B", "G");

  // 16. Ajustar anchos columnas
  hoja.columns = [
    { key: "A", width: 2 },
    { key: "B", width: 25 },
    { key: "C", width: 4 },
    ...Array(20).fill({ width: 7 }),
  ];

  // 17. Ajustar altura filas
  hoja.eachRow((row) => {
    row.height = 20;
  });
  
filaActual += 6; 

// Combinar y aplicar estilo para cada sección
const estiloFirma = {
  font: { bold: true },
  alignment: { horizontal: "center", vertical: "middle" },
};

// NOMBRE Y APELLIDO 
safeMerge(`B${filaActual}:G${filaActual}`);
aplicarBordesCeldasCombinadas(hoja, `B${filaActual}:G${filaActual}`, estiloFirma);
hoja.getCell(`B${filaActual}`).value = "NOMBRE Y APELLIDO";
hoja.getCell(`B${filaActual}`).style = estiloFirma;

safeMerge(`J${filaActual}:N${filaActual}`);
aplicarBordesCeldasCombinadas(hoja, `J${filaActual}:N${filaActual}`, estiloFirma);
hoja.getCell(`J${filaActual}`).value = "FIRMA Y SELLO";
hoja.getCell(`J${filaActual}`).style = estiloFirma;

hoja.getCell(`S${filaActual}`).value = "LUGAR Y FECHA";
hoja.getCell(`S${filaActual}`).style = estiloFirma;
filaActual ++;
// Combinar dos filas: B y C (filaActual y filaActual+1)
safeMerge(`B${filaActual}:G${filaActual + 1}`);
aplicarBordesCeldasCombinadas(hoja, `B${filaActual}:G${filaActual + 1}`, estiloFirma);
hoja.getCell(`B${filaActual}`).value = "DECLARO LA VERACIDAD DE LOS DATOS DEL PRESENTE FORMULARIO";
hoja.getCell(`B${filaActual}`).style = estiloFirma;

// area de impresion
hoja.pageSetup = {
  printArea: 'A1:X' + filaActual,
  fitToPage: true,
  fitToWidth: 1,
  fitToHeight: 1,
  orientation: 'portrait',
  margins: {
    left: 0.2,
    right: 0.2,
    top: 0.2,
    bottom: 0.2,
    header: 0.1,
    footer: 0.1
  },
  scale: 85,      
  paperSize: 1
};

// Reducir aún más tamaños
hoja.eachRow((row, rowNumber) => {
  row.height = 16;
  if (rowNumber > 1) { 
    row.eachCell((cell) => {
      if (cell.style && cell.style.font) {
        cell.style.font.size = Math.max(8, (cell.style.font.size || 11) - 2);
      }
    });
  }
});
return libro;
}

module.exports = { generarExcelReporte };
