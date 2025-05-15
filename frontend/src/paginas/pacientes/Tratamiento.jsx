import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaUserInjured, FaCalendarAlt, FaEye } from 'react-icons/fa';
import './Tratamiento.css';

const Tratamiento = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({
    Idtrat: null,
    Fecha_ini: '',
    Fecha_fin: '',
    Idpac: '',
    Estado: 'En curso',
    Obs: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [filtroPaciente, setFiltroPaciente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [tratsRes, pacsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tratamiento/listar'),
        axios.get('http://localhost:5000/api/paciente/listar')
      ]);
      // Ordenar por fecha de inicio descendente
      const tratamientosOrdenados = tratsRes.data.sort((a, b) => 
        new Date(b.Fecha_ini) - new Date(a.Fecha_ini)
      );
      setTratamientos(tratamientosOrdenados);
      setPacientes(pacsRes.data);
      setCargando(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setCargando(false);
    }
  };

  const abrirModal = (tratamiento = null) => {
    if (tratamiento) {
      setForm({
        Idtrat: tratamiento.Idtrat,
        Fecha_ini: tratamiento.Fecha_ini,
        Fecha_fin: tratamiento.Fecha_fin || '',
        Idpac: tratamiento.Idpac || '',
        Estado: tratamiento.Estado || 'En curso',
        Obs: tratamiento.Obs || ''
      });
    } else {
      setForm({
        Idtrat: null,
        Fecha_ini: new Date().toISOString().split('T')[0],
        Fecha_fin: '',
        Idpac: '',
        Estado: 'En curso',
        Obs: ''
      });
    }
    setModalOpen(true);
  };

  const abrirModalDetalle = (tratamiento) => {
    setTratamientoSeleccionado(tratamiento);
    setDetalleModalOpen(true);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        Fecha_fin: form.Fecha_fin || null,
        Idpac: form.Idpac || null
      };

      if (form.Idtrat) {
        await axios.put(`http://localhost:5000/api/tratamiento/${form.Idtrat}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/tratamiento/crear', payload);
      }
      setModalOpen(false);
      cargarDatos();
    } catch (error) {
      console.error('Error guardando tratamiento:', error);
      alert('Error al guardar el tratamiento');
    }
  };

  const eliminarTratamiento = async id => {
    if (window.confirm('¿Está seguro de eliminar este tratamiento?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tratamiento/${id}`);
        cargarDatos();
      } catch (error) {
        console.error('Error eliminando tratamiento:', error);
        alert('Error al eliminar el tratamiento');
      }
    }
  };

  const filtrarTratamientos = () => {
    const filtrados = tratamientos.filter(t => {
      const cumplePaciente = filtroPaciente ? t.Idpac === parseInt(filtroPaciente, 10) : true;
      const cumpleEstado = filtroEstado ? t.Estado === filtroEstado : true;
      return cumplePaciente && cumpleEstado;
    });
    // Mantener el orden descendente después de filtrar
    return filtrados.sort((a, b) => new Date(b.Fecha_ini) - new Date(a.Fecha_ini));
  };

  const obtenerNombrePaciente = (id) => {
    if (!id) return 'Sin paciente asignado';
    const paciente = pacientes.find(p => p.Idpac === id);
    return paciente ? `${paciente.Nombre_pac} ${paciente.Appaterno_pac}` : 'Paciente no encontrado';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  const tratamientosFiltrados = filtrarTratamientos();

  return (
    <div className="tratamiento-container">
      <div className="header-container">
        <h2><FaCalendarAlt /> Gestión de Tratamientos</h2>
        <button className="btn-nuevo" onClick={() => abrirModal()}>
          <FaPlus /> Nuevo Tratamiento
        </button>
      </div>
      
      <div className="controles-superiores">
        <div className="filtros">
          <div className="filtro-group">
            <FaUserInjured />
            <select
              value={filtroPaciente}
              onChange={e => setFiltroPaciente(e.target.value)}
            >
              <option value="">Todos los pacientes</option>
              {pacientes.map(p => (
                <option key={p.Idpac} value={p.Idpac}>
                  {p.Nombre_pac} {p.Appaterno_pac}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filtro-group">
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="En curso">En curso</option>
              <option value="Concluido">Concluido</option>
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
                {tratamientosFiltrados.map(t => (
                  <tr key={t.Idtrat}>
                    <td>{obtenerNombrePaciente(t.Idpac)}</td>
                    <td>{formatearFecha(t.Fecha_ini)}</td>
                    <td>{formatearFecha(t.Fecha_fin)}</td>
                    <td>
                      <span className={`estado-badge ${t.Estado === 'En curso' ? 'en-curso' : 'concluido'}`}>
                        {t.Estado}
                      </span>
                    </td>
                    <td>{t.Obs}</td>
                    <td className="acciones">
                      <button 
                        className="btn-detalle"
                        onClick={() => abrirModalDetalle(t)}
                        title="Ver detalles"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn-editar"
                        onClick={() => abrirModal(t)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-eliminar"
                        onClick={() => eliminarTratamiento(t.Idtrat)}
                        title="Eliminar"
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
              No se encontraron tratamientos {filtroPaciente || filtroEstado ? 'con los filtros aplicados' : ''}
            </div>
          )}
        </div>
      )}

      {/* Modal para crear/editar */}
      {modalOpen && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>{form.Idtrat ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Paciente:</label>
                <select
                  name="Idpac"
                  value={form.Idpac}
                  onChange={handleChange}
                >
                  <option value="">Sin paciente asignado</option>
                  {pacientes.map(p => (
                    <option key={p.Idpac} value={p.Idpac}>
                      {p.Nombre_pac} {p.Appaterno_pac}
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
                />
              </div>
              
              <div className="form-group">
                <label>Fecha Fin:</label>
                <input
                  type="date"
                  name="Fecha_fin"
                  value={form.Fecha_fin}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Estado:</label>
                <select
                  name="Estado"
                  value={form.Estado}
                  onChange={handleChange}
                  required
                >
                  <option value="En curso">En curso</option>
                  <option value="Concluido">Concluido</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Observaciones:</label>
                <textarea
                  name="Obs"
                  value={form.Obs}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              
              <div className="botones-modal">
                <button type="submit" className="btn-guardar">
                  {form.Idtrat ? 'Actualizar' : 'Guardar'}
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

      {/* Modal de Detalles */}
      {detalleModalOpen && tratamientoSeleccionado && (
        <div className="modal">
          <div className="modal-contenido">
            <h3>Detalles del Tratamiento</h3>
            
            <div className="detalles-container">
              <div className="detalle-item">
                <label>Paciente:</label>
                <p>{obtenerNombrePaciente(tratamientoSeleccionado.Idpac)}</p>
              </div>
              
              <div className="detalle-item">
                <label>Fecha Inicio:</label>
                <p>{formatearFecha(tratamientoSeleccionado.Fecha_ini)}</p>
              </div>
              
              <div className="detalle-item">
                <label>Fecha Fin:</label>
                <p>{formatearFecha(tratamientoSeleccionado.Fecha_fin) || '-'}</p>
              </div>
              
              <div className="detalle-item">
                <label>Estado:</label>
                <p>
                  <span className={`estado-badge ${tratamientoSeleccionado.Estado === 'En curso' ? 'en-curso' : 'concluido'}`}>
                    {tratamientoSeleccionado.Estado}
                  </span>
                </p>
              </div>
              
              <div className="detalle-item">
                <label>Observaciones:</label>
                <p className="detalle-texto">{tratamientoSeleccionado.Obs || 'No hay observaciones'}</p>
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

export default Tratamiento;