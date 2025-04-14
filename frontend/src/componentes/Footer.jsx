import React from 'react';

const Footer = () => {
  const footerStyle = {
    backgroundColor: '#34495e',
    color: 'white',
    textAlign: 'center',
    padding: '10px 0',
    position: 'relative',
    bottom: 0,
    width: '100%',
    fontSize: '0.9rem',
  };

  return (
    <footer style={footerStyle}>
      <p>Centro de Rehabilitación Llallagua © 2025. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;


