import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { NotificationProvider } from "./componentes/NotificationContext"; // Importar el provider
import Sidebar from "./componentes/Sidebar";
import Pacientes from "./paginas/pacientes/Pacientes";
import RegistrarPaciente from "./paginas/pacientes/RegistrarPaciente";
import EditarPaciente from "./paginas/pacientes/EditarPacientes";
import Inicio from "./paginas/Inicios";
import Citas from "./paginas/citas/CalendarioCitas";
import Salir from "./paginas/Salir";
import Login from "./paginas/Login";
import Administrador from "./paginas/administrador/Administrador";
import Usuario from "./paginas/administrador/Usuario";
import Area from "./paginas/administrador/Area";
import Profesional from "./paginas/administrador/Profesional";
import Sesion from "./paginas/citas/Sesion";
import Tratamiento from "./paginas/pacientes/Tratamiento";
import Tecnica from "./paginas/profesional/Tecnicas";
import Profesionales from "./paginas/profesional/Profesionales";
import HistorialClinico from "./paginas/profesional/HistorialClinico";
import Actividad from "./paginas/profesional/Actividad";
import PaginaReportes from './paginas/PaginaReportes';


// Layout con Sidebar y Outlet para contenido
const Layout = () => (
  <div style={{ display: "flex" }}>
    <Sidebar />
    <div className="main-content">
      <Outlet />
    </div>
  </div>
);

// PrivateRoute
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const user = JSON.parse(sessionStorage.getItem("usuario"));

  // Si no hay usuario o token, redirigir a login
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }
  
  // Si el usuario no tiene el rol requerido
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol.toLowerCase())) {
    return <Navigate to="/" replace />;
  }
  
  // Usuario autorizado
  return children;
};

const App = () => {
  return (
    <NotificationProvider> {/* Envolver toda la aplicación con el provider */}
      <Router>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas dentro del layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Inicio />} />

            {/* Rutas solo para administrador */}
            <Route
              path="administrador"
              element={
                <PrivateRoute allowedRoles={["administrador"]}>
                  <Administrador />
                </PrivateRoute>
              }
            />
            <Route
              path="usuario"
              element={
                <PrivateRoute allowedRoles={["administrador"]}>
                  <Usuario />
                </PrivateRoute>
              }
            />
            <Route
              path="areas"
              element={
                <PrivateRoute allowedRoles={["administrador"]}>
                  <Area />
                </PrivateRoute>
              }
            />
            <Route
              path="profesional"
              element={
                <PrivateRoute allowedRoles={["administrador"]}>
                  <Profesional />
                </PrivateRoute>
              }
            />
            <Route
              path="historial-clinico/:id"
              element={
                <PrivateRoute>
                  <HistorialClinico />
                </PrivateRoute>
              }
            />

            {/* Rutas accesibles para cualquier usuario autenticado */}
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="pacientes/registrar" element={<RegistrarPaciente />} />
            <Route path="pacientes/editar/:id" element={<EditarPaciente />} />
            <Route path="citas" element={<Citas />} />
            <Route path="sesion" element={<Sesion />} />
            <Route path="tratamientos" element={<Tratamiento />} />
            <Route path="tecnicas" element={<Tecnica />} />
            <Route path="actividad" element={<Actividad />} />
            <Route path="profesionales" element={<Profesionales />} />
            <Route path="salir" element={<Salir />} />
           <Route path="reportes" element={<PaginaReportes />} />
          </Route>

          {/* Ruta fallback para cualquier ruta no definida */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
};

export default App;