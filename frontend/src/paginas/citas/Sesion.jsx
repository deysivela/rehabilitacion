import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";
import "./Sesion.css";

const Sesion = () => {
  const location = useLocation();
  const [sesiones, setSesiones] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [tratamientosFiltrados, setTratamientosFiltrados] = useState([]);
  const [citas, setCitas] = useState([]);
  const [tecnicas, setTecnicas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idSesionEditar, setIdSesionEditar] = useState(null);
  const [areas, setAreas] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [tecnicasFiltradas, setTecnicasFiltradas] = useState([]);
  const [citaSeleccionadaInfo, setCitaSeleccionadaInfo] = useState(null);

  const idCitaDesdeCalendario = location.state?.Idcita;

  const [formulario, setFormulario] = useState({
    Idcita: "",
    Hora_ini: "",
    Hora_fin: "",
    Tipo: "Nuevo",
    Atencion: "Dentro de la institución",
    Notas: "",
    Novedades: "",
    Idtrat: "",
    Idtec: [],
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [resSesiones, resTratamientos, resCitas, resTecnicas] =
          await Promise.all([
            axios.get(
              "http://localhost:5000/api/sesion/listar?include=tecnicas"
            ),
            axios.get("http://localhost:5000/api/tratamiento/listar"),
            axios.get(
              "http://localhost:5000/api/cita/listar?estado=Confirmada&include=paciente,profesional"
            ),
            axios.get("http://localhost:5000/api/tecnica/listar"),
          ]);

        setSesiones(
          Array.isArray(resSesiones.data.data) ? resSesiones.data.data : []
        );
        setTratamientos(resTratamientos.data);
        setCitas(resCitas.data);
        setTecnicas(resTecnicas.data);
      } catch (err) {
        setError(err.response?.data?.mensaje || "Error al cargar datos");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

useEffect(() => {
  /* cuando viene directo de cita */
  if (formulario.Idcita) {
    const citaSeleccionada = citas.find(
      (cita) => cita.Idcita === parseInt(formulario.Idcita)
    );
    if (citaSeleccionada) {
      setCitaSeleccionadaInfo(citaSeleccionada);
      const tratamientosDelPaciente = tratamientos.filter(
        (trat) => trat.Idpac === citaSeleccionada.Idpac
      );
      setTratamientosFiltrados(tratamientosDelPaciente);
    } else {
      setTratamientosFiltrados([]);
      setCitaSeleccionadaInfo(null);
    }
  }
}, [formulario.Idcita, citas, tratamientos]);

  useEffect(() => {
    if (idCitaDesdeCalendario) {
      setFormulario((prev) => ({ ...prev, Idcita: idCitaDesdeCalendario }));
      setMostrarModal(true);
    }
  }, [idCitaDesdeCalendario]);
  

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/area/listar")
      .then((res) => setAreas(res.data))
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:5000/api/tecnica/listar")
      .then((res) => setTecnicas(res.data))
      .catch((err) => console.error(err));
  }, []);
  useEffect(() => {
    if (areaSeleccionada) {
      const filtradas = tecnicas.filter(
        (tec) => tec.Idarea === parseInt(areaSeleccionada)
      );
      setTecnicasFiltradas(filtradas);
    } else {
      setTecnicasFiltradas([]);
    }
  }, [areaSeleccionada, tecnicas]);

  const handleCitaChange = (e) => {
    const citaId = e.target.value;
    setFormulario((prev) => ({ ...prev, Idcita: citaId }));

    const cita = citas.find((c) => c.Idcita === parseInt(citaId));
    setCitaSeleccionadaInfo(cita); 

    if (cita) {
      const tratamientosDelPaciente = tratamientos.filter(
        (trat) => trat.Idpac === cita.Idpac
      );
      setTratamientosFiltrados(tratamientosDelPaciente);
    } else {
      setTratamientosFiltrados([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const handleTecnicasChange = (e) => {
    const { value, checked } = e.target;
    setFormulario((prev) => {
      if (checked) {
        return { ...prev, Idtec: [...prev.Idtec, parseInt(value)] };
      } else {
        return {
          ...prev,
          Idtec: prev.Idtec.filter((id) => id !== parseInt(value)),
        };
      }
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setCargando(true);

      if (formulario.Idtec.length === 0) {
        throw new Error("Debe seleccionar al menos una técnica.");
      }

      if (formulario.Hora_ini >= formulario.Hora_fin) {
        throw new Error(
          "La hora de fin debe ser posterior a la hora de inicio"
        );
      }

      // Preparar datos para enviar (incluyendo Idtec en el mismo objeto)
      const datosParaEnviar = {
        ...formulario,
        Idtec: formulario.Idtec, 
      };

      if (modoEdicion) {
        // Editar sesión
        await axios.put(
          `http://localhost:5000/api/sesion/editar/${idSesionEditar}`,
          datosParaEnviar
        );

        // Actualizar técnicas
        await axios.post(
          `http://localhost:5000/api/sesion/editar/${idSesionEditar}/tecnicas`,
          {
            Idtec: formulario.Idtec, 
          }
        );
      } else {
        // Crear nueva sesión - Envía todo en un solo objeto
        await axios.post(
          "http://localhost:5000/api/sesion/crear",
          datosParaEnviar
        );

        // Actualizar estado de la cita
        await axios.put(
          `http://localhost:5000/api/cita/editar/${formulario.Idcita}`,
          { estado_cita: "Finalizada" }
        );
      }

      // Recargar datos
      const [resSesiones, resCitas] = await Promise.all([
        axios.get("http://localhost:5000/api/sesion/listar?include=tecnicas"),
        axios.get("http://localhost:5000/api/cita/listar?estado=Confirmada"),
      ]);

      setSesiones(
        Array.isArray(resSesiones.data.data) ? resSesiones.data.data : []
      );
      setCitas(resCitas.data);

      resetFormulario();
      setMostrarModal(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.mensaje || err.message);
    } finally {
      setCargando(false);
      setModoEdicion(false);
      setIdSesionEditar(null);
    }
  };

  const resetFormulario = () => {
    setFormulario({
      Idcita: "",
      Hora_ini: "",
      Hora_fin: "",
      Tipo: "Nuevo",
      Atencion: "Dentro de la institución",
      Notas: "",
      Novedades: "",
      Idtrat: "",
      Idtec: [],
    });
  };

  const eliminarSesion = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta sesión?")) return;
    try {
      setCargando(true);
      await axios.delete(`http://localhost:5000/api/sesion/eliminar/${id}`);
      setSesiones((prev) => prev.filter((s) => s.Idsesion !== id));
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al eliminar sesión");
    } finally {
      setCargando(false);
    }
  };

  const editarSesion = (sesion) => {
    setModoEdicion(true);
    setIdSesionEditar(sesion.Idsesion);
    setFormulario({
      Idcita: sesion.Idcita,
      Hora_ini: sesion.Hora_ini,
      Hora_fin: sesion.Hora_fin,
      Tipo: sesion.Tipo,
      Atencion: sesion.Atencion || "",
      Notas: sesion.Notas || "",
      Novedades: sesion.Novedades || "",
      Idtrat: sesion.Idtrat,
      Idtec: sesion.tecnicas ? sesion.tecnicas.map((t) => t.Idtec) : [],
    });
    const cita = citas.find((c) => c.Idcita === sesion.Idcita);
  setCitaSeleccionadaInfo(cita);
    setMostrarModal(true);
  };

  const formatearHora = (hora) => {
    if (!hora) return "";
    const [h, m] = hora.split(":");
    return `${h}:${m}`;
  };

  const obtenerNombrePaciente = (sesion) => {
    const p = sesion.tratamiento?.paciente;
    return p
      ? `${p.Nombre_pac} ${p.Appaterno_pac} ${p.Apmaterno_pac}`.trim()
      : "Sin paciente";
  };
  const obtenerCIpaciente = (sesion) => sesion.tratamiento?.paciente?.CI || "";

  const obtenerNombreProfesional = (sesion) => {
    const prof = sesion.cita?.profesional;
    return prof
      ? prof.nombreCompleto ||
          `${prof.Nombre_prof} ${prof.Appaterno_prof} ${prof.Apmaterno_prof}`
      : "Sin profesional";
  };

  const obtenerNombreCompletoPaciente = (cita) => {
    const p = cita.paciente;
    return p
      ? p.nombreCompleto ||
          `${p.Nombre_pac ?? ""} ${p.Appaterno_pac ?? ""} ${
            p.Apmaterno_pac ?? ""
          }`.trim()
      : "Sin paciente";
  };

  const obtenerNombreCompletoProfesional = (cita) => {
    const prof = cita.profesional;
    return prof
      ? prof.nombreCompleto ||
          `${prof.Nombre_prof} ${prof.Appaterno_prof} ${prof.Apmaterno_prof}`
      : "Sin profesional";
  };

  const obtenerObservacionTratamiento = (sesion) => {
    if (!sesion?.Idtrat) return "Sin tratamiento asociado";
    const tratamiento = tratamientos.find((t) => t.Idtrat === sesion.Idtrat);
    return tratamiento?.Obs || "Tratamiento sin observación";
  };

  const obtenerNombresTecnicas = (sesion) => {
    if (!sesion || !sesion.tecnicas || sesion.tecnicas.length === 0) {
      return "No asignadas";
    }

    return sesion.tecnicas.map((t) => t.Descripcion).join(", ");
  };

  const verDetalleSesion = (sesion) => {
    setSesionSeleccionada(sesion);
    setMostrarModalDetalle(true);
  };

  const sesionesFiltradas = sesiones
    .filter((sesion) => {
      const nombreCompleto = obtenerNombrePaciente(sesion).toLowerCase();
      const ci = obtenerCIpaciente(sesion).toLowerCase();
      const filtroLower = filtro.toLowerCase();
      const coincideTexto =
        nombreCompleto.includes(filtroLower) || ci.includes(filtroLower);

      const fechaSesion = new Date(sesion.cita?.fecha_cita);
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;

      const coincideFecha =
        (!desde || fechaSesion >= desde) && (!hasta || fechaSesion <= hasta);

      return coincideTexto && coincideFecha;
    })
    .sort((a, b) => {
      const fechaA = new Date(a.cita?.fecha_cita);
      const fechaB = new Date(b.cita?.fecha_cita);
      return fechaB - fechaA;
    });

  return (
    <div className="sesion-container">
      {error && <div className="error-message">{error}</div>}
      <div className="header-container">
        <h1>Gestión de Sesiones Médicas</h1>
        <button
          className="btn-registrar"
          onClick={() => {
            setModoEdicion(false);
            resetFormulario();
            setMostrarModal(true);
          }}
        >
          <FaPlus /> Nueva Sesión
        </button>
      </div>
      {/* modal para registrar sesion y tambien editar */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modoEdicion ? "Editar Sesión" : "Registrar Nueva Sesión"}</h2>
            <form onSubmit={handleSubmit}>
              {citaSeleccionadaInfo && (
                <div className="info-cita-container">
                  <div className="info-row">
                    <span className="info-label">Paciente:</span>
                    <span className="info-value">
                      {obtenerNombreCompletoPaciente(citaSeleccionadaInfo)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Profesional:</span>
                    <span className="info-value">
                      {obtenerNombreCompletoProfesional(citaSeleccionadaInfo)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Motivo:</span>
                    <span className="info-value">
                      {citaSeleccionadaInfo.motivo_cita || "No especificado"}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Cita:</label>
                  <select
                    name="Idcita"
                    value={formulario.Idcita}
                    onChange={handleCitaChange}
                    required
                    disabled={modoEdicion}
                  >
                    <option value="">Seleccione una cita...</option>
                    {citas.map((cita) => (
                      <option key={cita.Idcita} value={cita.Idcita}>
                        {new Date(cita.fecha_cita).toLocaleDateString()}{" "}
                        {formatearHora(cita.hora_cita)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tratamiento:</label>
                  <select
                    name="Idtrat"
                    value={formulario.Idtrat}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione un tratamiento...</option>
                    {tratamientosFiltrados.length > 0 ? (
                      tratamientosFiltrados.map((trat) => (
                        <option key={trat.Idtrat} value={trat.Idtrat}>
                          {trat.Obs}
                        </option>
                      ))
                    ) : (
                      <option value="">No hay tratamientos disponibles.</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hora Inicio:</label>
                  <input
                    type="time"
                    name="Hora_ini"
                    value={formulario.Hora_ini}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora Fin:</label>
                  <input
                    type="time"
                    name="Hora_fin"
                    value={formulario.Hora_fin}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tipo:</label>
                  <select
                    name="Tipo"
                    value={formulario.Tipo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Repetido">Repetido</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="area">Tecnicas por Área:</label>
                <select
                  id="area"
                  className="form-control"
                  value={areaSeleccionada}
                  onChange={(e) => setAreaSeleccionada(e.target.value)}
                >
                  <option value="">-- Selecciona un área --</option>
                  {areas.map((area) => (
                    <option key={area.Idarea} value={area.Idarea}>
                      {area.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Técnicas:</label>
                <div className="tecnicas-container">
                  {tecnicasFiltradas.map((tec) => (
                    <div key={tec.Idtec} className="tecnica-checkbox">
                      <input
                        type="checkbox"
                        id={`tecnica-${tec.Idtec}`}
                        value={tec.Idtec}
                        checked={formulario.Idtec.includes(tec.Idtec)}
                        onChange={handleTecnicasChange}
                      />
                      <label htmlFor={`tecnica-${tec.Idtec}`}>
                        {tec.Descripcion}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Atención:</label>
                <select
                  name="Atencion"
                  value={formulario.Atencion}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="Dentro de la institución">
                    Dentro de la institución
                  </option>
                  <option value="Fuera de la institución">
                    Fuera de la institución (atención domiciliaria y/o
                    comunitaria)
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Notas:</label>
                <textarea
                  name="Notas"
                  value={formulario.Notas}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Novedades:</label>
                <textarea
                  name="Novedades"
                  value={formulario.Novedades}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={cargando}
                >
                  {cargando
                    ? "Guardando..."
                    : modoEdicion
                    ? "Actualizar Sesión"
                    : "Guardar Sesión"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setMostrarModal(false);
                    setModoEdicion(false);
                    resetFormulario();
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalDetalle && sesionSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Detalle de Sesión</h2>
            <div className="detalle-sesion">
              <div className="detalle-row">
                <span className="detalle-label">Paciente:</span>
                <span className="detalle-value">
                  {obtenerNombrePaciente(sesionSeleccionada)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Fecha Sesión: </span>
                <span className="detalle-value">
                  {new Date(
                    sesionSeleccionada.cita?.fecha_cita
                  ).toLocaleDateString()}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Hora Sesión: </span>
                <span className="detalle-value">
                  {formatearHora(sesionSeleccionada.Hora_ini)} -{" "}
                  {formatearHora(sesionSeleccionada.Hora_fin)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Profesional:</span>
                <span className="detalle-value">
                  {obtenerNombreProfesional(sesionSeleccionada)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Tratamiento:</span>
                <span className="detalle-value">
                  {obtenerObservacionTratamiento(sesionSeleccionada)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Técnicas Aplicadas:</span>
                <span className="detalle-value">
                  {obtenerNombresTecnicas(sesionSeleccionada)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Estado:</span>
                <span className="detalle-value">{sesionSeleccionada.Tipo}</span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Atención:</span>
                <span className="detalle-value">
                  {sesionSeleccionada.Atencion || "No especificado"}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Notas:</span>
                <span className="detalle-value">
                  {sesionSeleccionada.Notas || "No hay notas"}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Novedades:</span>
                <span className="detalle-value">
                  {sesionSeleccionada.Novedades || "No hay novedades"}
                </span>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setMostrarModalDetalle(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sesion-list">
        <div className="filtros">
          <div className="filtro-group">
            <label>Buscar :</label>
            <input
              type="text"
              placeholder="Nombre paciente o Ci..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <div className="filtro-group">
            <label>Desde:</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>
          <div className="filtro-group">
            <label>Hasta:</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </div>

        {cargando ? (
          <p>Cargando sesiones...</p>
        ) : (
          <div className="sessions-table">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Técnicas</th>
                  <th>Estado</th>
                  <th>Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sesionesFiltradas.map((sesion) => (
                  <tr key={sesion.Idsesion}>
                    <td>{obtenerNombrePaciente(sesion)}</td>
                    <td>
                      {new Date(sesion.cita?.fecha_cita).toLocaleDateString()}
                    </td>
                    <td>
                      {formatearHora(sesion.Hora_ini)} -{" "}
                      {formatearHora(sesion.Hora_fin)}
                    </td>
                    <td>{obtenerNombresTecnicas(sesion)}</td>
                    <td>{sesion.Tipo}</td>
                    <td>{sesion.Notas}</td>

                    <td className="action-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          title="Ver detalles"
                          onClick={() => verDetalleSesion(sesion)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="action-btn edit"
                          title="Editar sesión"
                          onClick={() => editarSesion(sesion)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Eliminar sesión"
                          onClick={() => eliminarSesion(sesion.Idsesion)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sesion;
