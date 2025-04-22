import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './componentes/Sidebar';
import Pacientes from './paginas/pacientes/Pacientes';
import RegistrarPaciente from './paginas/pacientes/RegistrarPaciente';
import EditarPaciente from './paginas/pacientes/EditarPacientes';
import Inicio from './paginas/Inicios';
import Profesionales from './paginas/Profesionales';
import Citas from './paginas/Citas';
import Salir from './paginas/Salir';
import Login from './paginas/Login';
import Administrador from './paginas/administrador/Administrador';
import Usuario from './paginas/administrador/Usuario'; 
import Area from './paginas/administrador/Area'; 
import Profesional from './paginas/administrador/Profesional'; 

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div style={{ display: 'flex' }}>
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    
                    <Route path="/" element={<Inicio />} />
                    <Route path="/pacientes" element={<Pacientes />} />
                    <Route path="/pacientes/registrar" element={<RegistrarPaciente />} />
                    <Route path="/pacientes/editar/:id" element={<EditarPaciente />} />
                    <Route path="/administrador" element={<Administrador/>} />
                    <Route path="/profesionales" element={<Profesionales />} />
                    <Route path="/usuario" element={<Usuario />} />
                    <Route path="/areas" element={<Area />} />
                    <Route path="/profesional" element={<Profesional />} />
                    <Route path="/citas" element={<Citas />} />
                    <Route path="/salir" element={<Salir />} />
                  </Routes>                                                                     
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;








