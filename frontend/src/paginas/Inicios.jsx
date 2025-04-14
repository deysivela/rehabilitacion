import React from 'react';
import { Link } from 'react-router-dom';
import './Inicio.css'; 
import Footer from '../componentes/Footer';


const Inicio = () => {
  return (
    <div className="inicio-container">
      <header className="inicio-header">
        <img src="../../logo.png" alt="Logo Centro de Rehabilitación" className="inicio-logo" />
        <h1>Sistema de Información Web</h1>
        <h2>Centro de Rehabilitación Llallagua</h2>
      </header>

      <main className="inicio-main">
        <section className="inicio-resumen">
          <h3>Bienvenido al Sistema</h3>
          <p>
            Este sistema permite gestionar las historias clínicas, citas médicas y reportes de
            manera eficiente y segura, facilitando el trabajo del personal y mejorando la atención
            a los pacientes.
          </p>
        </section>

        <section className="inicio-modulos">
          <h3>Acceso Rápido</h3>
          <div className="inicio-modulos-links">
            <Link to="/pacientes" className="modulo-link">Gestión de Pacientes</Link>
            <Link to="/citas" className="modulo-link">Citas Médicas</Link>
            <Link to="/reportes" className="modulo-link">Reportes</Link>
            <Link to="/configuracion" className="modulo-link">Configuración</Link>
          </div>
        </section>

        <section className="inicio-indicadores">
          <h3>Indicadores Clave</h3>
          <ul>
            <li>Pacientes en Tratamiento: 120</li>
            <li>Citas Programadas: 45</li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
};
export default Inicio;
