import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Usuario.css';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const Usuario = () => {
  const [lista, setLista] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [form, setForm] = useState({
    Iduser: null,
    Usuario: '',
    Pass: '',
    Rol: 'Medico',
    Activo: true,
    Idprof: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [soloVista, setSoloVista] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    fetchUsuarios();
    fetchProfesionales();
  }, []);

  const fetchUsuarios = async () => {
    const { data } = await axios.get('http://localhost:5000/api/usuario/listar');
    setLista(data);
  };

  const fetchProfesionales = async () => {
    const { data } = await axios.get('http://localhost:5000/api/prof_salud/listar');
    setProfesionales(data);
  };

  const abrirModal = (user, verSolo = false) => {
    fetchProfesionales();
    if (user) {
      setForm({
        ...user,
        Idprof: user.Idprof ? user.Idprof.toString() : '',
        Pass: user.Pass || ''
      });
    } else {
      setForm({
        Iduser: null,
        Usuario: '',
        Pass: '',
        Rol: 'Medico',
        Activo: true,
        Idprof: '',
      });
    }
    setSoloVista(verSolo);
    setModalOpen(true);
  };

  const verDetalle = (user) => {
    setUsuarioSeleccionado(user);
    setDetalleOpen(true);
  };

  const obtenerNombreProfesional = (id) => {
    const prof = profesionales.find(p => p.Idprof === id);
    if (!prof) return '—';
    const { Nombre_prof, Appaterno_prof, Apmaterno_prof } = prof;
    return `${Nombre_prof} ${Appaterno_prof}${Apmaterno_prof ? ' ' + Apmaterno_prof : ''}`;
  };
  

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      Usuario: form.Usuario,
      Pass: form.Pass,
      Rol: form.Rol,
      Activo: form.Activo,
      Idprof: form.Idprof ? parseInt(form.Idprof, 10) : null
    };
    if (form.Iduser) {
      await axios.put(`http://localhost:5000/api/usuario/actualizar/${form.Iduser}`, payload);
    } else {
      await axios.post('http://localhost:5000/api/usuario/crear', payload);
    }
    setModalOpen(false);
    fetchUsuarios();
  };

  const handleDelete = async id => {
    if (window.confirm('¿Eliminar este usuario?')) {
      await axios.delete(`http://localhost:5000/api/usuario/eliminar/${id}`);
      fetchUsuarios();
    }
  };

  return (
    <div className="usuario-container">
      <h2>Gestión de Usuarios</h2>
      <button className="btn-registrar" onClick={() => abrirModal(null)}>
        Registrar Usuario
      </button>

      <table className="tabla-usuarios">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Activo</th>
            <th>Profesional</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lista.map(u => (
            <tr key={u.Iduser}>
              <td>{u.Usuario}</td>
              <td>{u.Rol}</td>
              <td>{u.Activo ? 'Sí' : 'No'}</td>
              <td>{obtenerNombreProfesional(u.Idprof)}</td>
              <td className="acciones">
                <FaEye
                  className="icono icono-ver"
                  title="Ver detalles"
                  onClick={() => verDetalle(u)}
                />
                <FaEdit
                  className="icono icono-editar"
                  onClick={() => abrirModal(u)}
                />
                <FaTrash
                  className="icono icono-eliminar"
                  onClick={() => handleDelete(u.Iduser)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Registro/Edición */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{soloVista ? 'Detalles del Usuario' : form.Iduser ? 'Actualizar Usuario' : 'Registrar Usuario'}</h3>
            <form onSubmit={handleSubmit} className="form-vertical">
              <label className="form-label" htmlFor="Usuario">
                Nombre de Usuario
                <input
                  id="Usuario"
                  name="Usuario"
                  value={form.Usuario}
                  onChange={handleChange}
                  required
                  readOnly={soloVista}
                />
              </label>

              <label className="form-label" htmlFor="Pass">
                Contraseña
                <input
                  id="Pass"
                  type="text"
                  name="Pass"
                  value={form.Pass}
                  onChange={handleChange}
                  placeholder={form.Iduser ? 'Dejar en blanco para no cambiar' : ''}
                  required={!form.Iduser}
                  readOnly={soloVista}
                />
              </label>

              <label className="form-label" htmlFor="Rol">
                Rol
                <select
                  id="Rol"
                  name="Rol"
                  value={form.Rol}
                  onChange={handleChange}
                  disabled={soloVista}
                >
                  <option value="Admin">Admin</option>
                  <option value="Medico">Médico</option>
                  <option value="Auxiliar">Auxiliar</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>

              <label className="form-label">
                <input
                  type="checkbox"
                  name="Activo"
                  checked={form.Activo}
                  onChange={handleChange}
                  disabled={soloVista}
                />
                Activo
              </label>

              <label className="form-label" htmlFor="Idprof">
                Profesional asociado
                <select
                  id="Idprof"
                  name="Idprof"
                  value={form.Idprof}
                  onChange={handleChange}
                  disabled={soloVista}
                >
                  <option value="">— Ninguno —</option>
                  {profesionales.map(p => (
                    <option key={p.Idprof} value={p.Idprof}>
                      {p.Nombre_prof} {p.Appaterno_prof}
                    </option>
                  ))}
                </select>
              </label>

              {!soloVista && (
                <button type="submit">
                  {form.Iduser ? 'Actualizar' : 'Registrar'}
                </button>
              )}
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setModalOpen(false)}
              >
                Cerrar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {detalleOpen && usuarioSeleccionado && (
  <div className="modal">
    <div className="modal-content">
      <h3>Detalles del Usuario</h3>
      <p><strong>Usuario:</strong> {usuarioSeleccionado.Usuario}</p>
      <p><strong>Contraseña:</strong> 🔒 Encriptada</p>
      <p><strong>Rol:</strong> {usuarioSeleccionado.Rol}</p>
      <p><strong>Activo:</strong> {usuarioSeleccionado.Activo ? 'Sí' : 'No'}</p>
      <p>
        <strong>Profesional asociado:</strong>{' '}
        {obtenerNombreProfesional(usuarioSeleccionado.Idprof)}
    </p>


      <button onClick={() => setDetalleOpen(false)} className="btn-cancel">Cerrar</button>
    </div>
  </div>
)}

    </div>
  );
};

export default Usuario;
