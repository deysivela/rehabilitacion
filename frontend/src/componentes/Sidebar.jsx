import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaHome, FaSignOutAlt, FaUser, FaUserTie, FaClipboardList, FaUserMd, FaChartLine } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', !isOpen);
    document.body.classList.toggle('sidebar-expanded', isOpen);
  }, [isOpen]);

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
      {isOpen && ( // Mostrar el logo solo cuando el Sidebar está expandido
          <img
            src="/logo.png" 
            alt="Logo"
            className="sidebar-logo"
            style={{
              width: '300px',
              transition: 'opacity 0.3s ease',
            }}
          />
        )}

        <button className="toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>
      <ul className="sidebar-menu">
         <li>
          <Link to="/">
            <FaHome /> {isOpen && 'Inicio'}
          </Link>
        </li>
        <li>
          <Link to="/administrador">
            <FaUserTie /> {isOpen && 'Administrador'}
          </Link>
        </li>
        <li>
          <Link to="/pacientes">
            <FaUser /> {isOpen && 'Pacientes'}
          </Link>
        </li>
        <li>
          <Link to="/profesionales">
            <FaUserMd /> {isOpen && 'Profesionales de Salud'}
          </Link>
        </li>
        <li>
          <Link to="/citas">
            <FaClipboardList /> {isOpen && 'Citas'}
          </Link>
        </li>
        <li>
          <Link to="/reportes">
            <FaChartLine /> {isOpen && 'Reportes'}
          </Link>
        </li>
        <li className="logout">
          <Link to="/salir">
            <FaSignOutAlt /> {isOpen && 'Salir'}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

