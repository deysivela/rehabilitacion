import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaPlus, FaEye, FaCalendarAlt, FaSearch, FaTimes } from "react-icons/fa";
import "./Tratamiento.css";

const Tratamiento = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({
    Idtrat: null,
    nombre: "",
    Fecha_ini: new Date().toISOString().split("T")[0],
    Fecha_fin: "",
    Idpac: "",
    Idprof: "",
    Estado: "En tratamiento",
    Obs: "",
    Razon: "",
    diagnostico: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [profesionales, setProfesionales] = useState([]);
  const [filtroProfesional, setFiltroProfesional] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const idprof = usuario?.idprof;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pacienteId = params.get("pacienteId");
    const abrir = params.get("abrirModal");
    if (pacienteId && abrir === "true") {
      if (pacientes.length > 0) {
        const pacienteExiste = pacientes.some(
          (p) => String(p.Idpac) === String(pacienteId)
        );
        if (pacienteExiste) {
          setForm((prev) => ({
            ...prev,
            Idpac: pacienteId,
            Fecha_ini: new Date().toISOString().split("T")[0],
            Idprof: idprof,
          }));
          setModalOpen(true);
        } else {
          setError(`No se encontró el paciente con ID ${pacienteId}`);
        }
      }
    }
  }, [location.search, pacientes, idprof]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError(null);
        const [tratsRes, pacsRes, profesionalesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/tratamiento/listar"),
          axios.get("http://localhost:5000/api/paciente/listar"),
          axios.get("http://localhost:5000/api/prof_salud/listar"),
        ]);

        setTratamientos(
          tratsRes.data.sort(
            (a, b) => new Date(b.Fecha_ini) - new Date(a.Fecha_ini)
          )
        );
        setPacientes(pacsRes.data);
        setProfesionales(profesionalesRes.data);
        setCargando(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setError("Error al cargar los datos. Por favor, intente nuevamente.");
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const abrirModal = (tratamiento = null) => {
    if (tratamiento) {
      setForm({
        ...tratamiento,
        Idprof: tratamiento.Idprof || idprof || "",
        diagnostico: tratamiento.diagnostico || "",
      });
    } else {
      setForm({
        Idtrat: null,
        nombre: "",
        Fecha_ini: new Date().toISOString().split("T")[0],
        Fecha_fin: "",
        Idpac: "",
        Idprof: idprof,
        Estado: "En tratamiento",
        Obs: "",
        Razon: "",
        diagnostico: "",
      });
    }
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    navigate("/tratamientos", { replace: true });
    cargarTratamientos();
  };

  const abrirModalDetalle = (tratamiento) => {
    setTratamientoSeleccionado(tratamiento);
    setDetalleModalOpen(true);
  };

  const cargarTratamientos = async () => {
    const res = await axios.get("http://localhost:5000/api/tratamiento/listar");
    setTratamientos(res.data.sort((a, b) => new Date(b.Fecha_ini) - new Date(a.Fecha_ini)));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "Estado") {
      let nuevaFechaFin = form.Fecha_fin;

      if (value === "Alta temporal" || value === "Alta definitiva" || value === "Abandono") {
        nuevaFechaFin = new Date().toISOString().split("T")[0];
      } else {
        nuevaFechaFin = "";
      }

      setForm((prev) => ({
        ...prev,
        [name]: value,
        Fecha_fin: nuevaFechaFin,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        Fecha_fin: form.Fecha_fin || null,
        Idpac: form.Idpac || null,
        diagnostico: form.diagnostico || null,
      };

      if (form.Idtrat) {
        await axios.put(`http://localhost:5000/api/tratamiento/${form.Idtrat}`, payload);
      } else {
        await axios.post("http://localhost:5000/api/tratamiento/crear", payload);
      }
      cerrarModal();
    } catch (error) {
      console.error("Error guardando tratamiento:", error);
      setError("Error al guardar el tratamiento");
    }
  };

  const obtenerNombrePaciente = (id) => {
    if (!id) return "Sin paciente asignado";
    const paciente = pacientes.find((p) => String(p.Idpac) === String(id));
    return paciente ? `${paciente.Nombre_pac} ${paciente.Appaterno_pac} ${paciente.Apmaterno_pac}` : "Paciente no encontrado";
  };

  const obtenerCIPaciente = (id) => {
    if (!id) return "";
    const paciente = pacientes.find((p) => String(p.Idpac) === String(id));
    return paciente ? paciente.Ci_pac : "";
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  const obtenerNombreProfesional = (id) => {
    const prof = profesionales.find((p) => p.Idprof === id);
    if (!prof) return "—";
    const { Nombre_prof, Appaterno_prof, Apmaterno_prof } = prof;
    return `${Nombre_prof} ${Appaterno_prof}${Apmaterno_prof ? " " + Apmaterno_prof : ""}`;
  };

  const filtrarTratamientos = () => {
    const busquedaLower = filtroBusqueda.toLowerCase();

    return tratamientos
      .filter((t) => {
        const cumpleEstado = filtroEstado ? t.Estado === filtroEstado : true;
        const cumpleProfesional = filtroProfesional ? String(t.Idprof) === String(filtroProfesional) : true;

        let cumpleBusqueda = true;
        if (filtroBusqueda) {
          const paciente = pacientes.find((p) => String(p.Idpac) === String(t.Idpac));
          if (paciente) {
            const nombreCompleto = `${paciente.Nombre_pac} ${paciente.Appaterno_pac} ${paciente.Apmaterno_pac}`.toLowerCase();
            const ci = paciente.Ci_pac.toLowerCase();
            cumpleBusqueda = nombreCompleto.includes(busquedaLower) || ci.includes(busquedaLower);
          } else {
            cumpleBusqueda = false;
          }
        }

        return cumpleEstado && cumpleBusqueda && cumpleProfesional;
      })
      .sort((a, b) => new Date(b.Fecha_ini) - new Date(a.Fecha_ini));
  };

  const tratamientosFiltrados = filtrarTratamientos();

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "En tratamiento": return "en-tratamiento";
      case "Alta temporal": return "alta-temporal";
      case "Alta definitiva": return "alta-definitiva";
      case "Abandono": return "abandono";
      default: return "";
    }
  };

  return (
    <div className="tratamiento-container">
      {error && (
        <div className="alert alert-danger">
          {error}
          <button
            type="button"
            className="close"
            onClick={() => setError(null)}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      <div className="header-tratamiento">
        <h2>
          <FaCalendarAlt /> Gestión de Tratamientos
        </h2>
        <button className="btn-nuevo" onClick={() => abrirModal()}>
          <FaPlus /> Nuevo Tratamiento
        </button>
      </div>

      <div className="controles-superiores">
        <div className="filtros">
          <div className="filtro-group">
            <FaSearch className="icono-busqueda" />
            <input
              type="text"
              placeholder="Buscar por nombre o CI..."
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="input-busqueda"
            />
          </div>

          <div className="filtro-group">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="select-estado"
            >
              <option value="">Todos los estados</option>
              <option value="En tratamiento">En tratamiento</option>
              <option value="Alta temporal">Alta temporal</option>
              <option value="Alta definitiva">Alta definitiva</option>
              <option value="Abandono">Abandono</option>
            </select>
          </div>

          <div className="filtro-group">
            <select
              value={filtroProfesional}
              onChange={(e) => setFiltroProfesional(e.target.value)}
              className="select-estado"
            >
              <option value="">Todos los profesionales</option>
              {profesionales.map((prof) => (
                <option key={prof.Idprof} value={prof.Idprof}>
                  {prof.Nombre_prof} {prof.Appaterno_prof} {prof.Apmaterno_prof}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="cargando">Cargando tratamientos...</div>
      ) : (
        <div className="tabla-container">
          {tratamientosFiltrados.length > 0 ? (
            <table className="tabla-tratamientos">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Profesional</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tratamientosFiltrados.map((t) => (
                  <tr key={t.Idtrat}>
                    <td>{obtenerNombrePaciente(t.Idpac)}</td>
                    <td>{obtenerNombreProfesional(t.Idprof)}</td>
                    <td>{formatearFecha(t.Fecha_ini)}</td>
                    <td>{formatearFecha(t.Fecha_fin)}</td>
                    <td>
                      <span
                        className={`estado-badge ${getEstadoClass(t.Estado)}`}
                      >
                        {t.Estado}
                      </span>
                    </td>
                    <td>{t.Obs || "-"}</td>
                    <td className="acciones">
                      <button
                        className="btn-detalle"
                        onClick={() => abrirModalDetalle(t)}
                        title="Ver detalles"
                      >
                        <FaEye />
                      </button>

                      <button
                        className="btn-editar"
                        onClick={() => abrirModal(t)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="sin-resultados">
              No se encontraron tratamientos{" "}
              {filtroBusqueda || filtroEstado || filtroProfesional
                ? "con los filtros aplicados"
                : ""}
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="modal">
          <div className="modal-contenido">
            <span className="cerrar-modal" onClick={cerrarModal}>
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
                  >
                    <option value="">Seleccione un paciente</option>
                    {pacientes.map((p) => (
                      <option
                        key={p.Idpac}
                        value={p.Idpac}
                        selected={String(p.Idpac) === String(form.Idpac)}
                      >
                        {p.Nombre_pac} {p.Appaterno_pac} {p.Apmaterno_pac} - CI:{" "}
                        {p.Ci_pac}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Descripcion:</label>
                  <textarea
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    rows="2"
                    className="form-control"
                    placeholder="Ingrese descripcion del tratamiento (nombre para identificar)"
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
                    placeholder="Ingrese el diagnóstico del paciente (opcional)"
                  />
                </div>

                <div className="form-group">
                  <label>Profesional:</label>
                  <input
                    type="text"
                    value={obtenerNombreProfesional(form.Idprof) || "Profesional no encontrado"}
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
                    onClick={cerrarModal}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {detalleModalOpen && tratamientoSeleccionado && (
        <div className="modal">
          <div className="modal-contenido modal-detalles">
            <button
              className="cerrar-modal"
              onClick={() => setDetalleModalOpen(false)}
            >
              <FaTimes />
            </button>
            <div className="detalles-grid">
              <div className="seccion-detalle">
                <h4 className="seccion-titulo">Información del Paciente</h4>
                <div className="detalle-fila">
                  <span className="detalle-etiqueta">Paciente:</span>
                  <span className="detalle-valor">
                    {obtenerNombrePaciente(
                      tratamientoSeleccionado.Idpac
                    )}
                  </span>
                </div>
                <div className="detalle-fila">
                  <span className="detalle-etiqueta">Profesional:</span>
                  <span className="detalle-valor">
                    {obtenerNombreProfesional(tratamientoSeleccionado.Idprof)}
                  </span>
                </div>
                <div className="detalle-fila">
                  <span className="detalle-etiqueta">CI:</span>
                  <span className="detalle-valor">
                    {obtenerCIPaciente(tratamientoSeleccionado.Idpac)}
                  </span>
                </div>
              </div>

              <div className="seccion-detalle">
                <h4 className="seccion-titulo">Detalles del Tratamiento</h4>
                <div className="detalle-fila">
                  <span className="detalle-etiqueta">Descripción Tratamiento:</span>
                  <span className="detalle-valor">
                    {tratamientoSeleccionado.nombre}
                  </span>
                </div>
                
                <div className="detalle-fila">
                  <span className="detalle-etiqueta">Fecha Inicio:</span>
                  <span className="detalle-valor">
                    {formatearFecha(tratamientoSeleccionado.Fecha_ini)}
                  </span>
                </div>
                <div className="detalle-fila">
                  <span className="detalle-etiqueta">Fecha Fin:</span>
                  <span className="detalle-valor">
                    {formatearFecha(tratamientoSeleccionado.Fecha_fin) || "-"}
                  </span>
                </div>
                <div className="detalle-fila">
                  <span className="detalle-etiqueta">Estado:</span>
                  <span
                    className={`estado-badge ${getEstadoClass(
                      tratamientoSeleccionado.Estado
                    )}`}
                  >
                    {tratamientoSeleccionado.Estado}
                  </span>
                  {tratamientoSeleccionado.Estado === "Abandono" && (
                    <p>
                      <strong>Razón del abandono:</strong>{" "}
                      {tratamientoSeleccionado.Razon || "No especificada"}
                    </p>
                  )}
                </div>
              </div>

              <div className="seccion-detalle seccion-completa">
                <h4 className="seccion-titulo">Diagnóstico</h4>
                <div className="detalle-texto">
                  {tratamientoSeleccionado.diagnostico ||
                    "No hay diagnóstico registrado"}
                </div>
              </div>

              <div className="seccion-detalle seccion-completa">
                <h4 className="seccion-titulo">Observaciones</h4>
                <div className="detalle-texto">
                  {tratamientoSeleccionado.Obs ||
                    "No hay observaciones registradas"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tratamiento;