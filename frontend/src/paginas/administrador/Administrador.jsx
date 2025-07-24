import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Administrador.css';
import { 
  FiUsers, 
  FiUserPlus, 
  FiLayers, 
  FiCalendar, 
  FiFileText, 
  FiUser,
} from 'react-icons/fi';

const Administrador = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    pacientes: 0,
    sesiones: 0,
    profesionales: 0,
    areas: 0,
    citasProgramadas: 0,
    loading: true
  });

  // Función para cargar estadísticas
  const fetchStats = useCallback(async () => {
    try {
      setStats(prev => ({...prev, loading: true}));
      const response = await fetch('http://localhost:5000/api/estadisticas');
      const data = await response.json();
      
      setStats({
        usuarios: data.usuarios || 0,
        pacientes: data.pacientes || 0,
        sesiones: data.sesiones || 0,
        profesionales: data.profesionales || 0,
        areas: data.areas || 0,
        citasProgramadas: data.citasProgramadas || 0, 
        loading: false
      });
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setStats(prev => ({...prev, loading: false}));
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchStats();
  }, [fetchStats]); 

  const quickLinks = [
    {
      title: "Profesionales",
      path: "/profesional",
      icon: <FiUsers className="link-icon" />,
      count: stats.profesionales || 0,
      color: "#4e73df"
    },
    {
      title: "Usuarios",
      path: "/usuario",
      icon: <FiUserPlus className="link-icon" />,
      count: stats.usuarios || 0,
      color: "#1cc88a"
    },
    {
      title: "Áreas",
      path: "/areas",
      icon: <FiLayers className="link-icon" />,
      count: stats.areas || 0,
      color: "#36b9cc"
    },
    {
      title: "Todos los Pacientes",
      path: "/paciente",
      icon: <FiUser className="link-icon" />,
      count: stats.pacientes || 0,
      color: "#4e73df",
      group: "pacientes"
    },
    {
      title: "Sesiones",
      path: "/sesion",
      icon: <FiCalendar className="link-icon" />,
      count: stats.sesiones || 0,
      color: "#f6c23e"
    },
    {
      title: "Citas Programadas",
      path: "/citas",
      icon: <FiCalendar className="link-icon" />,
      count: stats.citasProgramadas || 0,
      color: "#e74a3b",
      group: "citas"
    },
    {
      title: "Reportes",
      path: "/reportes",
      icon: <FiFileText className="link-icon" />,
      count: stats.reportes || 0,
      color: "#e74a3b"
    }
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-content">
          <h1>Panel de Administración</h1>
        </div>
      </header>

      <main className="admin-main">
        <section className="quick-access">
          <div className="links-grid">
            {quickLinks.map((link, index) => (
              <Link to={link.path} key={index} className="access-card" style={{'--card-color': link.color}}>
                <div className="card-content">
                  <div className="card-icon">{link.icon}</div>
                  <h3>{link.title}</h3>
                  <div className="card-count">
                    {stats.loading ? (
                      <div className="loading-dots">
                        <span>.</span><span>.</span><span>.</span>
                      </div>
                    ) : (
                      link.count
                    )}
                  </div>
                </div>
                <div className="card-badge" style={{backgroundColor: link.color}}>
                  {link.count}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Administrador;