import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaUserTie,
  FaClipboardList,
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", !isOpen);
    document.body.classList.toggle("sidebar-expanded", isOpen);
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

      <ul className="sidebar-menu">
        <li>
          <Link to="/">
            <FaHome /> {isOpen && "Inicio"}
          </Link>
        </li>

        {/* ADMINISTRADOR */}
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
          {isAdminOpen && isOpen && (
            <ul className="submenu">
              <li><Link to="/profesional"><span className="submenu-item">Gestionar Profesionales</span></Link></li>
              <li><Link to="/usuario"><span className="submenu-item">Gestionar Usuarios</span></Link></li>
              <li><Link to="/areas"><span className="submenu-item">Gestionar Áreas</span></Link></li>
              <li><Link to="/reportes"><span className="submenu-item">Generar Reportes</span></Link></li>
            </ul>
          )}
        </li>

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
          {isPacientesOpen && isOpen && (
            <ul className="submenu">
              <li><Link to="/diagnosticos"><span className="submenu-item">Diagnósticos</span></Link></li>
              <li><Link to="/tratamientos"><span className="submenu-item">Tratamientos</span></Link></li>
            </ul>
          )}
        </li>

        {/* PROFESIONALES DE SALUD */}
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
          {isProfesionalesOpen && isOpen && (
            <ul className="submenu">
              <li><Link to="/tecnicas"><span className="submenu-item">Técnicas</span></Link></li>
            </ul>
          )}
        </li>

        {/* CITAS */}
        <li>
          <div className="submenu-toggle">
            <Link to="/citas" className="submenu-main-link">
              <FaClipboardList />
              {isOpen && <span>Citas</span>}
            </Link>
            {isOpen && (
              <span
                className="submenu-arrow"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCitasOpen(!isCitasOpen);
                }}
              >
                {isCitasOpen ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            )}
          </div>
          {isCitasOpen && isOpen && (
            <ul className="submenu">
              <li><Link to="/sesion"><span className="submenu-item">Sesiones</span></Link></li>
            </ul>
          )}
        </li>

        <li>
          <Link to="/reportes">
            <FaChartLine /> {isOpen && "Reportes"}
          </Link>
        </li>

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
