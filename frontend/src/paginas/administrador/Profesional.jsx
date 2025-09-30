import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profesional.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { API_URL } from '../../config';
const Profesional = () => {
  const [lista, setLista] = useState([]);
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState({
    Idprof: null,
    Nombre_prof: "",
    Appaterno_prof: "",
    Apmaterno_prof: "",
    Ci_prof: "",
    Fnaci_prof: "",
    Genero_prof: "",
    Especialidad: "",
    Telefono_prof: "",
    Idarea: "",
  });
  const calcularEdad = (fechaNac) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [profSeleccionado, setProfSeleccionado] = useState(null);

  useEffect(() => {
    fetchProfesionales();
    fetchAreas();
  }, []);
  
  const fetchProfesionales = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/prof_salud/listar`
      );
      setLista(response.data);
    } catch (error) {
      console.error("Error al obtener profesionales:", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${API_URL}/area/listar`);
      setAreas(res.data);
    } catch (err) {
      console.error("Error al cargar áreas:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const abrirModal = (prof = null) => {
    if (prof) {
      setForm({
        ...prof,
        Fnaci_prof: prof.Fnaci_prof ? prof.Fnaci_prof.split("T")[0] : "",
      });
    } else {
      setForm({
        Idprof: null,
        Nombre_prof: "",
        Appaterno_prof: "",
        Apmaterno_prof: "",
        Ci_prof: "",
        Fnaci_prof: "",
        Genero_prof: "",
        Especialidad: "",
        Telefono_prof: "",
        Idarea: "",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.Idprof) {
        await axios.put(
          `${API_URL}/prof_salud/actualizar/${form.Idprof}`,
          form
        );
      } else {
        await axios.post(`${API_URL}/prof_salud/crear`, form);
      }
      setModalOpen(false);
      fetchProfesionales();
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro que deseas eliminar este profesional?")) {
      try {
        await axios.delete(
          `${API_URL}/prof_salud/eliminar/${id}`
        );
        fetchProfesionales();
      } catch (error) {
        console.error("Error al eliminar profesional:", error);
      }
    }
  };

  const verDetalle = (prof) => {
    setProfSeleccionado(prof);
    setDetalleOpen(true);
  };

  const obtenerNombreArea = (id) => {
    return areas.find((a) => a.Idarea === id)?.Nombre || "No asignada";
  };

  return (
    <div className="prof-container">
      <h2>Gestión de Profesionales</h2>
      <button className="btn-registrar" onClick={() => abrirModal()}>
        Registrar Profesional
      </button>

      <table className="tabla-profesionales">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Teléfono</th>
            <th>Área</th>
            <th>Edad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((prof) => (
            <tr key={prof.Idprof}>
              <td>
                {prof.Nombre_prof} {prof.Appaterno_prof} {prof.Apmaterno_prof}
              </td>
              <td>{prof.Especialidad || "Sin especialidad"}</td>
              <td>{prof.Telefono_prof}</td>
              <td>{obtenerNombreArea(prof.Idarea)}</td>
              <td>{calcularEdad(prof.Fnaci_prof)} años</td>
              <td className="acciones">
                <FaEye
                  className="icono icono-ver"
                  onClick={() => verDetalle(prof)}
                />
                <FaEdit
                  className="icono icono-editar"
                  onClick={() => abrirModal(prof)}
                />
                <FaTrash
                  className="icono icono-eliminar"
                  onClick={() => handleDelete(prof.Idprof)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal Formulario */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="modal-title">
              {form.Idprof ? "Editar Profesional" : "Registrar Profesional"}
            </h3>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label>
                  Nombre <span className="required">*</span>
                </label>
                <input
                  name="Nombre_prof"
                  value={form.Nombre_prof}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Apellido Paterno <span className="required">*</span>
                </label>
                <input
                  name="Appaterno_prof"
                  value={form.Appaterno_prof}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido Materno</label>
                <input
                  name="Apmaterno_prof"
                  value={form.Apmaterno_prof}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>
                  CI <span className="required">*</span>
                </label>
                <input
                  name="Ci_prof"
                  value={form.Ci_prof}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Fecha de Nacimiento <span className="required">*</span>
                </label>
                <input
                  name="Fnaci_prof"
                  type="date"
                  value={form.Fnaci_prof}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Género <span className="required">*</span>
                </label>
                <select
                  name="Genero_prof"
                  value={form.Genero_prof}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div className="form-group">
                <label>Especialidad</label>
                <input
                  name="Especialidad"
                  value={form.Especialidad}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  name="Telefono_prof"
                  value={form.Telefono_prof}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>
                  Área <span className="required">*</span>
                </label>
                <select
                  name="Idarea"
                  value={form.Idarea}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar Área</option>
                  {areas.map((area) => (
                    <option key={area.Idarea} value={area.Idarea}>
                      {area.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-guardar">
                  {form.Idprof ? "Actualizar" : "Registrar"}
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
      {/* Modal Detalle  */}
      {detalleOpen && profSeleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h3>Detalles del Profesional</h3>
            <p>
              <strong>Nombre:</strong> {profSeleccionado.Nombre_prof}{" "}
              {profSeleccionado.Appaterno_prof}{" "}
              {profSeleccionado.Apmaterno_prof}
            </p>
            <p>
              <strong>CI:</strong> {profSeleccionado.Ci_prof}
            </p>
            <p>
              <strong>Fecha de Nacimiento:</strong>{" "}
              {new Date(profSeleccionado.Fnaci_prof).toLocaleDateString(
                "es-ES"
              )}
            </p>

            <p>
              <strong>Género:</strong>{" "}
              {profSeleccionado.Genero_prof === "M" ? "Masculino" : "Femenino"}
            </p>
            <p>
              <strong>Especialidad:</strong>{" "}
              {profSeleccionado.Especialidad || "No definida"}
            </p>
            <p>
              <strong>Teléfono:</strong> {profSeleccionado.Telefono_prof}
            </p>
            <p>
              <strong>Área:</strong>{" "}
              {obtenerNombreArea(profSeleccionado.Idarea)}
            </p>
            <button onClick={() => setDetalleOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profesional;
