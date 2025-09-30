import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "./Actividad.css";
import Swal from "sweetalert2";
import { API_URL } from '../config';
const Actividad = () => {
  const [actividades, setActividades] = useState([]);
  const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
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
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  
  // Obtener ID del profesional logueado
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const idProfesionalLogeado = usuario?.idprof;

  useEffect(() => {
    obtenerActividades();
  }, []);

  useEffect(() => {
    if (actividades.length > 0 && idProfesionalLogeado) {
      const filtradas = actividades.filter(
        (act) => act.Idprof === idProfesionalLogeado
      );
      setActividadesFiltradas(filtradas);
    }
  }, [actividades, idProfesionalLogeado]);

  const obtenerActividades = async () => {
    try {
      const res = await axios.get(`${API_URL}/actividad/listar`);
      setActividades(res.data);
    } catch (err) {
      console.error("Error al obtener actividades", err);
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
        Idprof: idProfesionalLogeado, // Asignar automáticamente el ID del profesional logueado
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
          `${API_URL}/actividad/actualizar/${actividadActual.Idact}`,
          actividadActual
        );
      } else {
        await axios.post(
          `${API_URL}/actividad/crear`,
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
    const result = await Swal.fire({
      title: "¿Está seguro de eliminar esta actividad?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/actividad/eliminar/${id}`);
        obtenerActividades();
        Swal.fire("Eliminada", "La actividad se eliminó correctamente.", "success");
      } catch (err) {
        console.error("Error al eliminar actividad:", err);
  
        // Mostrar mensaje del backend si existe
        const errorMsg = err.response?.data?.error || "Hubo un problema al eliminar la actividad.";
        Swal.fire("Error", errorMsg, "error");
      }
    }
  };
  
  // Lista de opciones sin numeración
  const opcionesTipo = [
    "N° de CAI de establecimiento",
    "N° de CAI de la red funcional de salud",
    "Nº de actividades realizadas con participación de la comunidad",
    "N° de actividades de la comunidad con participación del establecimiento",
    "Nº de capacitaciones impartidas",
    "Nº de participación en Ferias",
    "Nº de actividades educativas realizadas",
    "Nº de visitas familiares realizadas",
    "Nº de supervisiones y autoevaluaciones del establecimiento de Rehabilitación",
    "Nº de quejas y reclamos realizadas por los usuarios",
    "Nº de sugerencias y agradecimientos realizados por los usuarios",
    "N° de evaluaciones de satisfacción realizadas",
    "N° de actividades a favor de las Personas con Discapacidad",
  ];

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
            {actividadesFiltradas.map((a) => (
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
              <select
                name="Tipo"
                value={actividadActual.Tipo}
                onChange={handleChange}
              >
                <option value="">-- Seleccione un tipo --</option>
                {opcionesTipo.map((opcion, index) => (
                  <option key={index} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>

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
              {!modoEdicion && (
                <input
                  type="hidden"
                  name="Idprof"
                  value={idProfesionalLogeado}
                />
              )}
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
