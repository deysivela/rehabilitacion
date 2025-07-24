import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Salir = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar el sessionStorage
    sessionStorage.clear();

    // Redirigir al login
    navigate('/login');
  }, [navigate]);

  return <h1>Sesión cerrada</h1>; // Mensaje temporal o de confirmación
};

export default Salir;
