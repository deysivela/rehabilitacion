import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaUserTie,
  FaListAlt,
  FaCalendarAlt,
  FaUserMd,
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCitasOpen, setIsCitasOpen] = useState(false);
  const [isProfesionalesOpen, setIsProfesionalesOpen] = useState(false);
  const [isPacientesOpen, setIsPacientesOpen] = useState(false);
  const [usuario, setUsuario] = useState({ nombre: "", rol: "" });

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("usuario"));
    if (userData) {
      setUsuario({ nombre: userData.nombre, rol: userData.rol.toLowerCase() }); // por si viene en mayúsculas
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", !isOpen);
    document.body.classList.toggle("sidebar-expanded", isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsAdminOpen(false);
      setIsCitasOpen(false);
      setIsProfesionalesOpen(false);
      setIsPacientesOpen(false);
    }
  }, [isOpen]);

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        {isOpen && (
          <img
            src="/logo.png"
            alt="Logo"
            className="sidebar-logo"
            style={{ width: "300px", transition: "opacity 0.3s ease" }}
          />
        )}
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      <div className="user-info">
        <div className="user-avatar">
          <FaUser />
        </div>
        {isOpen && (
          <div className="user-details">
            <span className="user-name">{usuario.nombre}</span><br />
            <span className="user-role">{usuario.rol}</span>
          </div>
        )}
      </div>

      <ul className="sidebar-menu">

        <li>
          <div className="submenu-toggle">
            <Link to="/" className="submenu-main-link">
              <FaHome />
              {isOpen && <span>Inicio</span>}
            </Link>
          </div>
        </li>

        {/* ADMINISTRADOR SOLO SI TIENE ROL */}
        {usuario.rol === "administrador" && (
          <li>
            <div className="submenu-toggle">
              <Link to="/administrador" className="submenu-main-link">
                <FaUserTie />
                {isOpen && <span>Administrador</span>}
              </Link>
              {isOpen && (
                <span
                  className="submenu-arrow"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAdminOpen(!isAdminOpen);
                  }}
                >
                  {isAdminOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              )}
            </div>
            <ul className={`submenu ${isAdminOpen && isOpen ? "visible" : ""}`}>
              <li><Link to="/profesional"><span className="submenu-item">Gestionar Profesionales</span></Link></li>
              <li><Link to="/usuario"><span className="submenu-item">Gestionar Usuarios</span></Link></li>
              <li><Link to="/areas"><span className="submenu-item">Gestionar Áreas</span></Link></li>
              <li><Link to="/reportes"><span className="submenu-item">Generar Reportes</span></Link></li>
            </ul>
          </li>
        )}

        {/* PACIENTES */}
        <li>
          <div className="submenu-toggle">
            <Link to="/pacientes" className="submenu-main-link">
              <FaUser />
              {isOpen && <span>Pacientes</span>}
            </Link>
            {isOpen && (
              <span
                className="submenu-arrow"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPacientesOpen(!isPacientesOpen);
                }}
              >
                {isPacientesOpen ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            )}
          </div>
          <ul className={`submenu ${isPacientesOpen && isOpen ? "visible" : ""}`}>
            <li><Link to="/tratamientos"><span className="submenu-item">Tratamientos</span></Link></li>
          </ul>
        </li>

        {/* PROFESIONALES */}
        <li>
          <div className="submenu-toggle">
            <Link to="/profesionales" className="submenu-main-link">
              <FaUserMd />
              {isOpen && <span>Profesional de Salud</span>}
            </Link>
            {isOpen && (
              <span
                className="submenu-arrow"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfesionalesOpen(!isProfesionalesOpen);
                }}
              >
                {isProfesionalesOpen ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            )}
          </div>
          <ul className={`submenu ${isProfesionalesOpen && isOpen ? "visible" : ""}`}>
            <li><Link to="/tecnicas"><span className="submenu-item">Técnicas</span></Link></li>
            <li><Link to="/actividad"><span className="submenu-item">Actividades</span></Link></li>
          </ul>
        </li>

        {/* CITAS */}
        <li>
          <div className="submenu-toggle">
            <Link to="/citas" className="submenu-main-link">
              <FaCalendarAlt />
              {isOpen && <span>Citas</span>}
            </Link>
          </div>
          <ul className={`submenu ${isCitasOpen && isOpen ? "visible" : ""}`}>
          </ul>
        </li>
        {/* SESION */}
        <li>
          <div className="submenu-toggle">
            <Link to="/sesion" className="submenu-main-link">
              <FaListAlt />
              {isOpen && <span>Sesiones</span>}
            </Link>
          </div>
        </li>
        {/* REPORTES */}

        <li>
          <div className="submenu-toggle">
            <Link to="/reportes" className="submenu-main-link">
              <FaChartLine />
              {isOpen && <span>Reportes</span>}
            </Link>
          </div>
        </li>

        {/* SALIR */}
        <li className="logout">
          <Link to="/salir">
            <FaSignOutAlt /> {isOpen && "Salir"}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
