import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Area.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Area = () => {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ Idarea: null, Nombre: '', Descripcion: '' });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { fetchAreas(); }, []);

  const fetchAreas = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/area/listar');
      setLista(data);
    } catch (err) { console.error('Error al listar áreas:', err); }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const abrirModal = area => {
    if (area) setForm(area);
    else setForm({ Idarea: null, Nombre: '', Descripcion: '' });
    setModalOpen(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (form.Idarea) {
        await axios.put(
          `http://localhost:5000/api/area/actualizar/${form.Idarea}`,
          { Nombre: form.Nombre, Descripcion: form.Descripcion }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/area/crear',
          { Nombre: form.Nombre, Descripcion: form.Descripcion }
        );
      }
      setModalOpen(false);
      fetchAreas();
    } catch (err) {
      console.error('Error al guardar área:', err);
    }
  };

  const handleDelete = async id => {
    if (window.confirm('¿Seguro que deseas eliminar esta área?')) {
      try {
        await axios.delete(`http://localhost:5000/api/area/eliminar/${id}`);
        fetchAreas();
      } catch (err) {
        console.error('Error al eliminar área:', err);
      }
    }
  };

  return (
    <div className="area-container">
      <h2>Gestión de Áreas</h2>
      <button className="btn-registrar" onClick={() => abrirModal(null)}>
        Registrar Área
      </button>

      <table className="tabla-areas">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lista.map(a => (
            <tr key={a.Idarea}>
              <td>{a.Nombre}</td>
              <td>{a.Descripcion || '—'}</td>
              <td className="acciones">
                <FaEdit
                  className="icono icono-editar"
                  onClick={() => abrirModal(a)}
                />
                <FaTrash
                  className="icono icono-eliminar"
                  onClick={() => handleDelete(a.Idarea)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Formulario */}
{/* Modal Formulario */}
{modalOpen && (
  <div className="modal">
    <div className="modal-content">
      <h3>{form.Idarea ? 'Actualizar Área' : 'Registrar Área'}</h3>
      <form onSubmit={handleSubmit} className="form-vertical">
        <label htmlFor="Nombre" className="form-label">
          Nombre de Área
          <input
            id="Nombre"
            name="Nombre"
            value={form.Nombre}
            onChange={handleChange}
            placeholder="Nombre de Área"
            required
          />
        </label>

        <label htmlFor="Descripcion" className="form-label">
          Descripción
          <textarea
            id="Descripcion"
            name="Descripcion"
            value={form.Descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            rows="3"
          />
        </label>
        <button type="submit">
          {form.Idarea ? 'Actualizar' : 'Registrar'}
        </button>
        <button
          type="button"
          className="btn-cancel"
          onClick={() => setModalOpen(false)}
        >
          Cancelar
        </button>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default Area;


