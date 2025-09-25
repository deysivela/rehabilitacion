import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "./Administrador.css";
import {
  FiUsers,
  FiUserPlus,
  FiLayers,
  FiCalendar,
  FiFileText,
  FiUser,
  FiRefreshCw,
  FiDatabase,
} from "react-icons/fi";

const Administrador = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    pacientes: 0,
    sesiones: 0,
    profesionales: 0,
    areas: 0,
    citasProgramadas: 0,
    loading: true,
  });

  const [lastUpdate, setLastUpdate] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Función para formatear la fecha y hora
  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Función para cargar estadísticas
  const fetchStats = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setStats((prev) => ({ ...prev, loading: true }));
      }

      const response = await fetch("http://localhost:5000/api/estadisticas");
      const data = await response.json();

      setStats({
        usuarios: data.usuarios || 0,
        pacientes: data.pacientes || 0,
        sesiones: data.sesiones || 0,
        profesionales: data.profesionales || 0,
        areas: data.areas || 0,
        citasProgramadas: data.citasProgramadas || 0,
        loading: false,
      });

      setLastUpdate(formatDateTime(new Date()));
      setRefreshing(false);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
      setStats((prev) => ({ ...prev, loading: false }));
      setRefreshing(false);
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
      color: "#4e73df",
    },
    {
      title: "Usuarios",
      path: "/usuario",
      icon: <FiUserPlus className="link-icon" />,
      count: stats.usuarios || 0,
      color: "#1cc88a",
    },
    {
      title: "Áreas",
      path: "/areas",
      icon: <FiLayers className="link-icon" />,
      count: stats.areas || 0,
      color: "#36b9cc",
    },
    {
      title: "Todos los Pacientes",
      path: "/paciente",
      icon: <FiUser className="link-icon" />,
      count: stats.pacientes || 0,
      color: "#4e73df",
      group: "pacientes",
    },
    {
      title: "Sesiones",
      path: "/sesion",
      icon: <FiCalendar className="link-icon" />,
      count: stats.sesiones || 0,
      color: "#f6c23e",
    },
    {
      title: "Citas Programadas",
      path: "/citas",
      icon: <FiCalendar className="link-icon" />,
      count: stats.citasProgramadas || 0,
      color: "#e74a3b",
      group: "citas",
    },
    {
      title: "Reportes",
      path: "/reportes",
      icon: <FiFileText className="link-icon" />,
      count: stats.reportes || 0,
      color: "#6f42c1",
    },
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-content">
          <h1>Panel de Administración</h1>
          <div className="header-actions">
            <button
              className={`refresh-btn ${refreshing ? "refreshing" : ""}`}
              onClick={() => fetchStats(true)}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? "spin" : ""} />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>
            <button
              className="backup-btn"
              onClick={() => {
                fetch("http://localhost:5000/api/respaldo")
                  .then((response) => {
                    if (!response.ok) throw new Error("Error en la descarga");
                    return response.blob();
                  })
                  .then((blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `backup_${Date.now()}.sql`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  })
                  .catch((err) => {
                    console.error("❌ Error al generar respaldo:", err);
                    alert("Error al generar respaldo");
                  });
              }}
            >
              <FiDatabase className="icon-btn" style={{ marginRight: "6px" }} />
              Generar Respaldo
            </button>
          </div>
        </div>
        {lastUpdate && (
          <div className="last-update">Última actualización: {lastUpdate}</div>
        )}
      </header>

      <main className="admin-main">
        <section className="quick-access">
          <h2 className="section-title">Acceso Rápido</h2>
          <div className="links-grid">
            {quickLinks.map((link, index) => (
              <Link
                to={link.path}
                key={index}
                className="access-card"
                style={{ "--card-color": link.color }}
              >
                <div className="card-content">
                  <div className="card-icon">{link.icon}</div>
                  <h3>{link.title}</h3>
                  <div className="card-count">
                    {stats.loading ? (
                      <div className="loading-dots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </div>
                    ) : (
                      link.count
                    )}
                  </div>
                </div>
                <div
                  className="card-badge"
                  style={{ backgroundColor: link.color }}
                >
                  {stats.loading ? (
                    <div className="mini-loading"></div>
                  ) : (
                    link.count
                  )}
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
