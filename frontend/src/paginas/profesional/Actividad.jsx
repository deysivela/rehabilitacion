import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "./Actividad.css";

const Actividad = () => {
  const [actividades, setActividades] = useState([]);
  const [actividadActual, setActividadActual] = useState({
    Idact: null,
    Fecha: "",
    Actividad: "",
    Tipo: "",
    Lugar: "",
    Resultado: "",
    Medio_ver: "",
    Idprof: "",
  });
  const [profesionales, setProfesionales] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);

  useEffect(() => {
    obtenerActividades();
    obtenerProfesionales();
  }, []);

  const obtenerActividades = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/actividad/listar");
      setActividades(res.data);
    } catch (err) {
      console.error("Error al obtener actividades", err);
    }
  };

  const obtenerProfesionales = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/prof_salud/listar"
      );
      setProfesionales(res.data);
    } catch (err) {
      console.error("Error al obtener profesionales", err);
    }
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

  const obtenerNombreProfesional = (id) => {
    const prof = profesionales.find((p) => p.Idprof === id);
    if (!prof) return "—";
    const { Nombre_prof, Appaterno_prof, Apmaterno_prof } = prof;
    return `${Nombre_prof} ${Appaterno_prof}${
      Apmaterno_prof ? " " + Apmaterno_prof : ""
    }`;
  };

  const abrirModal = (actividad = null) => {
    if (actividad) {
      setActividadActual(actividad);
      setModoEdicion(true);
    } else {
      setActividadActual({
        Idact: null,
        Fecha: "",
        Actividad: "",
        Tipo: "",
        Lugar: "",
        Resultado: "",
        Medio_ver: "",
        Idprof: "",
      });
      setModoEdicion(false);
    }
    setModalAbierto(true);
  };

  const abrirModalDetalle = (actividad) => {
    setActividadActual(actividad);
    setModalDetalle(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
  };

  const cerrarModalDetalle = () => {
    setModalDetalle(false);
  };

  const handleChange = (e) => {
    setActividadActual({ ...actividadActual, [e.target.name]: e.target.value });
  };

  const guardarActividad = async () => {
    try {
      if (modoEdicion) {
        await axios.put(
          `http://localhost:5000/api/actividad/actualizar/${actividadActual.Idact}`,
          actividadActual
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/actividad/crear",
          actividadActual
        );
      }
      cerrarModal();
      obtenerActividades();
    } catch (err) {
      console.error("Error al guardar actividad", err);
    }
  };

  const eliminarActividad = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta actividad?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/actividad/eliminar/${id}`);
      obtenerActividades();
    } catch (err) {
      console.error("Error al eliminar actividad", err);
    }
  };

  return (
    <div className="actividad-container">
      <h2>Registro de Actividades</h2>
      <button className="btn-agregar" onClick={() => abrirModal()}>
        Agregar Actividad
      </button>
      <div className="tabla-scroll">
        <table className="tabla-actividades">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Actividad</th>
              <th>Tipo</th>
              <th>Lugar</th>
              <th>Resultado</th>
              <th>Medio Verificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((a) => (
              <tr key={a.Idact}>
                <td>{formatearFecha(a.Fecha)}</td>
                <td>{a.Actividad}</td>
                <td>{a.Tipo}</td>
                <td>{a.Lugar}</td>
                <td>{a.Resultado}</td>
                <td>{a.Medio_ver}</td>
                  
                <td className="acciones">
                  <FaEye
                    className="icono ojo"
                    onClick={() => abrirModalDetalle(a)}
                    title="Ver Detalle"
                  />
                  <FaEdit
                    className="icono editar"
                    onClick={() => abrirModal(a)}
                    title="Editar"
                  />
                  <FaTrash
                    className="icono eliminar"
                    onClick={() => eliminarActividad(a.Idact)}
                    title="Eliminar"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Agregar/Editar */}
      {modalAbierto && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>{modoEdicion ? "Editar Actividad" : "Nueva Actividad"}</h3>
            <form>
              <input
                type="date"
                name="Fecha"
                value={actividadActual.Fecha}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="Actividad"
                placeholder="Actividad"
                value={actividadActual.Actividad}
                onChange={handleChange}
              />
              <input
                type="text"
                name="Tipo"
                placeholder="Tipo"
                value={actividadActual.Tipo}
                onChange={handleChange}
              />
              <input
                type="text"
                name="Lugar"
                placeholder="Lugar"
                value={actividadActual.Lugar}
                onChange={handleChange}
              />
              <textarea
                name="Resultado"
                placeholder="Resultado"
                value={actividadActual.Resultado}
                onChange={handleChange}
              />
              <textarea
                name="Medio_ver"
                placeholder="Medio de Verificación"
                value={actividadActual.Medio_ver}
                onChange={handleChange}
              />
              <div className="form-group">
                <label>Profesional:</label>
                <select
                  name="Idprof"
                  value={actividadActual.Idprof}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un profesional</option>
                  {profesionales.map((a) => (
                    <option key={a.Idprof} value={a.Idprof}>
                      {a.Nombre_prof} {a.Appaterno_prof} {a.Apmaterno_prof}
                    </option>
                  ))}
                </select>
              </div>
            </form>
            <div className="modal-botones">
              <button onClick={guardarActividad}>Guardar</button>
              <button onClick={cerrarModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {modalDetalle && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>Detalle de Actividad</h3>
            <p>
              <strong>Fecha:</strong> {formatearFecha(actividadActual.Fecha)}
            </p>
            <p>
              <strong>Actividad:</strong> {actividadActual.Actividad}
            </p>
            <p>
              <strong>Tipo:</strong> {actividadActual.Tipo}
            </p>
            <p>
              <strong>Lugar:</strong> {actividadActual.Lugar}
            </p>
            <p>
              <strong>Resultado:</strong> {actividadActual.Resultado}
            </p>
            <p>
              <strong>Medio Verificación:</strong> {actividadActual.Medio_ver}
            </p>
            <p>
              <strong>Profesional:</strong>{" "}
              {obtenerNombreProfesional(actividadActual.Idprof)}
            </p>
            <div className="modal-botones">
              <button onClick={cerrarModalDetalle}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actividad;
