import React from 'react';
import FiltrosReporte from '../componentes/FiltrosReporte';
import { generarReporte } from '../servicios/apiReportes';
import './reportes.css'; 

export default function PaginaReportes() {
  const generarReporteHandler = async (filtros) => {
    try {
      const respuesta = await generarReporte(filtros);
      const urlDescarga = window.URL.createObjectURL(respuesta);
      const enlace = document.createElement('a');
      enlace.href = urlDescarga;
      enlace.download = `reporte-${new Date().toLocaleDateString()}.xlsx`;
      enlace.click();
    } catch (error) {
      console.error('Error al generar reporte:', error);
    }
  };

  return (
    <div className="contenedor-reportes">
      <h1> Reportes Clínicos</h1>
      <FiltrosReporte onGenerar={generarReporteHandler} />
    </div>
  );
}