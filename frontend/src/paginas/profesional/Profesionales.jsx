import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  FaEdit,
  FaSearch,
  FaUser,
  FaCalendarAlt,
  FaIdCard,
  FaCalendarCheck,
  FaWheelchair,
  FaClipboardList,
  FaTimes,
  FaEye,
  FaFileMedical,
  FaPlusCircle,
  FaPlus,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./Profesionales.css";

const Profesionales = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroDiscapacidad, setFiltroDiscapacidad] = useState("todos");
  const [profesionales, setProfesionales] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [todosLosTratamientos, setTodosLosTratamientos] = useState([]);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroProfesional, setFiltroProfesional] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [modalTratamientoOpen, setModalTratamientoOpen] = useState(false);
  const [form, setForm] = useState({
    Idtrat: "",
    Idpac: "",
    Idprof: "",
    nombre: "",
    diagnostico: "",
    Fecha_ini: "",
    Fecha_fin: "",
    Estado: "En tratamiento",
    Razon: "",
    Obs: "",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // ✅ Hook para leer parámetros URL

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
        años--;
        meses += 12;
      }
      if (hoy.getDate() < nacimiento.getDate()) {
        meses--;
        if (meses < 0) meses = 11;
      }
      if (años < 1)
        return {
          años: 0,
          meses,
          texto: `${meses} ${meses === 1 ? "mes" : "meses"}`,
        };
      return { años, meses, texto: `${años} ${años === 1 ? "año" : "años"}` };
    } catch {
      return { años: "-", meses: "-", texto: "-" };
    }
  }, []);

  // Función para cargar pacientes
  const cargarPacientes = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/paciente/listar");
      setPacientes(res.data);
      console.log("Pacientes cargados:", res.data);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    }
  }, []);

  // Abrir modal tratamiento automáticamente desde URL
  const abrirModalDesdeURL = useCallback(async () => {
    const pacienteId = searchParams.get("pacienteId");
    const abrirModal = searchParams.get("abrirModalTratamiento");

    if (abrirModal === "true" && pacienteId) {
      console.log("Abriendo modal automáticamente para paciente:", pacienteId);

      // Asegurar pacientes cargados
      if (pacientes.length === 0) {
        await cargarPacientes();
      }

      // Comparar con seguridad (string vs número)
      const pacienteExiste = pacientes.find(
        (pac) => String(pac.Idpac) === String(pacienteId)
      );

      if (pacienteExiste) {
        setForm((prev) => ({
          ...prev,
          Idpac: String(pacienteId),
          Idprof: idProfesionalLogeado,
          Fecha_ini: new Date().toISOString().split("T")[0],
        }));
        setModalTratamientoOpen(true);

        // Limpiar parámetros de la URL
        navigate("/profesionales", { replace: true });
      } else {
        console.warn("Paciente no encontrado:", pacienteId);
      }
    }
  }, [
    searchParams,
    pacientes,
    cargarPacientes,
    idProfesionalLogeado,
    navigate,
  ]);

  useEffect(() => {
    if (pacientes.length > 0) {
      abrirModalDesdeURL();
    }
  }, [pacientes, abrirModalDesdeURL]);

  // Abrir modal tratamiento manualmente
  const abrirModalTratamiento = useCallback(
    (tratamiento = null) => {
      if (tratamiento) {
        setForm({
          Idtrat: tratamiento.Idtrat || "",
          Idpac: tratamiento.Idpac,
          Idprof: tratamiento.Idprof || idProfesionalLogeado,
          nombre: tratamiento.nombre || "",
          diagnostico: tratamiento.diagnostico || "",
          Fecha_ini: tratamiento.Fecha_ini
            ? tratamiento.Fecha_ini.split("T")[0]
            : "",
          Fecha_fin: tratamiento.Fecha_fin
            ? tratamiento.Fecha_fin?.split("T")[0] || ""
            : "",
          Estado: tratamiento.Estado || "En tratamiento",
          Razon: tratamiento.Razon || "",
          Obs: tratamiento.Obs || "",
        });
      } else {
        setForm({
          Idtrat: "",
          Idpac: "",
          Idprof: idProfesionalLogeado,
          nombre: "",
          diagnostico: "",
          Fecha_ini: new Date().toISOString().split("T")[0],
          Fecha_fin: "",
          Estado: "En tratamiento",
          Razon: "",
          Obs: "",
        });
      }
      setModalTratamientoOpen(true);
    },
    [idProfesionalLogeado]
  );

  // Función para obtener nombre profesional
  const obtenerNombreProfesional = useCallback(
    (idProf) => {
      const profesional = profesionales.find((prof) => prof.Idprof === idProf);
      return profesional
        ? `${profesional.Nombre_prof} ${profesional.Appaterno_prof}`
        : "Profesional no encontrado";
    },
    [profesionales]
  );

  // Función para obtener nombre del paciente
  const obtenerNombrePaciente = useCallback(
    (idPac) => {
      const paciente = pacientes.find((pac) => pac.Idpac === idPac);
      return paciente
        ? `${paciente.Nombre_pac} ${paciente.Appaterno_pac} ${paciente.Apmaterno_pac}`
        : "Paciente no encontrado";
    },
    [pacientes]
  );

  // Función para verificar discapacidad (maneja diferentes tipos de datos)
  const tieneDiscapacidad = useCallback((paciente) => {
    if (!paciente || !paciente.Tienediscapacidad) return false;

    const discapacidad = paciente.Tienediscapacidad;

    // Manejar diferentes tipos de datos
    if (typeof discapacidad === "string") {
      return (
        discapacidad.toLowerCase() === "sí" ||
        discapacidad.toLowerCase() === "si" ||
        discapacidad === "1" ||
        discapacidad.toLowerCase() === "true"
      );
    } else if (typeof discapacidad === "number") {
      return discapacidad === 1;
    } else if (typeof discapacidad === "boolean") {
      return discapacidad;
    }

    return false;
  }, []);

  // Función para aplicar filtros
  const aplicarFiltros = useCallback(
    (tratamientosData) => {
      let tratamientosFiltrados = [...tratamientosData];

      // Si NO es administrador, filtrar por profesional logueado
      if (!esAdministrador && idProfesionalLogeado) {
        tratamientosFiltrados = tratamientosFiltrados.filter(
          (tratamiento) => tratamiento.Idprof === idProfesionalLogeado
        );
      }

      // Aplicar filtro de profesional si es admin y seleccionó uno
      if (esAdministrador && filtroProfesional) {
        tratamientosFiltrados = tratamientosFiltrados.filter(
          (tratamiento) => tratamiento.Idprof === parseInt(filtroProfesional)
        );
      }

      // Aplicar filtro de estado
      if (filtroEstado !== "todos") {
        tratamientosFiltrados = tratamientosFiltrados.filter(
          (tratamiento) =>
            tratamiento.Estado?.toLowerCase() === filtroEstado.toLowerCase()
        );
      }

      // Aplicar filtro de búsqueda por nombre o CI
      if (filtro) {
        tratamientosFiltrados = tratamientosFiltrados.filter((tratamiento) => {
          const paciente = tratamiento.paciente;
          const textoBusqueda = `${paciente?.Nombre_pac || ""} ${
            paciente?.Appaterno_pac || ""
          } ${paciente?.Apmaterno_pac || ""} ${
            paciente?.Ci_pac || ""
          }`.toLowerCase();
          return textoBusqueda.includes(filtro.toLowerCase());
        });
      }

      // Aplicar filtro de discapacidad
      if (filtroDiscapacidad !== "todos") {
        tratamientosFiltrados = tratamientosFiltrados.filter((tratamiento) => {
          const tieneDisc = tieneDiscapacidad(tratamiento.paciente);
          return filtroDiscapacidad === "si" ? tieneDisc : !tieneDisc;
        });
      }

      return tratamientosFiltrados;
    },
    [
      esAdministrador,
      idProfesionalLogeado,
      filtroProfesional,
      filtroEstado,
      filtro,
      filtroDiscapacidad,
      tieneDiscapacidad,
    ]
  );

  // Cargar datos inicial
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);
        console.log("Cargando datos iniciales...");

        const [tratamientosRes, profesionalesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/tratamiento/listar"),
          axios.get("http://localhost:5000/api/prof_salud/listar"),
        ]);

        console.log("Tratamientos recibidos:", tratamientosRes.data);

        setProfesionales(profesionalesRes.data);
        setTodosLosTratamientos(tratamientosRes.data);

        // Aplicar filtros iniciales
        const tratamientosFiltrados = aplicarFiltros(tratamientosRes.data);
        setTratamientos(tratamientosFiltrados);
        setCargando(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setCargando(false);
      }
    };

    fetchData();
  }, [aplicarFiltros]);

  // Cargar pacientes al iniciar
  useEffect(() => {
    cargarPacientes();
  }, [cargarPacientes]);

  // Efecto para aplicar filtros cuando cambien
  useEffect(() => {
    if (todosLosTratamientos.length > 0) {
      const tratamientosFiltrados = aplicarFiltros(todosLosTratamientos);
      setTratamientos(tratamientosFiltrados);
    }
  }, [
    filtro,
    filtroDiscapacidad,
    filtroEstado,
    filtroProfesional,
    todosLosTratamientos,
    aplicarFiltros,
  ]);

  const formatDateLocal = (fecha) => {
    if (!fecha || fecha === "0000-00-00") return "En curso";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  // Mostrar detalles del tratamiento
  const mostrarDetallesTratamiento = (tratamiento) => {
    setTratamientoSeleccionado(tratamiento);
    setMostrarModal(true);
  };

  const generarHistorialCompleto = (pacienteId) =>
    navigate(`/historial-clinico/${pacienteId}`);

  const redirigirSesion = (idPac) =>
    navigate("/sesion", { state: { Idpac: idPac } });

  const cerrarModalTratamiento = () => {
    setModalTratamientoOpen(false);
    // Limpiar formulario al cerrar
    setForm({
      Idtrat: "",
      Idpac: "",
      Idprof: idProfesionalLogeado,
      nombre: "",
      diagnostico: "",
      Fecha_ini: new Date().toISOString().split("T")[0],
      Fecha_fin: "",
      Estado: "En tratamiento",
      Razon: "",
      Obs: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setForm((prev) => {
      let nuevoForm = { ...prev, [name]: value };
  
      if (name === "Estado") {
        if (value === "En tratamiento") {
          nuevoForm.Fecha_fin = ""; 
          nuevoForm.Razon = ""; 
        } else if (value === "Alta temporal" || value === "Alta definitiva" || value === "Abandono") {
          const hoy = new Date().toISOString().split("T")[0];
          nuevoForm.Fecha_fin = hoy;
        }

        if (value !== "Abandono") {
          nuevoForm.Razon = "";
        }
      }
      return nuevoForm;
    });
  };
  

  // Enviar formulario de tratamiento
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Enviando formulario:", form);

      // Validar que se seleccionó paciente
      if (!form.Idpac) {
        alert("Por favor seleccione un paciente");
        return;
      }

      if (form.Idtrat) {
        await axios.put(
          `http://localhost:5000/api/tratamiento/actualizar/${form.Idtrat}`,
          form
        );
      } else {
        await axios.post("http://localhost:5000/api/tratamiento/crear", form);
      }

      // Recargar datos
      setCargando(true);
      const tratamientosRes = await axios.get(
        "http://localhost:5000/api/tratamiento/listar"
      );
      setTodosLosTratamientos(tratamientosRes.data);

      const tratamientosFiltrados = aplicarFiltros(tratamientosRes.data);
      setTratamientos(tratamientosFiltrados);
      setCargando(false);
      cerrarModalTratamiento();
    } catch (error) {
      console.error("Error al guardar tratamiento:", error);
      alert("Ocurrió un error al guardar el tratamiento");
      setCargando(false);
    }
  };

  return (
    <div className="pacientes-container">
      <div className="header-container">
        <h1>
          <FaUser />{" "}
          {esAdministrador ? "Tratamientos" : "Mis Pacientes en Tratamientos"}
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
        <div className="cargando">Cargando tratamientos...</div>
      ) : (
        <div className="table-responsive">
          <table className="tratamiento-table">
            <thead>
              <tr>
                <th>
                  <FaUser /> Nombre
                </th>
                <th>
                  <FaIdCard /> CI
                </th>
                <th>
                  <FaCalendarAlt /> F Inicio
                </th>
                <th>
                  <FaClipboardList /> Estado
                </th>
                <th>
                  <FaCalendarCheck /> F Fin
                </th>
                {esAdministrador && <th>Profesional</th>}
                <th>PcD</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tratamientos.length > 0 ? (
                tratamientos.map((tratamiento) => {
                  const paciente = tratamiento.paciente;
                  const esDiscapacitado = tieneDiscapacidad(paciente);

                  return (
                    <tr key={tratamiento.Idtrat}>
                      <td>
                        {`${paciente?.Nombre_pac || ""} ${
                          paciente?.Appaterno_pac || ""
                        } ${paciente?.Apmaterno_pac || ""}`}
                      </td>
                      <td>{paciente?.Ci_pac || "-"}</td>
                      <td>
                        {tratamiento.Fecha_ini
                          ? formatDateLocal(tratamiento.Fecha_ini)
                          : "-"}
                      </td>
                      <td>
                        <span
                          className={`badge-estado ${tratamiento.Estado?.replace(
                            /\s+/g,
                            "-"
                          ).toLowerCase()}`}
                        >
                          {tratamiento.Estado || "Sin estado"}
                        </span>
                      </td>
                      <td>{formatDateLocal(tratamiento.Fecha_fin)}</td>

                      {esAdministrador && (
                        <td>
                          {tratamiento.Idprof
                            ? obtenerNombreProfesional(tratamiento.Idprof)
                            : "Sin asignar"}
                        </td>
                      )}
                      <td>
                        <span
                          className={`badge ${
                            esDiscapacitado
                              ? "badge-discapacidad"
                              : "badge-nodiscapacidad"
                          }`}
                        >
                          {esDiscapacitado ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="acciones">
                        <button
                          className="btn-detalles"
                          title="Ver detalles del tratamiento"
                          onClick={() =>
                            mostrarDetallesTratamiento(tratamiento)
                          }
                        >
                          <FaEye />
                        </button>

                        <button
                          onClick={() =>
                            generarHistorialCompleto(paciente?.Idpac)
                          }
                          title="Generar historial completo"
                          className="btn-action"
                        >
                          <FaFileMedical />
                        </button>

                        <button
                          className="btn-action btn-editar"
                          title="Editar tratamiento"
                          onClick={() => abrirModalTratamiento(tratamiento)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-action btn-sesion"
                          title="Realizar una sesión"
                          onClick={() => redirigirSesion(paciente?.Idpac)}
                        >
                          <FaPlusCircle />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={esAdministrador ? 8 : 7} className="no-results">
                    <div className="no-results-content">
                      <FaExclamationTriangle />
                      <p>No se encontraron tratamientos</p>
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

      {/* Modal de detalles del tratamiento */}
      {mostrarModal && tratamientoSeleccionado && (
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
                    {tratamientoSeleccionado.paciente?.Nombre_pac}{" "}
                    {tratamientoSeleccionado.paciente?.Appaterno_pac}{" "}
                    {tratamientoSeleccionado.paciente?.Apmaterno_pac}
                  </p>
                  <p>
                    <strong>CI:</strong>{" "}
                    {tratamientoSeleccionado.paciente?.Ci_pac ||
                      "No especificado"}
                  </p>
                  <p>
                    <strong>Edad:</strong>{" "}
                    {
                      calcularEdadCompleta(
                        tratamientoSeleccionado.paciente?.Fnaci_pac
                      ).texto
                    }
                  </p>
                </div>

                <div className="detalle-col">
                  <h3>Información de Contacto</h3>
                  <p>
                    <strong>Teléfono:</strong>{" "}
                    {tratamientoSeleccionado.paciente?.Telefono_pac ||
                      "No especificado"}
                  </p>
                  <p>
                    <strong>Dirección:</strong>{" "}
                    {tratamientoSeleccionado.paciente?.Direccion_pac ||
                      "No especificado"}
                  </p>
                </div>
              </div>

              {/* Sección del TRATAMIENTO */}
              <div className="detalle-row">
                <div className="detalle-col-full">
                  <h3>Detalles del Tratamiento</h3>
                  <div className="tratamiento-item">
                    <p>
                      <strong>Nombre:</strong>{" "}
                      {tratamientoSeleccionado.nombre || "No especificado"}
                    </p>
                    <p>
                      <strong>Profesional:</strong>{" "}
                      {obtenerNombreProfesional(tratamientoSeleccionado.Idprof)}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      {tratamientoSeleccionado.Estado || "No especificado"}
                    </p>
                    <p>
                      <strong>Fecha de inicio:</strong>{" "}
                      {new Date(
                        tratamientoSeleccionado.Fecha_ini
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Fecha de fin:</strong>{" "}
                      {tratamientoSeleccionado.Fecha_fin
                        ? new Date(
                            tratamientoSeleccionado.Fecha_fin
                          ).toLocaleDateString()
                        : "En curso"}
                    </p>
                    <p>
                      <strong>Diagnóstico:</strong>{" "}
                      {tratamientoSeleccionado.diagnostico || "No especificado"}
                    </p>
                    <p>
                      <strong>Observaciones:</strong>{" "}
                      {tratamientoSeleccionado.Obs || "No especificado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección de discapacidad */}
              <div className="detalle-row">
                <div className="detalle-col">
                  <h3>Información de Discapacidad</h3>
                  <p>
                    <strong>Discapacidad:</strong>
                    <span
                      className={`badge ${
                        tieneDiscapacidad(tratamientoSeleccionado.paciente)
                          ? "badge-discapacidad"
                          : "badge-nodiscapacidad"
                      }`}
                    >
                      {tieneDiscapacidad(tratamientoSeleccionado.paciente)
                        ? "Sí"
                        : "No"}
                    </span>
                  </p>
                </div>
              </div>
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
                {!form.Idtrat ? (
                  // Para nuevos tratamientos: selector de pacientes
                  <div className="form-group">
                    <label>Paciente: *</label>
                    <select
                      name="Idpac"
                      value={form.Idpac}
                      onChange={handleChange}
                      className="form-control"
                      required
                    >
                      <option value="">Seleccione un paciente</option>
                      {pacientes.map((pac) => (
                        <option key={pac.Idpac} value={pac.Idpac}>
                          {pac.Nombre_pac} {pac.Appaterno_pac}{" "}
                          {pac.Apmaterno_pac} - {pac.Ci_pac}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  // Para editar: mostrar nombre del paciente (no editable)
                  <div className="form-group">
                    <label>Paciente:</label>
                    <input
                      type="text"
                      value={obtenerNombrePaciente(form.Idpac)}
                      readOnly
                      className="readonly-input"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Nombre del tratamiento: *</label>
                  <textarea
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    rows="2"
                    className="form-control"
                    placeholder="Ingrese un nombre para el tratamiento"
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
                    disabled={form.Estado === "En tratamiento"} 
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
