import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './reportes.css';
import { API_URL } from '../paginas/config';

// Función para generar el reporte (apiReportes)
const generarReporte = async (filtros) => {
  const respuesta = await fetch(`${API_URL}/reportes/generar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(filtros)
  });
  
  if (!respuesta.ok) throw new Error('Error en la generación');
  return await respuesta.blob();
};

// Componente FiltrosReporte
const FiltrosReporte = ({ onGenerar }) => {
  const [filtros, setFiltros] = useState({
    tipoReporte: "general",
    areaProfesional: "",
    profesional: "",
    fecha: new Date().toISOString().slice(0, 7),
  });

  const [areas, setAreas] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  
  // Cargar áreas
  useEffect(() => {
    axios
      .get(`${API_URL}/area/listar`)
      .then((response) => {
        setAreas(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener áreas:", error);
      });
  }, []);

  // Cargar profesionales
  useEffect(() => {
    axios
      .get(`${API_URL}/prof_salud/listar`)
      .then((response) => {
        setProfesionales(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener profesionales:", error);
      });
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    const params = {
      ...filtros,
      areaProfesional: filtros.tipoReporte === 'por-area' ? filtros.areaProfesional : undefined,
      profesional: filtros.tipoReporte === 'por-profesional' ? filtros.profesional : undefined
    };
    onGenerar(params);
  };

  return (
    <div className="contenedor-filtros">
      <form onSubmit={manejarEnvio} className="formulario-filtros" noValidate>
        <div>
          <label htmlFor="tipoReporte">Tipo de Reporte:</label>
          <select
            id="tipoReporte"
            name="tipoReporte"
            value={filtros.tipoReporte}
            onChange={manejarCambio}
          >
            <option value="general">General</option>
            <option value="por-area">Por Área</option>
            <option value="por-profesional">Por Profesional</option>
          </select>
        </div>

        {/* Selector de Área (solo visible si el reporte es "por-area") */}
        {filtros.tipoReporte === "por-area" && (
          <div>
            <label htmlFor="areaProfesional">Área Profesional:</label>
            <select
              id="areaProfesional"
              name="areaProfesional"
              value={filtros.areaProfesional}
              onChange={manejarCambio}
            >
              <option value="">Todas las áreas</option>
              {areas.map((area) => (
                <option key={area.Idarea} value={area.Nombre}>
                  {area.Nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {filtros.tipoReporte === "por-profesional" && (
          <div>
            <label htmlFor="profesional">Profesional:</label>
            <select
              id="profesional"
              name="profesional"
              value={filtros.profesional}
              onChange={manejarCambio}
            >
              <option value="">Seleccione un profesional</option>
              {profesionales.map((prof) => (
                <option key={prof.Idprof} value={prof.Idprof}>
                  {prof.Nombre_prof} {prof.Appaterno_prof} {prof.Apmaterno_prof}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="fecha">Mes y Año:</label>
          <input
            type="month"
            id="fecha"
            name="fecha"
            value={filtros.fecha}
            onChange={manejarCambio}
          />
        </div>

        <button type="submit">Generar Reporte</button>
      </form>
    </div>
  );
};

FiltrosReporte.propTypes = {
  onGenerar: PropTypes.func.isRequired,
};

// Componente principal PaginaReportes
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