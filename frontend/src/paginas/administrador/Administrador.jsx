import React from 'react';
import { Link } from 'react-router-dom';
import './Administrador.css'; 
import Footer from '../../componentes/Footer';


const Administrador = () => {
  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Gestión completa del sistema y usuarios</h1>
      </header>

      <main className="admin-main">
        <section className="admin-modulos">
          <h3>Accesos Directos</h3>
          <div className="admin-links">
          <Link to="/profesional" className="admin-link">
              Gestionar Profesionales
            </Link>
            <Link to="/usuario" className="admin-link">
              Gestionar Usuarios
            </Link>
            <Link to="/areas" className="admin-link">
              Gestionar Areas
            </Link>
            <Link to="/reportes" className="admin-link">
              Generar Reportes
            </Link>
          </div>
        </section>

        <section className="admin-indicadores">
          <h3>Estadísticas del Sistema</h3>
          <ul>
            <li>Usuarios Registrados: 15</li>
            <li>Pacientes Activos: 120</li>
            <li>Citas Programadas: 45</li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Administrador;
