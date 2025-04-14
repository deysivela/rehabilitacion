import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Salir = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar el localStorage
    localStorage.clear();

    // Redirigir al login
    navigate('/login');
  }, [navigate]);

  return <h1>Sesión cerrada</h1>; // Mensaje temporal o de confirmación
};

export default Salir;
