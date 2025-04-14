import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FormPaciente from '../componentes/FormPaciente';
import TablaPacientes from '../componentes/TablaPacientes';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/pacientes/registrar" element={<FormPaciente />} />
        <Route path="/pacientes" element={<TablaPacientes />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
