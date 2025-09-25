import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaEdit, FaSearch, FaUser, FaCalendarAlt, FaIdCard, FaCalendarCheck,
  FaWheelchair, FaClipboardList, FaTimes, FaEye, FaFileMedical,
  FaPlusCircle, FaPlus, FaExclamationTriangle
} from "react-icons/fa";
import "./Profesionales.css";

const Profesionales = () => {
  const [pacientes, setPacientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroDiscapacidad, setFiltroDiscapacidad] = useState("todos");
  const [profesionales, setProfesionales] = useState([]);
  const [todosLosPacientes, setTodosLosPacientes] = useState([]);
  const [todosLosTratamientos, setTodosLosTratamientos] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroProfesional, setFiltroProfesional] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [modalTratamientoOpen, setModalTratamientoOpen] = useState(false);
  const [form, setForm] = useState({
    Idtrat: "", Idpac: "", Idprof: "", nombre: "", diagnostico: "",
    Fecha_ini: "", Fecha_fin: "", Estado: "En tratamiento", Razon: "", Obs: ""
  });

  const navigate = useNavigate();
  const location = useLocation();

  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const idProfesionalLogeado = usuario?.idprof;
  const esAdministrador = usuario?.rol?.toLowerCase() === "administrador";

  // Calcular edad
  const calcularEdadCompleta = useCallback((fechaNacStr) => {
    if (!fechaNacStr) return { años: "-", meses: "-", texto: "-" };
    try {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacStr);
      let años = hoy.getFullYear() - nacimiento.getFullYear();
      let meses = hoy.getMonth() - nacimiento.getMonth();
      if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
        años--; meses += 12;
      }
      if (hoy.getDate() < nacimiento.getDate()) {
        meses--; if (meses < 0) meses = 11;
      }
      if (años < 1) return { años: 0, meses, texto: `${meses} ${meses===1?'mes':'meses'}` };
      return { años, meses, texto: `${años} ${años===1?'año':'años'}` };
    } catch { return { años: "-", meses: "-", texto: "-" }; }
  }, []);

  // Abrir modal tratamiento
  const abrirModalTratamiento = useCallback((paciente = null, tratamiento = null) => {
    if (paciente && tratamiento) {
      setForm({
        Idtrat: tratamiento.Idtrat || "",
        Idpac: paciente.Idpac,
        Idprof: tratamiento.Idprof || idProfesionalLogeado,
        nombre: tratamiento.nombre || "",
        diagnostico: tratamiento.diagnostico || "",
        Fecha_ini: tratamiento.Fecha_ini ? tratamiento.Fecha_ini.split("T")[0] : "",
        Fecha_fin: tratamiento.Fecha_fin ? tratamiento.Fecha_fin.split("T")[0] : "",
        Estado: tratamiento.Estado || "En tratamiento",
        Razon: tratamiento.Razon || "",
        Obs: tratamiento.Obs || "",
      });
    } else if (paciente) {
      setForm({
        Idtrat: "", Idpac: paciente.Idpac, Idprof: idProfesionalLogeado,
        nombre: "", diagnostico: "",
        Fecha_ini: new Date().toISOString().split("T")[0],
        Fecha_fin: "", Estado: "En tratamiento", Razon: "", Obs: ""
      });
    } else {
      setForm({
        Idtrat: "", Idpac: "", Idprof: idProfesionalLogeado,
        nombre: "", diagnostico: "",
        Fecha_ini: new Date().toISOString().split("T")[0],
        Fecha_fin: "", Estado: "En tratamiento", Razon: "", Obs: ""
      });
    }
    setModalTratamientoOpen(true);
  }, [idProfesionalLogeado]);

  // MODIFICADO: Solo pacientes con tratamientos
  const obtenerPacientesConTratamientos = useCallback((pacientesList, tratamientosList) => {
    console.log("Total pacientes:", pacientesList.length);
    console.log("Total tratamientos:", tratamientosList.length);
    
    // Filtrar pacientes que tengan al menos un tratamiento
    const pacientesConTratamientos = pacientesList.filter(paciente => 
      tratamientosList.some(tratamiento => tratamiento.Idpac === paciente.Idpac)
    );

    if (esAdministrador) {
      // Administrador: mostrar TODOS los pacientes que tengan tratamientos
      return pacientesConTratamientos.map(paciente => ({
        ...paciente,
        tratamientos: tratamientosList.filter(t => t.Idpac === paciente.Idpac)
      }));
    } else {
      // Médico: mostrar solo los pacientes que tienen tratamiento con este profesional
      const tratamientosDelProfesional = tratamientosList.filter(t => t.Idprof === idProfesionalLogeado);
      
      const pacientesFiltrados = pacientesConTratamientos.filter(paciente => 
        tratamientosDelProfesional.some(t => t.Idpac === paciente.Idpac)
      );
      
      console.log("Pacientes del profesional:", pacientesFiltrados.length);
      
      return pacientesFiltrados.map(paciente => ({
        ...paciente,
        tratamientos: tratamientosDelProfesional.filter(t => t.Idpac === paciente.Idpac)
      }));
    }
  }, [esAdministrador, idProfesionalLogeado]);

  // MODIFICADO: Filtros que consideran múltiples tratamientos
  const aplicarFiltrosBusqueda = useCallback((pacientesList) => {
    return pacientesList
      .map((paciente) => {
        let tratamientosFiltrados = paciente.tratamientos || [];
  
        // Filtro por profesional (solo si es admin y selecciona uno)
        if (esAdministrador && filtroProfesional !== "") {
          tratamientosFiltrados = tratamientosFiltrados.filter(
            (t) => String(t.Idprof) === String(filtroProfesional)
          );
        }
  
        // Filtro por estado
        if (filtroEstado !== "todos") {
          tratamientosFiltrados = tratamientosFiltrados.filter(
            (t) => t.Estado?.toLowerCase() === filtroEstado.toLowerCase()
          );
        }
  
        // Solo dejar pacientes con tratamientos que cumplan filtros
        if (tratamientosFiltrados.length === 0) return null;
  
        // Filtro búsqueda por nombre o CI
        const cumpleFiltro = `${paciente.Nombre_pac} ${paciente.Appaterno_pac || ""} ${paciente.Apmaterno_pac || ""} ${paciente.Ci_pac}`
          .toLowerCase()
          .includes(filtro.toLowerCase());
  
        // Filtro discapacidad
        const cumpleDiscapacidad =
          filtroDiscapacidad === "todos" ||
          (filtroDiscapacidad === "si" && paciente.Tienediscapacidad?.toLowerCase() === "sí") ||
          (filtroDiscapacidad === "no" && paciente.Tienediscapacidad?.toLowerCase() !== "sí");
  
        if (!cumpleFiltro || !cumpleDiscapacidad) return null;
  
        return {
          ...paciente,
          tratamientos: tratamientosFiltrados,
        };
      })
      .filter(Boolean); // elimina los null
  }, [filtro, filtroDiscapacidad, filtroEstado, filtroProfesional, esAdministrador]);
  

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);
        const [pacientesRes, tratamientosRes, profesionalesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/paciente/listar"),
          axios.get("http://localhost:5000/api/tratamiento/listar"),
          axios.get("http://localhost:5000/api/prof_salud/listar")
        ]);

        console.log("Datos de la API - Tratamientos:", tratamientosRes.data);
        
        setProfesionales(profesionalesRes.data);
        setTodosLosPacientes(pacientesRes.data);
        setTodosLosTratamientos(tratamientosRes.data);

        const pacientesConTratamientos = obtenerPacientesConTratamientos(pacientesRes.data, tratamientosRes.data);
        const pacientesFiltrados = aplicarFiltrosBusqueda(pacientesConTratamientos);
        
        pacientesFiltrados.sort((a, b) => b.Idpac - a.Idpac);
        setPacientes(pacientesFiltrados);
        setCargando(false);

        // Manejar parámetros de URL
        const params = new URLSearchParams(location.search);
        const pacienteId = params.get("pacienteId");
        const abrirModalParam = params.get("abrirModalTratamiento") === "true";

        if (abrirModalParam && pacienteId) {
          const paciente = pacientesRes.data.find(p => p.Idpac.toString() === pacienteId);
          if (paciente) abrirModalTratamiento(paciente);
          navigate(location.pathname, { replace: true });
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setCargando(false);
      }
    };
    fetchData();
  }, [location.search, location.pathname, navigate, obtenerPacientesConTratamientos, aplicarFiltrosBusqueda, abrirModalTratamiento]);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    if (todosLosPacientes.length > 0 && todosLosTratamientos.length > 0) {
      const recargarConFiltros = async () => {
        try {
          const pacientesConTratamientos = obtenerPacientesConTratamientos(todosLosPacientes, todosLosTratamientos);
          const pacientesFiltrados = aplicarFiltrosBusqueda(pacientesConTratamientos);
          pacientesFiltrados.sort((a, b) => b.Idpac - a.Idpac);
          setPacientes(pacientesFiltrados);
        } catch (error) {
          console.error("Error al aplicar filtros:", error);
        }
      };
      
      recargarConFiltros();
    }
  }, [filtro, filtroDiscapacidad, filtroEstado, filtroProfesional, todosLosPacientes, todosLosTratamientos, obtenerPacientesConTratamientos, aplicarFiltrosBusqueda]);

  // NUEVA FUNCIÓN: Mostrar detalles del tratamiento específico
  const mostrarDetallesTratamiento = (paciente, tratamientoEspecifico) => {
    setPacienteSeleccionado({
      ...paciente,
      discapacidad: paciente.detalleDiscapacidad || null,
      tratamientoSeleccionado: tratamientoEspecifico // Solo el tratamiento específico
    });
    setMostrarModal(true);
  };

  const generarHistorialCompleto = (pacienteId) => navigate(`/historial-clinico/${pacienteId}`);
  const redirigirSesion = (idPac) => navigate("/sesion", { state: { Idpac: idPac } });
  const cerrarModalTratamiento = () => setModalTratamientoOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const obtenerNombreProfesional = (idProf) => {
    const profesional = profesionales.find((prof) => prof.Idprof === idProf);
    return profesional ? `${profesional.Nombre_prof} ${profesional.Appaterno_prof}` : "Profesional no encontrado";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.Idtrat) {
        await axios.put(`http://localhost:5000/api/tratamiento/actualizar/${form.Idtrat}`, form);
        alert("Tratamiento actualizado correctamente");
      } else {
        await axios.post("http://localhost:5000/api/tratamiento/crear", form);
        alert("Tratamiento registrado correctamente");
      }

      // Recargar datos
      const [pacientesRes, tratamientosRes] = await Promise.all([
        axios.get("http://localhost:5000/api/paciente/listar"),
        axios.get("http://localhost:5000/api/tratamiento/listar")
      ]);

      setTodosLosPacientes(pacientesRes.data);
      setTodosLosTratamientos(tratamientosRes.data);
      
      const pacientesConTratamientos = obtenerPacientesConTratamientos(pacientesRes.data, tratamientosRes.data);
      const pacientesFiltrados = aplicarFiltrosBusqueda(pacientesConTratamientos);
      pacientesFiltrados.sort((a, b) => b.Idpac - a.Idpac);
      setPacientes(pacientesFiltrados);

      cerrarModalTratamiento();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar el tratamiento");
    }
  };

  return (
    <div className="pacientes-container">
      <div className="header-container">
        <h1>
          <FaUser /> {esAdministrador ? "Pacientes con Tratamientos" : "Mis Pacientes en Tratamientos"}
        </h1>
        <div className="header-info">
          <button
            className="btn-nuevo-tratamiento"
            onClick={() => abrirModalTratamiento()}
          >
            <FaPlus /> Nuevo Tratamiento
          </button>
        </div>
      </div>

      <div className="filtros-container">
        <div className="filtro-group">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por nombre o CI..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        <div className="filtro-group">
          <FaWheelchair />
          <select
            value={filtroDiscapacidad}
            onChange={(e) => setFiltroDiscapacidad(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="si">Con discapacidad</option>
            <option value="no">Sin discapacidad</option>
          </select>
        </div>

        <div className="filtro-group">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="select-estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="En tratamiento">En tratamiento</option>
            <option value="Alta temporal">Alta temporal</option>
            <option value="Alta definitiva">Alta definitiva</option>
            <option value="Abandono">Abandono</option>
          </select>
        </div>

        {esAdministrador && (
          <div className="filtro-group">
            <FaUser />
            <select
              value={filtroProfesional}
              onChange={(e) => setFiltroProfesional(e.target.value)}
              className="select-profesional"
            >
              <option value="">Todos los profesionales</option>
              {profesionales.map((prof) => (
                <option key={prof.Idprof} value={prof.Idprof}>
                  {prof.Nombre_prof} {prof.Appaterno_prof}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {cargando ? (
        <div className="cargando">Cargando pacientes con tratamientos...</div>
      ) : (
        <div className="table-responsive">
          <table className="pacientes-table">
            <thead>
              <tr>
                <th><FaUser /> Nombre</th>
                <th><FaIdCard /> CI</th>
                <th><FaCalendarAlt /> F Inicio</th>
                <th><FaClipboardList /> Estado</th>
                <th><FaCalendarCheck /> F Fin</th>
                {esAdministrador && <th>Profesional</th>}
                <th>PcD</th>
                <th>Acciones</th>
              </tr>
            </thead>
            
            <tbody>
              {pacientes.length > 0 ? (
                pacientes.map((paciente) => (
                  paciente.tratamientos.map((tratamiento, index) => (
                    <tr key={`${paciente.Idpac}-${tratamiento.Idtrat || index}`}>
                      {/* SOLO nombre del paciente, sin indicador de tratamiento */}
                      <td>
                        {`${paciente.Nombre_pac} ${paciente.Appaterno_pac} ${paciente.Apmaterno_pac}`}
                      </td>
                      <td>{paciente.Ci_pac || "-"}</td>
                      <td>
                        {tratamiento.Fecha_ini
                          ? new Date(tratamiento.Fecha_ini).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <span className={`badge-estado ${tratamiento.Estado?.replace(/\s+/g, "-").toLowerCase()}`}>
                          {tratamiento.Estado || "Sin estado"}
                        </span>
                      </td>
                      <td>
                        {tratamiento.Fecha_fin
                          ? new Date(tratamiento.Fecha_fin).toLocaleDateString()
                          : "En curso"}
                      </td>
                      {esAdministrador && (
                        <td>
                          {tratamiento.Idprof
                            ? obtenerNombreProfesional(tratamiento.Idprof)
                            : "Sin asignar"}
                        </td>
                      )}
                      <td>
                        <span className={`badge ${paciente.Tienediscapacidad?.toLowerCase() === "sí" ? "badge-discapacidad" : "badge-nodiscapacidad"}`}>
                          {paciente.Tienediscapacidad?.toLowerCase() === "sí" ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="acciones">
                        {/* Botón de detalles que muestra SOLO el tratamiento actual */}
                        <button className="btn-detalles" title="Ver detalles del tratamiento" 
                                onClick={() => mostrarDetallesTratamiento(paciente, tratamiento)}>
                          <FaEye />
                        </button>
                        
                        <button onClick={() => generarHistorialCompleto(paciente.Idpac)} title="Generar historial completo" className="btn-action">
                          <FaFileMedical />
                        </button>
                        
                        <button className="btn-action btn-editar" title="Editar tratamiento" onClick={() => abrirModalTratamiento(paciente, tratamiento)}>
                          <FaEdit />
                        </button>
                        <button className="btn-action btn-sesion" title="Realizar una sesión" onClick={() => redirigirSesion(paciente.Idpac)}>
                          <FaPlusCircle />
                        </button>
                      </td>
                    </tr>
                  ))
                ))
              ) : (
                <tr>
                  <td colSpan={esAdministrador ? 8 : 7} className="no-results">
                    <div className="no-results-content">
                      <FaExclamationTriangle />
                      <p>No se encontraron pacientes con tratamientos</p>
                      <button 
                        className="btn-nuevo-tratamiento"
                        onClick={() => abrirModalTratamiento()}
                      >
                        <FaPlus /> Crear primer tratamiento
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles del TRATAMIENTO ESPECÍFICO */}
      {mostrarModal && pacienteSeleccionado && (
        <div className="modal-detalle">
          <div className="modal-contenido">
            <div className="modal-header">
              <h2>Detalles del Tratamiento</h2>
              <button
                className="btn-cerrar"
                onClick={() => setMostrarModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="detalle-row">
                <div className="detalle-col">
                  <h3>Información del Paciente</h3>
                  <p>
                    <strong>Nombre completo:</strong>{" "}
                    {pacienteSeleccionado.Nombre_pac}{" "}
                    {pacienteSeleccionado.Appaterno_pac}{" "}
                    {pacienteSeleccionado.Apmaterno_pac}
                  </p>
                  <p>
                    <strong>CI:</strong>{" "}
                    {pacienteSeleccionado.Ci_pac || "No especificado"}
                  </p>
                  <p>
                    <strong>Edad:</strong>{" "}
                    {calcularEdadCompleta(pacienteSeleccionado.Fnaci_pac).texto}
                  </p>
                </div>

                <div className="detalle-col">
                  <h3>Información de Contacto</h3>
                  <p>
                    <strong>Teléfono:</strong>{" "}
                    {pacienteSeleccionado.Telefono_pac || "No especificado"}
                  </p>
                  <p>
                    <strong>Dirección:</strong>{" "}
                    {pacienteSeleccionado.Direccion_pac || "No especificado"}
                  </p>
                </div>
              </div>

              {/* Sección de TRATAMIENTO ESPECÍFICO */}
              <div className="detalle-row">
                <div className="detalle-col-full">
                  <h3>Detalles del Tratamiento</h3>
                  {pacienteSeleccionado.tratamientoSeleccionado ? (
                    <div className="tratamiento-item">
                      <p><strong>Nombre:</strong> {pacienteSeleccionado.tratamientoSeleccionado.nombre || "No especificado"}</p>
                      <p><strong>Profesional:</strong> {obtenerNombreProfesional(pacienteSeleccionado.tratamientoSeleccionado.Idprof)}</p>
                      <p><strong>Estado:</strong> {pacienteSeleccionado.tratamientoSeleccionado.Estado || "No especificado"}</p>
                      <p><strong>Fecha de inicio:</strong> {new Date(pacienteSeleccionado.tratamientoSeleccionado.Fecha_ini).toLocaleDateString()}</p>
                      <p><strong>Fecha de fin:</strong> {pacienteSeleccionado.tratamientoSeleccionado.Fecha_fin ? new Date(pacienteSeleccionado.tratamientoSeleccionado.Fecha_fin).toLocaleDateString() : "En curso"}</p>
                      <p><strong>Diagnóstico:</strong> {pacienteSeleccionado.tratamientoSeleccionado.diagnostico || "No especificado"}</p>
                      <p><strong>Observaciones:</strong> {pacienteSeleccionado.tratamientoSeleccionado.Obs || "No especificado"}</p>
                    </div>
                  ) : (
                    <p>No hay información del tratamiento.</p>
                  )}
                </div>
              </div>

              {/* Sección de discapacidad */}
              <div className="detalle-row">
                <div className="detalle-col">
                  <h3>Información de Discapacidad</h3>
                  <p>
                    <strong>Discapacidad:</strong>
                    <span className={`badge ${pacienteSeleccionado.Tienediscapacidad?.toLowerCase() === "sí" ? "badge-discapacidad" : "badge-nodiscapacidad"}`}>
                      {pacienteSeleccionado.Tienediscapacidad?.toLowerCase() === "sí" ? "Sí" : "No"}
                    </span>
                  </p>

                  {pacienteSeleccionado.Tienediscapacidad?.toLowerCase() === "sí" && pacienteSeleccionado.discapacidad && (
                    <>
                      <p><strong>Tipo:</strong> {pacienteSeleccionado.discapacidad.Tipo_disc || "No especificado"}</p>
                      <p><strong>Grado:</strong> {pacienteSeleccionado.discapacidad.Grado_disc || "No especificado"}</p>
                      <p><strong>Observaciones:</strong> {pacienteSeleccionado.discapacidad.Obs || "No especificado"}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-nuevo-tratamiento"
                onClick={() => {
                  setMostrarModal(false);
                  abrirModalTratamiento(pacienteSeleccionado);
                }}
              >
                <FaPlus /> Nuevo Tratamiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para registrar/editar tratamiento */}
      {modalTratamientoOpen && (
        <div className="modal">
          <div className="modal-contenido modal-grande">
            <span className="cerrar-modal" onClick={cerrarModalTratamiento}>
              <FaTimes />
            </span>
            <h3>{form.Idtrat ? "Editar Tratamiento" : "Nuevo Tratamiento"}</h3>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Paciente:</label>
                  <select
                    name="Idpac"
                    value={form.Idpac}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={!!form.Idtrat}
                  >
                    <option value="">Seleccione un paciente</option>
                    {todosLosPacientes.map((p) => (
                      <option key={p.Idpac} value={p.Idpac}>
                        {p.Nombre_pac} {p.Appaterno_pac} {p.Apmaterno_pac} - CI: {p.Ci_pac}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Descripción:</label>
                  <textarea
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    rows="2"
                    className="form-control"
                    placeholder="Ingrese descripción del tratamiento"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Diagnóstico:</label>
                  <textarea
                    name="diagnostico"
                    value={form.diagnostico}
                    onChange={handleChange}
                    rows="3"
                    className="form-control"
                    placeholder="Ingrese el diagnóstico del paciente"
                  />
                </div>

                <div className="form-group">
                  <label>Profesional:</label>
                  <input
                    type="text"
                    value={obtenerNombreProfesional(form.Idprof)}
                    readOnly
                    className="readonly-input"
                  />
                </div>

                <div className="form-group">
                  <label>Fecha Inicio:</label>
                  <input
                    type="date"
                    name="Fecha_ini"
                    value={form.Fecha_ini}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Fecha Fin:</label>
                  <input
                    type="date"
                    name="Fecha_fin"
                    value={form.Fecha_fin}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Estado:</label>
                  <select
                    name="Estado"
                    value={form.Estado}
                    onChange={handleChange}
                    required
                    className="form-control"
                  >
                    <option value="En tratamiento">En tratamiento</option>
                    <option value="Alta temporal">Alta temporal</option>
                    <option value="Alta definitiva">Alta definitiva</option>
                    <option value="Abandono">Abandono</option>
                  </select>
                </div>

                {form.Estado === "Abandono" && (
                  <div className="form-group">
                    <label>Razón del abandono:</label>
                    <select
                      name="Razon"
                      value={form.Razon}
                      onChange={handleChange}
                      required
                      className="form-control"
                    >
                      <option value="">Seleccione una razón</option>
                      <option value="Familiar">Familiar</option>
                      <option value="Vivienda">Vivienda</option>
                      <option value="Violencia">Violencia</option>
                      <option value="Educación">Educación</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Económico">Económico</option>
                      <option value="Desastre natural">Desastre natural</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Observaciones:</label>
                  <textarea
                    name="Obs"
                    value={form.Obs}
                    onChange={handleChange}
                    rows="3"
                    className="form-control"
                  />
                </div>
                <div className="botones-modal">
                  <button type="submit" className="btn-guardar">
                    {form.Idtrat ? "Actualizar" : "Guardar"}
                  </button>
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={cerrarModalTratamiento}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profesionales;