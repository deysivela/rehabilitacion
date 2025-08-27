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
  FaTimes
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCitasOpen, setIsCitasOpen] = useState(false);
  const [isProfesionalesOpen, setIsProfesionalesOpen] = useState(false);
  const [isPacientesOpen, setIsPacientesOpen] = useState(false);
  const [usuario, setUsuario] = useState({ nombre: "", rol: "" });

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (windowSize.width < 1024) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("usuario"));
    if (userData) {
      setUsuario({ nombre: userData.nombre, rol: userData.rol.toLowerCase() });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      // Comportamiento automático según tamaño de pantalla
      if (window.innerWidth >= 1024) {
        // Escritorio - sidebar abierto
        setIsOpen(true);
      } else if (window.innerWidth >= 768) {
        // Tablet - sidebar cerrado por defecto pero con toggle visible
        setIsOpen(false);
      } else {
        // Móvil - sidebar cerrado
        setIsOpen(false);
      }
    };

    // Establecer estado inicial
    handleResize();
    
    window.addEventListener("resize", handleResize);
    
    // Limpiar el event listener al desmontar
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", !isOpen);
    document.body.classList.toggle("sidebar-expanded", isOpen);
    
    // Si está abierto en dispositivo pequeño, prevenir el scroll del body
    if (isOpen && windowSize.width < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, windowSize.width]);

  useEffect(() => {
    if (!isOpen) {
      setIsAdminOpen(false);
      setIsCitasOpen(false);
      setIsProfesionalesOpen(false);
      setIsPacientesOpen(false);
    }
  }, [isOpen]);

  // Determinar tipo de dispositivo según el ancho de pantalla
 
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024;
  const isMobile = windowSize.width < 768;

  return (
    <>
      {/* Overlay para dispositivos pequeños */}
      {isOpen && (isTablet || isMobile) && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}
      
      <div className={`sidebar ${isOpen ? "open" : "closed"} ${isMobile ? "mobile" : ""} ${isTablet ? "tablet" : ""}`}>
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
            {isOpen && (isTablet || isMobile) ? <FaTimes /> : <FaBars />}
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
              <Link to="/" className="submenu-main-link" onClick={closeSidebar}>
                <FaHome />
                {isOpen && <span>Inicio</span>}
              </Link>
            </div>
          </li>

          {/* ADMINISTRADOR SOLO SI TIENE ROL */}
          {usuario.rol === "administrador" && (
            <li>
              <div className="submenu-toggle">
                <Link to="/administrador" className="submenu-main-link" onClick={closeSidebar}>
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
                <li><Link to="/profesional" onClick={closeSidebar}><span className="submenu-item">Gestionar Profesionales</span></Link></li>
                <li><Link to="/usuario" onClick={closeSidebar}><span className="submenu-item">Gestionar Usuarios</span></Link></li>
                <li><Link to="/areas" onClick={closeSidebar}><span className="submenu-item">Gestionar Áreas</span></Link></li>
                <li><Link to="/reportes" onClick={closeSidebar}><span className="submenu-item">Generar Reportes</span></Link></li>
              </ul>
            </li>
          )}

          {/* PACIENTES */}
          <li>
            <div className="submenu-toggle">
              <Link to="/pacientes" className="submenu-main-link" onClick={closeSidebar}>
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
              <li><Link to="/tratamientos" onClick={closeSidebar}><span className="submenu-item">Tratamientos</span></Link></li>
            </ul>
          </li>

          {/* PROFESIONALES */}
          <li>
            <div className="submenu-toggle">
              <Link to="/profesionales" className="submenu-main-link" onClick={closeSidebar}>
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
              <li><Link to="/tecnicas" onClick={closeSidebar}><span className="submenu-item">Técnicas</span></Link></li>
              <li><Link to="/actividad" onClick={closeSidebar}><span className="submenu-item">Actividades</span></Link></li>
            </ul>
          </li>

          {/* CITAS */}
          <li>
            <div className="submenu-toggle">
              <Link to="/citas" className="submenu-main-link" onClick={closeSidebar}>
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
              <Link to="/sesion" className="submenu-main-link" onClick={closeSidebar}>
                <FaListAlt />
                {isOpen && <span>Sesiones</span>}
              </Link>
            </div>
          </li>
          
          {/* REPORTES */}
          <li>
            <div className="submenu-toggle">
              <Link to="/reportes" className="submenu-main-link" onClick={closeSidebar}>
                <FaChartLine />
                {isOpen && <span>Reportes</span>}
              </Link>
            </div>
          </li>

          {/* SALIR */}
          <li className="logout">
            <Link to="/salir" onClick={closeSidebar}>
              <FaSignOutAlt /> {isOpen && "Salir"}
            </Link>
          </li>
        </ul>
      </div>
      
      {/* Botón para abrir el sidebar en tablets y móviles cuando está cerrado */}
      {!isOpen && (isTablet || isMobile) && (
        <button className="mobile-toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      )}
    </>
  );
};

export default Sidebar;