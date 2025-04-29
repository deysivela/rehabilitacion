import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';
import './Administrador.css';

const Administrador = () => {
  const [estadisticas, setEstadisticas] = useState({
    usuarios: 0,
    pacientes: 0,
    sesion: 0,
  });  

  useEffect(() => {
    fetch('http://localhost:5000/api/estadisticas') 
      .then((res) => res.json())
      .then((data) => setEstadisticas(data))
      .catch((err) => console.error('Error al cargar estadísticas:', err));
  }, []);

  const datosGrafico = [
    { nombre: 'Usuarios', valor: estadisticas.usuarios },
    { nombre: 'Pacientes', valor: estadisticas.pacientes },
    { nombre: 'Sesiones', valor: estadisticas.sesion },
  ];
  
  
  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Gestión completa del sistema y usuarios</h1>
      </header>

      <main className="admin-main">
        <section className="admin-modulos">
          <h3>Accesos Directos</h3>
          <div className="admin-links">
            <Link to="/profesional" className="admin-link">Gestionar Profesionales</Link>
            <Link to="/usuario" className="admin-link">Gestionar Usuarios</Link>
            <Link to="/areas" className="admin-link">Gestionar Áreas</Link>
            <Link to="/citas" className="admin-link">Sesiones</Link>
            <Link to="/reportes" className="admin-link">Generar Reportes</Link>
          </div>
        </section>

        <section className="admin-indicadores">
          <h3>📊 Estadísticas del Sistema</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={datosGrafico}>
              <XAxis dataKey="nombre" />
              <Tooltip />
              <Bar dataKey="valor" fill="#3498db" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="valor" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      </main>
    </div>
  );
};


export default Administrador;

