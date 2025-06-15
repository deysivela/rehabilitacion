import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Inicio.css";
import Footer from "../componentes/Footer";

const Inicio = () => {
  const [indicadores, setIndicadores] = useState({
    pacientesEnTratamiento: 0,
    citasProgramadas: 0,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuario"));
    if (!user) return;
  
    const fetchIndicadores = () => {
      fetch("http://localhost:5000/api/indicadores", {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id,
          "x-user-rol": user?.rol?.toLowerCase(),
        },
      })
        .then((res) => res.json())
        .then((data) => setIndicadores(data))
        .catch((err) => console.error("Error al obtener indicadores:", err));
    };
  
    fetchIndicadores();
  
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchIndicadores();
      }
    };
  
    document.addEventListener("visibilitychange", handleVisibilityChange);
  
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  

  return (
    <div className="inicio-container">
      <header className="inicio-header">
        <img
          src="../../logo.png"
          alt="Logo Centro de Rehabilitación"
          className="inicio-logo"
        />
        <h1>Sistema de Información Web</h1>
        <h2>Centro de Rehabilitación Llallagua</h2>
      </header>

      <main className="inicio-main">
        <section className="inicio-resumen">
          <h3>Bienvenido al Sistema</h3>
          <p>
            Este sistema permite gestionar las historias clínicas, citas médicas
            y reportes de manera eficiente y segura, facilitando el trabajo del
            personal y mejorando la atención a los pacientes.
          </p>
        </section>

        <section className="inicio-modulos">
          <h3>Acceso Rápido</h3>
          <div className="inicio-modulos-links">
            <Link to="/pacientes" className="modulo-link">
              Gestión de Pacientes
            </Link>
            <Link to="/citas" className="modulo-link">
              Citas Médicas
            </Link>
            <Link to="/reportes" className="modulo-link">
              Reportes
            </Link>
            <Link to="/configuracion" className="modulo-link">
              Configuración
            </Link>
          </div>
        </section>

        <section className="indicadores">
          <h3>Indicadores Clave</h3>
          <div className="indicadores-grid">
            <div className="indicador-card">
              <span className="indicador-icon">👥</span>
              <div className="indicador-info">
                <p className="indicador-num">
                  {indicadores.pacientesEnTratamiento}
                </p>
                <p className="indicador-label">Pacientes en Tratamiento</p>
              </div>
            </div>
            <div className="indicador-card">
              <span className="indicador-icon">📅</span>
              <div className="indicador-info">
                <p className="indicador-num">{indicadores.citasProgramadas}</p>
                <p className="indicador-label">Citas Médicas Programadas</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Inicio;
