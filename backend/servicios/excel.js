const ExcelJS = require('exceljs');
const axios = require('axios');
const db = require('../modelos');
const { Op } = require('sequelize');

async function generarExcelReporte(datos, config) {
  const { areaSeleccionada, profesionalSeleccionado, fechaReporte, tipoReporte } = config;
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('FORM GENERAL Y PCD');

  // Estilos
  const estiloEncabezado = {
    font: { bold: true, size: 12 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
    border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
    alignment: { horizontal: 'center' }
  };

  const estiloTitulo = {
    font: { bold: true, size: 14 },
    alignment: { horizontal: 'center' }
  };

  const estiloCelda = {
    border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  };

  const estiloCeldaRelleno = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
    border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  };

  const estiloInfo = {
    font: { bold: true }
  };

  const estiloMensajeSinDatos = {
    font: { bold: true, color: { argb: 'FFFF0000' } },
    alignment: { horizontal: 'center' }
  };

  // Obtener las áreas desde la API
  let areas = [];
  try {
    const response = await axios.get('http://localhost:5000/api/area/listar');
    areas = response.data.map(area => ({
      Idarea: area.Idarea,
      Nombre: area.Nombre.toUpperCase()
    }));
  } catch (error) {
    console.error('Error al obtener áreas:', error);
  }

  // Si es reporte por profesional, usar su área
  if (tipoReporte === 'por-profesional' && profesionalSeleccionado) {
    try {
      const profesional = await db.ProfSalud.findByPk(
        typeof profesionalSeleccionado === 'object' ? profesionalSeleccionado.Idprof : profesionalSeleccionado, 
        {
          include: {
            model: db.Area,
            as: 'area'
          }
        }
      );
      
      if (profesional && profesional.area) {
        areas = [{
          Idarea: profesional.area.Idarea,
          Nombre: profesional.area.Nombre.toUpperCase()
        }];
      }
    } catch (error) {
      console.error('Error al obtener área del profesional:', error);
    }
  } else if (tipoReporte === 'por-area' && areaSeleccionada) {
    // Filtrar solo el área seleccionada
    const area = areas.find(a => a.Nombre === areaSeleccionada.toUpperCase());
    if (area) {
      areas = [area];
    }
  }

  // 1. Encabezado principal
  hoja.mergeCells('B3:X3');
  hoja.getCell('B3').value = 'FORMULARIO DE CONSOLIDACION DE PRODUCCIÓN DE SERVICIOS/CENTROS DE REHABILITACIÓN';
  hoja.getCell('B3').style = estiloTitulo;

  // 2. Info establecimiento
  hoja.getCell('B6').value = 'SEDES: POTOSI';
  hoja.getCell('B6').style = estiloInfo;

  hoja.getCell('K6').value = 'RED DE SALUD: UNCIA';
  hoja.getCell('K6').style = estiloInfo;

  hoja.getCell('P6').value = 'NIVEL: 1';
  hoja.getCell('P6').style = estiloInfo;

  hoja.getCell('U6').value = 'SUBSECTOR PÚBLICO';
  hoja.getCell('U6').style = estiloInfo;

  hoja.getCell('B7').value = 'ESTABLECIMIENTO: C. R. LLALLAGUA';
  hoja.getCell('B7').style = estiloInfo;

  hoja.getCell('K7').value = 'MES REPORTADO: ' + fechaReporte;
  hoja.getCell('K7').style = estiloInfo;

  hoja.getCell('P7').value = 'GESTIÓN: ' + new Date().getFullYear();
  hoja.getCell('P7').style = estiloInfo;

  // 3. Sección de consultas - Título general con formato especial
  hoja.mergeCells('B9:X9');
  let tituloReporte = 'NÚMERO DE ATENCIONES EN GENERAL';
  
  if (tipoReporte === 'por-area' && areaSeleccionada) {
    tituloReporte += ` - ÁREA: ${areaSeleccionada.toUpperCase()}`;
  } else if (tipoReporte === 'por-profesional' && profesionalSeleccionado) {
    const nombreProf = typeof profesionalSeleccionado === 'object' 
      ? `${profesionalSeleccionado.Nombre_prof} ${profesionalSeleccionado.Appaterno_prof}`
      : 'Profesional';
    tituloReporte += ` - PROFESIONAL: ${nombreProf}`;
  }
  
  hoja.getCell('B9').value = tituloReporte;
  hoja.getCell('B9').style = {
    font: { bold: true, size: 12 },
    alignment: { horizontal: 'center', vertical: 'middle' }
  };

  // 4. Encabezado "1. CONSULTAS" 
  hoja.mergeCells('B10:C11');
  hoja.getCell('B10').value = '1. CONSULTAS';
  hoja.getCell('B10').style = {
    font: { bold: true, size: 12 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
    alignment: { 
      horizontal: 'center', 
      vertical: 'middle',
      wrapText: true
    }
  };

  // 5. Rangos de edad y sexo
  const rangosEdad = [
    { col: 'D', rango: '<6 MESES', sexo: 'M' },
    { col: 'E', rango: '<6 MESES', sexo: 'F' },
    { col: 'F', rango: '6 M A 1 AÑO', sexo: 'M' },
    { col: 'G', rango: '6 M A 1 AÑO', sexo: 'F' },
    { col: 'H', rango: '1 A 4 AÑOS', sexo: 'M' },
    { col: 'I', rango: '1 A 4 AÑOS', sexo: 'F' },
    { col: 'J', rango: '5 A 9 AÑOS', sexo: 'M' },
    { col: 'K', rango: '5 A 9 AÑOS', sexo: 'F' },
    { col: 'L', rango: '10 A 14 AÑOS', sexo: 'M' },
    { col: 'M', rango: '10 A 14 AÑOS', sexo: 'F' },
    { col: 'N', rango: '15 A 19 AÑOS', sexo: 'M' },
    { col: 'O', rango: '15 A 19 AÑOS', sexo: 'F' },
    { col: 'P', rango: '20 A 39 AÑOS', sexo: 'M' },
    { col: 'Q', rango: '20 A 39 AÑOS', sexo: 'F' },
    { col: 'R', rango: '40 A 49 AÑOS', sexo: 'M' },
    { col: 'S', rango: '40 A 49 AÑOS', sexo: 'F' },
    { col: 'T', rango: '50 A 59 AÑOS', sexo: 'M' },
    { col: 'U', rango: '50 A 59 AÑOS', sexo: 'F' },
    { col: 'V', rango: '>60 AÑOS', sexo: 'M' },
    { col: 'W', rango: '>60 AÑOS', sexo: 'F' }
  ];

  // 6. Encabezados rangos de edad en fila 10
  const rangosUnicos = [...new Set(rangosEdad.map(r => r.rango))];
  rangosUnicos.forEach((rango, index) => {
    const startCol = String.fromCharCode(68 + index * 2);
    const endCol = String.fromCharCode(69 + index * 2);
    hoja.mergeCells(`${startCol}10:${endCol}10`);
    const cell = hoja.getCell(`${startCol}10`);
    cell.value = rango;
    cell.style = estiloEncabezado;
  });

  // 7. Encabezados sexo en fila 11
  rangosEdad.forEach(rango => {
    const cell = hoja.getCell(`${rango.col}11`);
    cell.value = rango.sexo;
    cell.style = estiloEncabezado;
  });

  // 8. Total horizontal en fila 11
  hoja.getCell('X10').value = '';
  hoja.getCell('X10').style = estiloEncabezado;
  hoja.getCell('X11').value = 'TOTAL';
  hoja.getCell('X11').style = estiloEncabezado;

  // Verificar si hay datos para mostrar
  if (datos.length === 0) {
    hoja.mergeCells('B12:X12');
    hoja.getCell('B12').value = 'NO SE ENCONTRARON DATOS PARA LOS CRITERIOS SELECCIONADOS';
    hoja.getCell('B12').style = estiloMensajeSinDatos;
    return libro;
  }

  // 9. Escribir filas de consultas por cada área y tipo (N y R)
  let filaActual = 12;
  const indicePrincipal = 1;
  let subIndice = 1;

  // Agrupar datos por área y profesional
  const datosAgrupados = {};
  datos.forEach(dato => {
    const clave = `${dato.area}_${dato.profesional}`;
    if (!datosAgrupados[clave]) {
      datosAgrupados[clave] = {
        area: dato.area,
        profesional: dato.profesional,
        nuevos: [],
        repetidos: []
      };
    }
    
    if (dato.tipo_sesion === 'Nuevo') {
      datosAgrupados[clave].nuevos.push(dato);
    } else {
      datosAgrupados[clave].repetidos.push(dato);
    }
  });

  // Escribir datos en el Excel
  for (const area of areas) {
    for (const clave in datosAgrupados) {
      const datosArea = datosAgrupados[clave];
      
      // Verificar si pertenece al área actual
      if (datosArea.area.toUpperCase() !== area.Nombre.toUpperCase()) {
        continue;
      }

      const numeracion = `${indicePrincipal}.${subIndice}`;
      let nombreFila = datosArea.area;
      
      // Si es reporte por profesional, mostrar nombre del profesional
      if (tipoReporte === 'por-profesional') {
        nombreFila = `${datosArea.profesional} (${datosArea.area})`;
      }

      // Tipo 'N' - Nuevo
      hoja.getCell(`B${filaActual}`).value = `${numeracion} ${nombreFila}`;
      hoja.getCell(`B${filaActual}`).style = estiloCeldaRelleno;
      hoja.getCell(`C${filaActual}`).value = 'N';
      hoja.getCell(`C${filaActual}`).style = estiloCeldaRelleno;

      // Sumar datos NUEVOS
      rangosEdad.forEach(({ col, rango, sexo }) => {
        const clave = `${rango}_${sexo}`;
        const suma = datosArea.nuevos.reduce((acc, cur) => acc + (cur[clave] || 0), 0);
        const cell = hoja.getCell(`${col}${filaActual}`);
        cell.value = suma === 0 ? '' : suma;
        cell.style = estiloCelda;
      });

      hoja.getCell(`X${filaActual}`).value = {
        formula: `SUM(D${filaActual}:W${filaActual})`
      };
      hoja.getCell(`X${filaActual}`).style = estiloEncabezado;

      filaActual++;

      // Tipo 'R' - Control/Repetido
      hoja.getCell(`B${filaActual}`).value = `${numeracion} ${nombreFila}`;
      hoja.getCell(`B${filaActual}`).style = estiloCeldaRelleno;
      hoja.getCell(`C${filaActual}`).value = 'R';
      hoja.getCell(`C${filaActual}`).style = estiloCeldaRelleno;

      // Sumar datos REPETIDOS
      rangosEdad.forEach(({ col, rango, sexo }) => {
        const clave = `${rango}_${sexo}`;
        const suma = datosArea.repetidos.reduce((acc, cur) => acc + (cur[clave] || 0), 0);
        const cell = hoja.getCell(`${col}${filaActual}`);
        cell.value = suma === 0 ? '' : suma;
        cell.style = estiloCelda;
      });

      hoja.getCell(`X${filaActual}`).value = {
        formula: `SUM(D${filaActual}:W${filaActual})`
      };
      hoja.getCell(`X${filaActual}`).style = estiloEncabezado;

      filaActual++;
      subIndice++;
    }
  }

  // 10. Total vertical: suma de cada columna (D a W)
  const filaTotal = filaActual;
  hoja.getCell(`B${filaTotal}`).value = 'TOTAL';
  hoja.getCell(`B${filaTotal}`).style = estiloEncabezado;

  const colD = 'D'.charCodeAt(0);
  const colW = 'W'.charCodeAt(0);
  for (let c = colD; c <= colW; c++) {
    const letra = String.fromCharCode(c);
    const formula = `SUM(${letra}12:${letra}${filaActual - 1})`;
    hoja.getCell(`${letra}${filaTotal}`).value = { formula };
    hoja.getCell(`${letra}${filaTotal}`).style = estiloEncabezado;
  }

  // Total general para columna X
  hoja.getCell(`X${filaTotal}`).value = { formula: `SUM(X12:X${filaActual -1})` };
  hoja.getCell(`X${filaTotal}`).style = estiloEncabezado;

  // 11. Aplicar bordes a toda la tabla
  const primeraFilaTabla = 10;
  const ultimaFilaTabla = filaTotal;
  const primeraCol = 'B';
  const ultimaCol = 'X';

  for (let row = primeraFilaTabla; row <= ultimaFilaTabla; row++) {
    for (let col = primeraCol.charCodeAt(0); col <= ultimaCol.charCodeAt(0); col++) {
      const colLetter = String.fromCharCode(col);
      const cell = hoja.getCell(`${colLetter}${row}`);
      
      if (!cell.style || !cell.style.border) {
        cell.style = {
          ...cell.style,
          border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        };
      }
    }
  }

// 12. Tabla de condiciones de rehabilitación
filaActual += 1; // Espacio después de la tabla anterior

// Título de la sección
hoja.mergeCells(`B${filaActual}:X${filaActual}`);
hoja.getCell(`B${filaActual}`).style = estiloTitulo;
filaActual++;

// Encabezados de la tabla
hoja.getCell(`B${filaActual}`).value = '2. USUARIOS EN REHABILITACIÓN POR:';
hoja.getCell(`B${filaActual}`).style = estiloEncabezado;
hoja.getCell(`C${filaActual}`).value = 'N';
hoja.getCell(`C${filaActual}`).style = estiloEncabezado;
filaActual++;

let condiciones = [];
try {
    const response = await axios.get('http://localhost:5000/api/condicion/listar');
    condiciones = response.data;
    
    // Obtener el rango de fechas del reporte
    const [anio, mes] = fechaReporte.split('-');
    const fechaInicio = `${anio}-${mes}-01`;
    const fechaFin = new Date(anio, parseInt(mes), 0).toISOString().slice(0, 10);

    // Obtener todas las sesiones del periodo reportado
    const sesiones = await db.Sesion.findAll({
        where: {
            Fecha: {
                [Op.between]: [fechaInicio, fechaFin]
            },
            Notas: {
                [Op.ne]: null
            }
        },
        attributes: ['Idsesion', 'Notas']
    });

    // Inicializar objeto para conteo
    const conteoCondiciones = {};
    let totalGeneral = 0;
    
    // Inicializar todas las condiciones con 0
    condiciones.forEach(cond => {
        conteoCondiciones[cond.condicion] = 0;
    });

    // Verificar si existe "Otros" en las condiciones
    const tieneOtros = condiciones.some(cond => cond.condicion === 'Otros');
    let otrosCount = 0;

    // Contar ocurrencias en las notas
    sesiones.forEach(sesion => {
        if (sesion.Notas) {
            let condicionEncontrada = false;
            const notas = sesion.Notas.toLowerCase();
            
            condiciones.forEach(cond => {
                const condicionLower = cond.condicion.toLowerCase();
                if (notas.includes(condicionLower)) {
                    conteoCondiciones[cond.condicion]++;
                    totalGeneral++;
                    condicionEncontrada = true;
                }
            });
            
            if (!condicionEncontrada) {
                otrosCount++;
                totalGeneral++;
            }
        }
    });

    // Manejar "Otros"
    if (tieneOtros) {
        conteoCondiciones['Otros'] += otrosCount;
    } else if (otrosCount > 0) {
        condiciones.push({ condicion: 'Otros' });
        conteoCondiciones['Otros'] = otrosCount;
    }

    // Separar y ordenar condiciones
    const otrasCondiciones = condiciones.filter(cond => cond.condicion !== 'Otros')
        .sort((a, b) => a.condicion.localeCompare(b.condicion));
    const condicionOtros = condiciones.find(cond => cond.condicion === 'Otros');

    // Escribir condiciones ordenadas
    let contador = 1;
    otrasCondiciones.forEach(cond => {
        const condicion = cond.condicion;
        const cantidad = conteoCondiciones[condicion] || 0;
        
        hoja.getCell(`B${filaActual}`).value = `2.${contador} ${condicion.toUpperCase()}`;
        hoja.getCell(`B${filaActual}`).style = estiloCelda;
        
        hoja.getCell(`C${filaActual}`).value = cantidad;
        hoja.getCell(`C${filaActual}`).style = estiloCelda;
        
        filaActual++;
        contador++;
    });

    // Escribir "Otros" si existe
    if (condicionOtros && conteoCondiciones['Otros'] > 0) {
        hoja.getCell(`B${filaActual}`).value = `2.${contador} OTROS`;
        hoja.getCell(`B${filaActual}`).style = estiloCelda;
        
        hoja.getCell(`C${filaActual}`).value = conteoCondiciones['Otros'];
        hoja.getCell(`C${filaActual}`).style = estiloCelda;
        
        filaActual++;
    }

    // Escribir TOTAL GENERAL
    hoja.getCell(`B${filaActual}`).value = 'TOTAL';
    hoja.getCell(`B${filaActual}`).style = estiloCeldaRelleno;
    
    hoja.getCell(`C${filaActual}`).value = totalGeneral;
    hoja.getCell(`C${filaActual}`).style = estiloCeldaRelleno;

    // Aplicar bordes a la tabla de condiciones
    const primeraFilaCond = filaActual - contador - 1;
    const ultimaFilaCond = filaActual;
    for (let row = primeraFilaCond; row <= ultimaFilaCond; row++) {
        for (let col = 'B'.charCodeAt(0); col <= 'C'.charCodeAt(0); col++) {
            const colLetter = String.fromCharCode(col);
            const cell = hoja.getCell(`${colLetter}${row}`);
            if (!cell.style.border) {
                cell.style = { ...cell.style, ...estiloCelda };
            }
        }
    }

    filaActual++;

} catch (error) {
    console.error('Error al obtener condiciones:', error);
    hoja.mergeCells(`B${filaActual}:D${filaActual}`);
    hoja.getCell(`B${filaActual}`).value = 'ERROR AL OBTENER CONDICIONES DE REHABILITACIÓN';
    hoja.getCell(`B${filaActual}`).style = estiloMensajeSinDatos;
    filaActual++;
}
// ... (código anterior se mantiene igual hasta el final de la tabla de condiciones)

// 13. Tabla de Altas y Abandonos
// Título de la sección
hoja.mergeCells(`B${filaActual}:D${filaActual}`);
hoja.getCell(`B${filaActual}`).style = estiloTitulo;
filaActual++;

// Obtener datos de tratamientos
try {
  const [anio, mes] = fechaReporte.split('-');
  const fechaInicioReporte = `${anio}-${mes}-01`;
  const fechaFinReporte = new Date(anio, parseInt(mes), 0).toISOString().slice(0, 10);
  
  // 1. Tratamientos que finalizaron en el mes reportado
  const tratamientosFinalizados = await db.Tratamiento.findAll({
      where: {
          Fecha_fin: {
              [Op.between]: [fechaInicioReporte, fechaFinReporte]
          }
      },
      attributes: ['Estado', 'Razon', 'Fecha_fin', 'Fecha_ini']
  });

  // 2. Tratamientos activos (sin fecha_fin o que continúan después del mes)
  const tratamientosActivos = await db.Tratamiento.findAll({
      where: {
          [Op.or]: [
              { Fecha_fin: null },
              { Fecha_fin: { [Op.gt]: fechaFinReporte } }
          ],
          Fecha_ini: { [Op.lte]: fechaFinReporte } // Que hayan empezado antes del fin del mes
      },
      attributes: ['Estado', 'Razon', 'Fecha_fin', 'Fecha_ini']
  });

  // Combinar ambos conjuntos
  const todosTratamientos = [...tratamientosFinalizados, ...tratamientosActivos];
  
  console.log('Total tratamientos encontrados:', todosTratamientos.length);
  console.log('Ejemplos:', JSON.stringify(todosTratamientos.slice(0, 5), null, 2));

  // Inicializar contadores
  const contadores = {
      altasDefinitivas: 0,
      altasTemporales: 0,
      continuanTratamiento: 0,
      abandonos: 0,
      razonesAbandono: {
          Familiar: 0,
          Vivienda: 0,
          Violencia: 0,
          'Educación': 0,
          Transporte: 0,
          'Económico': 0,
          'Desastre natural': 0
      }
  };

  // Procesar todos los tratamientos
  todosTratamientos.forEach(trat => {
      const estado = trat.Estado?.trim()?.toUpperCase();
      const razon = trat.Razon?.trim();
      const fechaFinTrat = trat.Fecha_fin;
      const esDelMes = fechaFinTrat && 
                      new Date(fechaFinTrat) >= new Date(fechaInicioReporte) && 
                      new Date(fechaFinTrat) <= new Date(fechaFinReporte);

      if (estado === 'ALTA DEFINITIVA' && esDelMes) {
          contadores.altasDefinitivas++;
      } else if (estado === 'ALTA TEMPORAL' && esDelMes) {
          contadores.altasTemporales++;
      } else if (estado === 'ABANDONO' && esDelMes) {
          contadores.abandonos++;
          if (razon) {
              const razonLower = razon.toLowerCase();
              for (const [key] of Object.entries(contadores.razonesAbandono)) {
                  if (razonLower.includes(key.toLowerCase())) {
                      contadores.razonesAbandono[key]++;
                      break;
                  }
              }
          }
      } else if (!fechaFinTrat || new Date(fechaFinTrat) > new Date(fechaFinReporte)) {
          // Solo contar como "continúa tratamiento" si no es una alta/abandono del mes
          if (!['ALTA DEFINITIVA', 'ALTA TEMPORAL', 'ABANDONO'].includes(estado)) {
              contadores.continuanTratamiento++;
          }
      }
  });

  console.log('Contadores finales:', contadores);

  // Escribir tabla de altas
  hoja.getCell(`B${filaActual}`).value = 'N° DE ALTAS DEFINITIVAS';
  hoja.getCell(`B${filaActual}`).style = estiloCelda;
  hoja.getCell(`C${filaActual}`).value = contadores.altasDefinitivas;
  hoja.getCell(`C${filaActual}`).style = estiloCelda;
  filaActual++;

  hoja.getCell(`B${filaActual}`).value = 'N° DE ALTAS TEMPORALES';
  hoja.getCell(`B${filaActual}`).style = estiloCelda;
  hoja.getCell(`C${filaActual}`).value = contadores.altasTemporales;
  hoja.getCell(`C${filaActual}`).style = estiloCelda;
  filaActual++;

  hoja.getCell(`B${filaActual}`).value = 'N° PACIENTES QUE CONTINUAN EN TRATAMIENTO';
  hoja.getCell(`B${filaActual}`).style = estiloCelda;
  hoja.getCell(`C${filaActual}`).value = contadores.continuanTratamiento;
  hoja.getCell(`C${filaActual}`).style = estiloCelda;
  filaActual++;

  hoja.getCell(`B${filaActual}`).value = 'N° ABANDONO DE REHABILITACIÓN';
  hoja.getCell(`B${filaActual}`).style = estiloCelda;
  hoja.getCell(`C${filaActual}`).value = contadores.abandonos;
  hoja.getCell(`C${filaActual}`).style = estiloCelda;
  filaActual++;

  for (const [razon, cantidad] of Object.entries(contadores.razonesAbandono)) {
      hoja.getCell(`B${filaActual}`).value = razon;
      hoja.getCell(`B${filaActual}`).style = estiloCelda;
      hoja.getCell(`C${filaActual}`).value = cantidad;
      hoja.getCell(`C${filaActual}`).style = estiloCelda;
      filaActual++;
  }

    // Aplicar bordes a toda la tabla de altas y abandonos
    const primeraFilaAltas = filaActual - (Object.keys(contadores.razonesAbandono).length + 5);
    const ultimaFilaAltas = filaActual - 1;
    
    for (let row = primeraFilaAltas; row <= ultimaFilaAltas; row++) {
        for (let col = 'B'.charCodeAt(0); col <= 'C'.charCodeAt(0); col++) {
            const colLetter = String.fromCharCode(col);
            const cell = hoja.getCell(`${colLetter}${row}`);
            if (!cell.style.border) {
                cell.style = { ...cell.style, ...estiloCelda };
            }
        }
    }

} catch (error) {
    console.error('Error al obtener datos de tratamientos:', error);
    hoja.mergeCells(`B${filaActual}:C${filaActual}`);
    hoja.getCell(`B${filaActual}`).value = 'ERROR AL OBTENER DATOS DE ALTAS Y ABANDONOS';
    hoja.getCell(`B${filaActual}`).style = estiloMensajeSinDatos;
    filaActual++;
}

// 14. Ajustar anchos columnas
hoja.columns = [
    { key: 'A', width: 2 },
    { key: 'B', width: 40 },
    { key: 'C', width: 5 }, // Aumentado para acomodar los números
    ...Array(20).fill({ width: 8 }),
    { key: 'X', width: 10 }
];

// 15. Ajustar altura filas
hoja.eachRow(row => {
    row.height = 20;
});

return libro;
}

module.exports = { generarExcelReporte };