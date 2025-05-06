import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Sesion.css";

const Sesion = () => {
  const [sesiones, setSesiones] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [tecnicas, setTecnicas] = useState([]);
  const [tratamientosFiltrados, setTratamientosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    Idcita: "",
    Hora_ini: "",
    Hora_fin: "",
    Tipo: "Nuevo",
    Notas: "",
    Novedades: "",
    Idtrat: "",
    Idtec: "",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const response = await fetch("http://localhost:5000/api/sesion/listar");
        const sesionesData = await response.json();
        setSesiones(Array.isArray(sesionesData.data) ? sesionesData.data : []);
        const resTratamientos = await axios.get(
          "http://localhost:5000/api/tratamiento/listar"
        );
        setTratamientos(resTratamientos.data);
        const resCitas = await axios.get(
          "http://localhost:5000/api/cita/listar?estado=Confirmada"
        );
        setCitas(resCitas.data);

        const resTecnicas = await axios.get(
          "http://localhost:5000/api/tecnica/listar"
        );
        setTecnicas(resTecnicas.data);

        setError(null);
      } catch (err) {
        setError(err.response?.data?.mensaje || "Error cargando datos");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);
  console.log("Sesiones:", sesiones);

  const handleCitaChange = async (e) => {
    const citaSeleccionadaId = e.target.value;
    setFormulario((prev) => ({ ...prev, Idcita: citaSeleccionadaId }));
  
    // Buscar la cita seleccionada
    const citaSeleccionada = citas.find(
      (cita) => cita.Idcita === parseInt(citaSeleccionadaId)
    );
  
    if (citaSeleccionada) {
      const pacienteId = citaSeleccionada.Idpac;
  
      // Filtrar los tratamientos para ese paciente
      const tratamientosDelPaciente = tratamientos.filter(
        (trat) => trat.Idpac === pacienteId
      );
  
      // Actualizar el estado con los tratamientos filtrados
      setTratamientosFiltrados(tratamientosDelPaciente);
    } else {
      setTratamientosFiltrados([]);
    }
  };
  

  //--------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setCargando(true);
      if (formulario.Hora_ini >= formulario.Hora_fin) {
        throw new Error(
          "La hora de fin debe ser posterior a la hora de inicio"
        );
      }
      const res = await axios.post(
        "http://localhost:5000/api/sesion/crear",
        formulario
      );
      setSesiones((prev) => [...prev, res.data]);
      resetFormulario();
      setModalAbierto(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.mensaje || err.message);
    } finally {
      setCargando(false);
    }
  };

  const resetFormulario = () => {
    setFormulario({
      Idcita: "",
      Hora_ini: "",
      Hora_fin: "",
      Tipo: "Nuevo",
      Notas: "",
      Novedades: "",
      Idtrat: "",
      Idtec: "",
    });
  };

  const eliminarSesion = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta sesión?")) return;
    try {
      setCargando(true);
      await axios.delete(`http://localhost:5000/api/sesiones/eliminar/${id}`);
      setSesiones((prev) => prev.filter((s) => s.Idsesion !== id));
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error eliminando sesión");
    } finally {
      setCargando(false);
    }
  };

  const formatearHora = (hora) => {
    if (!hora) return "";
    const [horas, minutos] = hora.split(":");
    return `${horas}:${minutos}`;
  };

  const obtenerNombrePaciente = (sesion) => {
    const p = sesion.tratamiento?.paciente;
    return p
      ? `${p.Nombre_pac} ${p.Appaterno_pac} ${p.Apmaterno_pac}`.trim()
      : "Sin paciente";
  };

  const obtenerNombreProfesional = (sesion) => {
    const prof = sesion.cita?.profesional;
    return prof
      ? prof.nombreCompleto || `${prof.Nombre_prof} ${prof.Appaterno_prof}`
      : "Sin profesional";
  };

  return (
    <div className="sesion-container">
      <h1>Gestión de Sesiones Médicas</h1>
      {error && <div className="error-message">{error}</div>}

      <button className="btn-submit" onClick={() => setModalAbierto(true)}>
        Registrar Nueva Sesión
      </button>

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>la cita al que pertenece esta sesion:</label>
                  <select
                    name="Idcita"
                    value={formulario.Idcita}
                    onChange={handleCitaChange}
                    required
                  >
                    <option value="">Seleccione una cita...</option>
                    {citas.map((cita) => (
                      <option key={cita.Idcita} value={cita.Idcita}>
                         #{cita.Idcita} -{" "}
                        {new Date(cita.fecha_cita).toLocaleDateString()}{" "}
                        {formatearHora(cita.hora_cita)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tratamiento que tiene el paciente:</label>
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
                          #{trat.Idtrat} - {trat.Obs}
                        </option>
                      ))
                    ) : (
                      <option value="">
                        No hay tratamientos para este paciente.
                      </option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Técnica aplicada:</label>
                  <select
                    name="Idtec"
                    value={formulario.Idtec}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione una técnica...</option>
                    {tecnicas.map((tec) => (
                      <option key={tec.Idtec} value={tec.Idtec}>
                        {tec.Descripcion}
                      </option>
                    ))}
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
                  {cargando ? "Guardando..." : "Guardar Sesión"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="sesion-list">
        <h2>Listado de Sesiones</h2>
        <div className="filtros">
          <div className="filtro-group">
            <label>Buscar:</label>
            <input
              type="text"
              placeholder="ID Sesión, Cita o Tratamiento..."
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
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Profesional</th>
                  <th>Tipo</th>
                  <th>Tratamiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sesiones.map((sesion) => (
                  <tr key={sesion.Idsesion}>
                    <td>
                      {new Date(sesion.cita?.fecha_cita).toLocaleDateString()}
                    </td>
                    <td>
                      {formatearHora(sesion.Hora_ini)} -{" "}
                      {formatearHora(sesion.Hora_fin)}
                    </td>
                    <td>{obtenerNombrePaciente(sesion)}</td>
                    <td>{obtenerNombreProfesional(sesion)}</td>
                    <td>{sesion.Tipo}</td>
                    <td>{sesion.Idtrat}</td>
                    <td>
                      <button
                        className="btn-action"
                        onClick={() =>
                          navigate(`/sesiones/editar/${sesion.Idsesion}`)
                        }
                      >
                        Editar
                      </button>
                      <button
                        className="btn-action btn-danger"
                        onClick={() => eliminarSesion(sesion.Idsesion)}
                      >
                        Eliminar
                      </button>
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
