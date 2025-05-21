import React, { useState, useEffect} from "react";
import axios from "axios";
import {
  FaEdit,
  FaPlus,
  FaEye,
  FaCalendarAlt,
  FaSearch,
  FaTimes,
  FaCalendarTimes,
} from "react-icons/fa";
import "./Tratamiento.css";

const Tratamiento = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({
    Idtrat: null,
    Fecha_ini: "",
    Fecha_fin: "",
    Idpac: "",
    Estado: "En tratamiento",
    Obs: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cargandoSesiones, setCargandoSesiones] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      const [tratsRes, pacsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/tratamiento/listar"),
        axios.get("http://localhost:5000/api/paciente/listar"),
      ]);

      const tratamientosOrdenados = tratsRes.data.sort(
        (a, b) => new Date(b.Fecha_ini) - new Date(a.Fecha_ini)
      );

      setTratamientos(tratamientosOrdenados);
      setPacientes(pacsRes.data);
      setCargando(false);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setError("Error al cargar los datos. Por favor, intente nuevamente.");
      setCargando(false);
    }
  };

  const abrirModal = (tratamiento = null) => {
    if (tratamiento) {
      setForm({
        Idtrat: tratamiento.Idtrat,
        Fecha_ini: tratamiento.Fecha_ini.split("T")[0],
        Fecha_fin: tratamiento.Fecha_fin
          ? tratamiento.Fecha_fin.split("T")[0]
          : "",
        Idpac: tratamiento.Idpac || "",
        Estado: tratamiento.Estado || "En tratamiento",
        Obs: tratamiento.Obs || "",
      });
    } else {
      setForm({
        Idtrat: null,
        Fecha_ini: new Date().toISOString().split("T")[0],
        Fecha_fin: "",
        Idpac: "",
        Estado: "En tratamiento",
        Obs: "",
      });
    }
    setModalOpen(true);
  };

  const abrirModalDetalle = async (tratamiento) => {
    try {
      setCargandoSesiones(true);
      setError(null);

      console.log(
        `Buscando sesiones para tratamiento ID: ${tratamiento.Idtrat}`
      );
      const response = await axios.get(
        `http://localhost:5000/api/sesion/por-tratamiento/${tratamiento.Idtrat}`
      );

      console.log("Respuesta de sesiones:", response.data);

      if (response.data.success) {
        setTratamientoSeleccionado({
          ...tratamiento,
          sesiones: response.data.data || [],
        });
      } else {
        throw new Error(
          response.data.message || "Formato de respuesta inesperado"
        );
      }

      setDetalleModalOpen(true);
    } catch (error) {
      console.error("Error al cargar sesiones:", {
        message: error.message,
        response: error.response?.data,
      });

      setError("Error al cargar las sesiones del tratamiento");
      setTratamientoSeleccionado({
        ...tratamiento,
        sesiones: [],
      });
      setDetalleModalOpen(true);
    } finally {
      setCargandoSesiones(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        Fecha_fin: form.Fecha_fin || null,
        Idpac: form.Idpac || null,
      };

      if (form.Idtrat) {
        await axios.put(
          `http://localhost:5000/api/tratamiento/${form.Idtrat}`,
          payload
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/tratamiento/crear",
          payload
        );
      }
      setModalOpen(false);
      cargarDatos();
    } catch (error) {
      console.error("Error guardando tratamiento:", error);
      setError("Error al guardar el tratamiento");
    }
  };

  const obtenerNombreCompletoPaciente = (id) => {
    if (!id) return "Sin paciente asignado";
    const paciente = pacientes.find((p) => String(p.Idpac) === String(id));
    return paciente
      ? `${paciente.Nombre_pac} ${paciente.Appaterno_pac} ${paciente.Apmaterno_pac}`
      : "Paciente no encontrado";
  };

  const obtenerCIPaciente = (id) => {
    if (!id) return "";
    const paciente = pacientes.find((p) => String(p.Idpac) === String(id));
    return paciente ? paciente.Ci_pac : "";
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return "";
    const [h, m] = hora.split(":");
    return `${h}:${m}`;
  };

  const filtrarTratamientos = () => {
    const busquedaLower = filtroBusqueda.toLowerCase();

    return tratamientos
      .filter((t) => {
        const cumpleEstado = filtroEstado ? t.Estado === filtroEstado : true;

        let cumpleBusqueda = true;
        if (filtroBusqueda) {
          const paciente = pacientes.find(
            (p) => String(p.Idpac) === String(t.Idpac)
          );
          if (paciente) {
            const nombreCompleto =
              `${paciente.Nombre_pac} ${paciente.Appaterno_pac} ${paciente.Apmaterno_pac}`.toLowerCase();
            const ci = paciente.Ci_pac.toLowerCase();
            cumpleBusqueda =
              nombreCompleto.includes(busquedaLower) ||
              ci.includes(busquedaLower);
          } else {
            cumpleBusqueda = false;
          }
        }

        return cumpleEstado && cumpleBusqueda;
      })
      .sort((a, b) => new Date(b.Fecha_ini) - new Date(a.Fecha_ini));
  };

  const tratamientosFiltrados = filtrarTratamientos();

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "En tratamiento":
        return "en-tratamiento";
      case "Alta temporal":
        return "alta-temporal";
      case "Alta definitiva":
        return "alta-definitiva";
      case "Abandono":
        return "abandono";
      default:
        return "";
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
                    <td>{obtenerNombreCompletoPaciente(t.Idpac)}</td>
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
                        disabled={cargandoSesiones}
                      >
                        {cargandoSesiones &&
                        t.Idtrat === tratamientoSeleccionado?.Idtrat ? (
                          "Cargando..."
                        ) : (
                          <>
                            <FaEye />
                          </>
                        )}
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
              {filtroBusqueda || filtroEstado
                ? "con los filtros aplicados"
                : ""}
            </div>
          )}
        </div>
      )}

{modalOpen && (
  <div className="modal">
    <div className="modal-contenido">
      <span className="cerrar-modal" onClick={() => setModalOpen(false)}>
        <FaTimes />
      </span>
      <h3>{form.Idtrat ? "Editar Tratamiento" : "Nuevo Tratamiento"}</h3>

      {/* Contenedor scrollable */}
      <div className="modal-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Paciente:</label>
            <select
              name="Idpac"
              value={form.Idpac}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Sin paciente asignado</option>
              {pacientes.map((p) => (
                <option key={p.Idpac} value={p.Idpac}>
                  {p.Nombre_pac} {p.Appaterno_pac} {p.Apmaterno_pac} - CI: {p.Ci_pac}
                </option>
              ))}
            </select>
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
              onClick={() => setModalOpen(false)}
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
          <div className="modal-contenido modal-detalle">
                <button
                className="cerrar-modal"
                onClick={() => setDetalleModalOpen(false)}
              >
                <FaTimes />
              </button>
            <div className="detalles-grid">
              {/* Sección 1: Información Básica */}
              <div className="seccion-detalle">
                <h4 className="seccion-titulo">Información del Paciente</h4>
                <div className="detalle-fila">
                  <span className="detalle-etiqueta">Paciente:</span>
                  <span className="detalle-valor">
                    {obtenerNombreCompletoPaciente(
                      tratamientoSeleccionado.Idpac
                    )}
                  </span>
                </div>
                <div className="detalle-fila">
                  <span className="detalle-etiqueta">CI:</span>
                  <span className="detalle-valor">
                    {obtenerCIPaciente(tratamientoSeleccionado.Idpac)}
                  </span>
                </div>
              </div>

              {/* Sección 2: Detalles del Tratamiento */}
              <div className="seccion-detalle">
                <h4 className="seccion-titulo">Detalles del Tratamiento</h4>
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
                </div>
              </div>

              {/* Sección 3: Observaciones */}
              <div className="seccion-detalle seccion-completa">
                <h4 className="seccion-titulo">Observaciones</h4>
                <div className="detalle-texto">
                  {tratamientoSeleccionado.Obs ||
                    "No hay observaciones registradas"}
                </div>
              </div>

              {/* Sección 4: Sesiones */}
              <div className="seccion-detalle seccion-completa">
                <div className="sesiones-header">
                  <h4 className="seccion-titulo">Sesiones realizadas ({tratamientoSeleccionado.sesiones?.length || 0})</h4>
                </div>

                {cargandoSesiones ? (
                  <div className="cargando-sesiones">
                    <div className="spinner"></div>
                    <span>Cargando sesiones...</span>
                  </div>
                ) : tratamientoSeleccionado.sesiones?.length > 0 ? (
                  <div className="tabla-sesiones-container">
                    <table className="tabla-sesiones">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Tipo</th>
                          <th>Profesional</th>
                          <th>Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tratamientoSeleccionado.sesiones.map(
                          (sesion, index) => (
                            <tr key={sesion.Idses || index}>
                              <td>{index + 1}</td>
                              <td>
                                {new Date(
                                  sesion.cita?.fecha_cita
                                ).toLocaleDateString()}
                              </td>
                              <td>{formatearHora(sesion.Hora_ini)}</td>
                              <td>{sesion.Tipo || "-"}</td>
                              <td>
                                {sesion.cita?.profesional
                                  ? `${sesion.cita.profesional.Nombre_prof} ${sesion.cita.profesional.Appaterno_prof}`
                                  : "No asignado"}
                              </td>
                              <td>{sesion.Notas || "-"}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="sin-sesiones">
                    <FaCalendarTimes />
                    <span>
                      No hay sesiones registradas para este tratamiento
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tratamiento;
