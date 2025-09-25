import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Salir = () => {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
    navigate('/login');
  }, [navigate]);

  return <h1>Sesión cerrada</h1>; 
};

export default Salir;
