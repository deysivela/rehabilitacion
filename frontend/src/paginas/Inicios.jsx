import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  FiCalendar, FiUsers, FiActivity, 
  FiClock, FiTool, FiBarChart2 
} from "react-icons/fi";
import "./Inicio.css";
import Footer from "../componentes/Footer";

const Inicio = () => {
  const [indicadores, setIndicadores] = useState({
    pacientesEnTratamiento: 0,
    citasProgramadas: 0,
    totalPacientes: 0,
    tratamientosActivos: 0,
    diagnosticosRegistrados: 0,
    sesionesRealizadas: 0,
    tecnicasDisponibles: 0,
    discapacidadesRegistradas: 0,
    loading: true
  });
  const [userRole, setUserRole] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchData = useCallback(async () => {
    const user = JSON.parse(sessionStorage.getItem("usuario"));
    if (!user) return;
    
    try {
      setIndicadores(prev => ({...prev, loading: true}));
      const response = await fetch(`${API_URL}/indicadores`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id,
          "x-user-rol": user?.rol?.toLowerCase(),
        },
      });
      const data = await response.json();
      setIndicadores(prev => ({
        ...data,
        loading: false
      }));
    } catch (err) {
      console.error("Error al obtener datos:", err);
      setIndicadores(prev => ({...prev, loading: false}));
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("usuario"));
    if (user) {
      setUserRole(user?.rol?.toLowerCase());
    }

    fetchData();
  }, [fetchData]);

  const quickLinks = [
    {
      title: "Pacientes",
      path: "/pacientes",
      icon: <FiUsers className="link-icon" />,
      count: indicadores.totalPacientes || 0,
      color: "#3498db",
      group: "pacientes"
    },
    {
      title: "Citas Programadas",
      path: "/citas",
      icon: <FiCalendar className="link-icon" />,
      count: indicadores.citasProgramadas || 0,
      color: "#e74a3b",
      group: "citas"
    },
    {
      title: "Tratamientos activos",
      path: "/profesionales",
      icon: <FiActivity className="link-icon" />,
      count: indicadores.tratamientosActivos || 0,
      color: "#9b59b6",
      group: "tratamientos"
    },
    {
      title: "Sesiones",
      path: "/sesion",
      icon: <FiClock className="link-icon" />,
      count: indicadores.sesionesRealizadas || 0,
      color: "#1abc9c",
      group: "sesiones"
    },
    {
      title: "Técnicas",
      path: "/tecnicas",
      icon: <FiTool className="link-icon" />,
      count: indicadores.tecnicasDisponibles || 0,
      color: "#e67e22",
      group: "tecnicas"
    },
    {
      title: "Reportes",
      path: "/reportes",
      icon: <FiBarChart2 className="link-icon" />,
      color: "#16a085",
      group: "reportes"
    }
  ];

  const filteredLinks = quickLinks.filter(link => 
    !link.adminOnly || userRole === 'administrador'
  );

  return (
    <div className="inicio-container">
      <header className="inicio-header">
        <img
          src="../../logo.png"
          alt="Logo Centro de Rehabilitación"
          className="inicio-logo"
        />
        <h2>Sistema de Información Web</h2>
        <h2>Centro de Rehabilitación Llallagua</h2>
      </header>

      <main className="inicio-main">
        <section className="inicio-resumen">
          <h3>Bienvenido al Sistema</h3>
          <p>
            Este sistema permite gestionar las historias clínicas, citas médicas,
            tratamientos y reportes de manera eficiente y segura, facilitando el
            trabajo del personal y mejorando la atención a los pacientes.
          </p>
        </section>

        <section className="inicio-modulos">
          <h3>Acceso Rápido</h3>
          <div className="quick-links-grid">
            {filteredLinks.map((link, index) => (
              <Link 
                to={link.path} 
                className="quick-link-card" 
                key={index}
                style={{ '--link-color': link.color }}
              >
                <div className="link-icon-container">
                  {link.icon}
                </div>
                <div className="link-info">
                  <h4>{link.title}</h4>
                  {indicadores.loading ? (
                    <div className="loading-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </div>
                  ) : (
                    <span className="link-count">{link.count}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Inicio;