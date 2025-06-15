import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTimes } from "react-icons/fa";
import "./Tecnicas.css";

const Tecnica = () => {
  const [tecnicas, setTecnicas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState({
    Idtec: null,
    Descripcion: "",
    Idarea: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [filtroArea, setFiltroArea] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [tecnicasRes, areasRes] = await Promise.all([
        axios.get("http://localhost:5000/api/tecnica/listar"),
        axios.get("http://localhost:5000/api/area/listar"),
      ]);
      setTecnicas(tecnicasRes.data);
      setAreas(areasRes.data);
      setCargando(false);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setCargando(false);
    }
  };

  const abrirModalEdicion = (tecnica = null) => {
    if (tecnica) {
      setForm({
        Idtec: tecnica.Idtec,
        Descripcion: tecnica.Descripcion,
        Idarea: tecnica.Idarea || "",
      });
    } else {
      setForm({
        Idtec: null,
        Descripcion: "",
        Idarea: "",
      });
    }
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.Idtec) {
        await axios.put(
          `http://localhost:5000/api/tecnica/editar/${form.Idtec}`,
          {
            Descripcion: form.Descripcion,
            Idarea: form.Idarea || null,
          }
        );
      } else {
        await axios.post("http://localhost:5000/api/tecnica/crear", {
          Descripcion: form.Descripcion,
          Idarea: form.Idarea || null,
        });
      }
      setModalOpen(false);
      cargarDatos();
    } catch (error) {
      console.error("Error guardando técnica:", error);
    }
  };

  const filtrarTecnicas = () => {
    if (!filtroArea) return tecnicas;
    return tecnicas.filter((t) => t.Idarea === Number(filtroArea));
  };

  const obtenerNombreArea = (idArea) => {
    if (!idArea) return "Sin área asignada";
    const area = areas.find((a) => a.Idarea === Number(idArea));
    return area ? area.Nombre : "Área desconocida";
  };

  const tecnicasFiltradas = filtrarTecnicas();

  return (
    <div className="tecnica-container">
      <div className="header-tecnica">
        <h2>Gestión de Técnicas</h2>
        <button className="btn-nuevo" onClick={() => abrirModalEdicion()}>
          + Nueva Técnica
        </button>
      </div>

      <div className="filtros">
        <label>
          Filtrar por área:
          <select
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
          >
            <option value="">Todas las áreas</option>
            {areas.map((area) => (
              <option key={area.Idarea} value={area.Idarea}>
                {area.Nombre}
              </option>
            ))}
          </select>
        </label>

        {filtroArea && (
          <button className="btn-limpiar" onClick={() => setFiltroArea("")}>
            <FaTimes /> Limpiar filtro
          </button>
        )}
      </div>

      {cargando ? (
        <p>Cargando técnicas...</p>
      ) : (
        <table className="tabla-tecnicas">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Área</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tecnicasFiltradas.length > 0 ? (
              tecnicasFiltradas.map((tecnica) => (
                <tr key={tecnica.Idtec}>
                  <td>{tecnica.Descripcion}</td>
                  <td>{obtenerNombreArea(tecnica.Idarea)}</td>
                  <td>
                    <button
                      className="btn-editar"
                      onClick={() => abrirModalEdicion(tecnica)}
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="sin-resultados">
                  No se encontraron técnicas{" "}
                  {filtroArea ? "para esta área" : ""}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>{form.Idtec ? "Editar Técnica" : "Nueva Técnica"}</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  name="Descripcion"
                  value={form.Descripcion}
                  onChange={handleChange}
                  required
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Área:</label>
                <select
                  name="Idarea"
                  value={form.Idarea}
                  onChange={handleChange}
                >
                  <option value="">Sin área asignada</option>
                  {areas.map((area) => (
                    <option key={area.Idarea} value={area.Idarea}>
                      {area.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="botones-modal">
                <button type="submit" className="btn-guardar">
                  Guardar
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
    </div>
  );
};

export default Tecnica;
