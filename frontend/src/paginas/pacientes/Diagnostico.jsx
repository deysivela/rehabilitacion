import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaUserMd,
  FaUserInjured,
  FaNotesMedical,
  FaEye,
} from "react-icons/fa";
import "./Diagnostico.css";
import { useLocation } from "react-router-dom";

const Diagnostico = () => {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [form, setForm] = useState({
    Iddiagnostico: null,
    Idpac: "",
    Detalle_diag: "",
    idprof: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState(null);
  const [filtroPaciente, setFiltroPaciente] = useState("");
  const [filtroProfesional, setFiltroProfesional] = useState("");
  const [cargando, setCargando] = useState(true);
  const location = useLocation();

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pacienteId = params.get("pacienteId");
    const abrir = params.get("abrirModal");

    if (pacienteId && abrir === "true") {
      setForm((prev) => ({ ...prev, Idpac: pacienteId }));
      setModalOpen(true);
    }
  }, [location.search]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [diagsRes, pacsRes, profsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/diagnostico/listar"),
        axios.get("http://localhost:5000/api/paciente/listar"),
        axios.get("http://localhost:5000/api/prof_salud/listar"),
      ]);
      setDiagnosticos(diagsRes.data);
      setPacientes(pacsRes.data);
      setProfesionales(profsRes.data);
      setCargando(false);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setCargando(false);
    }
  };

  const abrirModal = (diagnostico = null) => {
    if (diagnostico) {
      setForm({
        Iddiagnostico: diagnostico.Iddiagnostico,
        Idpac: diagnostico.Idpac,
        Detalle_diag: diagnostico.Detalle_diag || "",
        idprof: diagnostico.idprof,
      });
    } else {
      setForm({
        Iddiagnostico: null,
        Idpac: "",
        Detalle_diag: "",
        idprof: "",
      });
    }
    setModalOpen(true);
  };

  const abrirModalDetalle = (diagnostico) => {
    setDiagnosticoSeleccionado(diagnostico);
    setDetalleModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.Iddiagnostico) {
        await axios.put(
          `http://localhost:5000/api/diagnostico/editar/${form.Iddiagnostico}`,
          form
        );
      } else {
        await axios.post("http://localhost:5000/api/diagnostico/crear", form);
      }
      setModalOpen(false);
      cargarDatos();
    } catch (error) {
      console.error("Error guardando diagnóstico:", error);
      alert("Error al guardar el diagnóstico");
    }
  };

  const eliminarDiagnostico = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este diagnóstico?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/diagnostico/eliminar/${id}`
        );
        cargarDatos();
      } catch (error) {
        console.error("Error eliminando diagnóstico:", error);
        alert("Error al eliminar el diagnóstico");
      }
    }
  };

  const filtrarDiagnosticos = () => {
    return diagnosticos.filter((d) => {
      const paciente = pacientes.find((p) => p.Idpac === d.Idpac);
      const textoPaciente = paciente
        ? `${paciente.Nombre_pac} ${paciente.Appaterno_pac} ${paciente.CI_pac}`
            .toLowerCase()
        : "";

      const coincidePaciente = filtroPaciente
        ? textoPaciente.includes(filtroPaciente.toLowerCase())
        : true;

      const coincideProfesional = filtroProfesional
        ? d.idprof === parseInt(filtroProfesional)
        : true;

      return coincidePaciente && coincideProfesional;
    });
  };

  const obtenerNombrePaciente = (id) => {
    const p = pacientes.find((pac) => pac.Idpac === id);
    return p ? `${p.Nombre_pac} ${p.Appaterno_pac} ${p.Apmaterno_pac}` : "No encontrado";
  };

  const obtenerNombreProfesional = (id) => {
    const prof = profesionales.find(p => p.Idprof === id);
    if (!prof) return '—';
    const { Nombre_prof, Appaterno_prof, Apmaterno_prof } = prof;
    return `${Nombre_prof} ${Appaterno_prof}${Apmaterno_prof ? ' ' + Apmaterno_prof : ''}`;
  };

  const diagnosticosFiltrados = filtrarDiagnosticos();

  return (
    <div className="diagnostico-container">
      <div className="header-diagnostico">
        <h2>
          <FaNotesMedical /> Gestión de Diagnósticos
        </h2>
        <button className="btn-nuevo" onClick={() => abrirModal()}>
          + Nuevo Diagnóstico
        </button>
      </div>

      <div className="controles-superiores">
        <div className="filtros">
          <div className="filtro-group">
            <FaUserInjured />
            <input
              type="text"
              placeholder="Buscar por nombre o CI"
              value={filtroPaciente}
              onChange={(e) => setFiltroPaciente(e.target.value)}
            />
          </div>

          <div className="filtro-group">
            <FaUserMd />
            <select
              value={filtroProfesional}
              onChange={(e) => setFiltroProfesional(e.target.value)}
            >
              <option value="">Todos los profesionales</option>
              {profesionales.map((p) => (
                <option key={p.Idprof} value={p.Idprof}>
                  {p.Nombre_prof} {p.Appaterno_prof} {p.Apmaterno_prof}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="cargando">Cargando diagnósticos...</div>
      ) : (
        <div className="tabla-container">
          {diagnosticosFiltrados.length > 0 ? (
            <table className="tabla-diagnosticos">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Detalle de Diagnóstico</th>
                  <th>Profesional</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticosFiltrados.map((d) => (
                  <tr key={d.Iddiagnostico}>
                    <td>{obtenerNombrePaciente(d.Idpac)}</td>
                    <td>
                      {d.Detalle_diag
                        ? d.Detalle_diag.length > 50
                          ? `${d.Detalle_diag.slice(0, 50)}...`
                          : d.Detalle_diag
                        : "-"}
                    </td>
                    <td>{obtenerNombreProfesional(d.idprof)}</td>
                    <td className="acciones">
                      <button
                        className="btn-ver"
                        title="Ver detalles"
                        onClick={() => abrirModalDetalle(d)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn-editar"
                        title="Editar"
                        onClick={() => abrirModal(d)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-eliminar"
                        title="Eliminar"
                        onClick={() => eliminarDiagnostico(d.Iddiagnostico)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="sin-resultados">
              No se encontraron diagnósticos{" "}
              {filtroPaciente || filtroProfesional ? "con los filtros aplicados" : ""}
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>{form.Iddiagnostico ? "Editar Diagnóstico" : "Nuevo Diagnóstico"}</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Detalle:</label>
                <textarea
                  name="Detalle_diag"
                  value={form.Detalle_diag}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Paciente:</label>
                <select
                  name="Idpac"
                  value={form.Idpac}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un paciente</option>
                  {pacientes.map((p) => (
                    <option key={p.Idpac} value={p.Idpac}>
                      {p.Nombre_pac} {p.Appaterno_pac} {p.Apmaterno_pac}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Profesional:</label>
                <select
                  name="idprof"
                  value={form.idprof}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un profesional</option>
                  {profesionales.map((p) => (
                    <option key={p.Idprof} value={p.Idprof}>
                      {p.Nombre_prof} {p.Appaterno_prof}
                    </option>
                  ))}
                </select>
              </div>

              <div className="botones-modal">
                <button type="submit" className="btn-guardar">
                  {form.Iddiagnostico ? "Actualizar" : "Guardar"}
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
      )}

      {detalleModalOpen && diagnosticoSeleccionado && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>Detalles del Diagnóstico</h3>
            <div className="detalles-container">
              <div className="detalle-item">
                <label>Detalle completo:</label>
                <p className="detalle-texto">
                  {diagnosticoSeleccionado.Detalle_diag || "No especificado"}
                </p>
              </div>
              <div className="detalle-item">
                <label>Paciente:</label>
                <p>{obtenerNombrePaciente(diagnosticoSeleccionado.Idpac)}</p>
              </div>
              <div className="detalle-item">
                <label>Profesional:</label>
                <p>{obtenerNombreProfesional(diagnosticoSeleccionado.idprof)}</p>
              </div>
            </div>
            <button
              className="btn-cerrar-detalle"
              onClick={() => setDetalleModalOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnostico;
