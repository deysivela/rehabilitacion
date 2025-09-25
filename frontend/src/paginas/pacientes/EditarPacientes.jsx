import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditarPaciente.css';

const EditarPaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState({
    Nombre_pac: "",
    Appaterno_pac: "",
    Apmaterno_pac: "",
    Fnaci_pac: "",
    Genero_pac: "",
    Ci_pac: "",
    Telefono_pac: "",
    Direccion_pac: "",
    Seguro: "",
    Tienediscapacidad: false,
    Diagnostico: "",
    Tipo_disc: "",
    Grado_disc: "",
    Obs: "",
    Iddisc: null, 
  });
  const [errores, setErrores] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/paciente/${id}`);
        const pacienteData = response.data.data;
        
        const fechaNacimiento = pacienteData.Fnaci_pac 
          ? pacienteData.Fnaci_pac.split('T')[0] 
          : "";

        const discapacidadData = pacienteData.detalleDiscapacidad || {};
        
        setPaciente({
          Nombre_pac: pacienteData.Nombre_pac || "",
          Appaterno_pac: pacienteData.Appaterno_pac || "",
          Apmaterno_pac: pacienteData.Apmaterno_pac || "",
          Fnaci_pac: fechaNacimiento,
          Genero_pac: pacienteData.Genero_pac || "",
          Ci_pac: pacienteData.Ci_pac || "",
          Telefono_pac: pacienteData.Telefono_pac || "",
          Direccion_pac: pacienteData.Direccion_pac || "",
          Seguro: pacienteData.Seguro || "",
          Tienediscapacidad: pacienteData.Tienediscapacidad || false,
          Diagnostico: pacienteData.Diagnostico || "",
          Tipo_disc: discapacidadData.Tipo_disc || "",
          Grado_disc: discapacidadData.Grado_disc || "",
          Obs: discapacidadData.Obs || "",
          Iddisc: discapacidadData?.Iddisc || null 
        });
      } catch (error) {
        console.error('Error al obtener el paciente:', error);
        setErrores([{ msg: "Error al cargar los datos del paciente" }]);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPaciente();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaciente({
      ...paciente,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const actualizarPaciente = async (e) => {
    e.preventDefault();
    setErrores([]);
    setIsSubmitting(true);
    
    try {
      // Primero actualizamos la discapacidad si es necesario
      let idDiscapacidad = paciente.Iddisc; // <- usar el Id actual si existe

      if (paciente.Tienediscapacidad) {
        if (paciente.Tipo_disc && paciente.Grado_disc) {
          if (paciente.Iddisc) {
            // actualizar existente
            await axios.put(`http://localhost:5000/api/discapacidad/editar/${paciente.Iddisc}`, {
              Tipo_disc: paciente.Tipo_disc,
              Grado_disc: paciente.Grado_disc,
              Obs: paciente.Obs
            });
            // idDiscapacidad ya es paciente.Iddisc
          } else {
            // crear nueva
            const discResponse = await axios.post("http://localhost:5000/api/discapacidad/registrar", {
              Tipo_disc: paciente.Tipo_disc,
              Grado_disc: paciente.Grado_disc,
              Obs: paciente.Obs
            });
            idDiscapacidad = discResponse.data.Iddisc;
          }
        }
      } else {
        idDiscapacidad = null; // paciente ya no tiene discapacidad
      }      

      // Preparar datos del paciente para actualizar
      const datosActualizacion = {
        Nombre_pac: paciente.Nombre_pac,
        Appaterno_pac: paciente.Appaterno_pac,
        Apmaterno_pac: paciente.Apmaterno_pac,
        Fnaci_pac: paciente.Fnaci_pac,
        Genero_pac: paciente.Genero_pac,
        Ci_pac: paciente.Ci_pac,
        Telefono_pac: paciente.Telefono_pac,
        Direccion_pac: paciente.Direccion_pac,
        Seguro: paciente.Seguro,
        Tienediscapacidad: paciente.Tienediscapacidad,
        Diagnostico: paciente.Diagnostico,
        Iddisc: idDiscapacidad
      };

      await axios.put(`http://localhost:5000/api/paciente/editar/${id}`, datosActualizacion);
      navigate("/pacientes", { state: { success: "Paciente actualizado correctamente" } });
    } catch (error) {
      console.error("Error al actualizar paciente:", error);
      if (error.response?.data?.errors) {
        setErrores(error.response.data.errors);
      } else {
        setErrores([{ msg: "Ocurrió un error al actualizar el paciente" }]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos del paciente...</p>
      </div>
    );
  }

  return (
    <div className="editar-container">
      <div className="card">
        <div className="card-header">
          <h1>Editar Paciente</h1>
          <p>Actualice los datos necesarios</p>
        </div>

        {errores.length > 0 && (
          <div className="alert alert-danger">
            {errores.map((error, index) => (
              <p key={index} className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error.msg}
              </p>
            ))}
          </div>
        )}

        <form className="paciente-form" onSubmit={actualizarPaciente}>
          <div className="form-section">
            <h2>Datos Personales</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre*</label>
                <input
                  type="text"
                  name="Nombre_pac"
                  value={paciente.Nombre_pac}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Apellido Paterno</label>
                <input
                  type="text"
                  name="Appaterno_pac"
                  value={paciente.Appaterno_pac}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Apellido Materno</label>
                <input
                  type="text"
                  name="Apmaterno_pac"
                  value={paciente.Apmaterno_pac}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Fecha de Nacimiento*</label>
                <input
                  type="date"
                  name="Fnaci_pac"
                  value={paciente.Fnaci_pac}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Género*</label>
                <select
                  name="Genero_pac"
                  value={paciente.Genero_pac}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cédula de Identidad*</label>
                <input
                  type="text"
                  name="Ci_pac"
                  value={paciente.Ci_pac}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Información de Contacto</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  name="Telefono_pac"
                  value={paciente.Telefono_pac}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="Direccion_pac"
                  value={paciente.Direccion_pac}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Seguro Médico</label>
                <input
                  type="text"
                  name="Seguro"
                  value={paciente.Seguro}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="Tienediscapacidad"
                  checked={paciente.Tienediscapacidad}
                  onChange={(e) => setPaciente({ ...paciente, Tienediscapacidad: e.target.checked })}
                />
                <span className="checkbox-custom"></span>
                ¿El paciente tiene alguna discapacidad?
              </label>
            </div>

            {paciente.Tienediscapacidad && (
              <div className="discapacidad-section">
                <h3>Información de Discapacidad</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tipo de Discapacidad*</label>
                    <select
                      name="Tipo_disc"
                      value={paciente.Tipo_disc}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="FÍSICA">Física</option>
                      <option value="INTELECTUAL">Intelectual</option>
                      <option value="MÚLTIPLE">Múltiple</option>
                      <option value="VISUAL">Visual</option>
                      <option value="AUDITIVO">Auditivo</option>
                      <option value="MENTAL">Mental</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Grado de Discapacidad*</label>
                    <select
                      name="Grado_disc"
                      value={paciente.Grado_disc}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="Moderado">Moderado</option>
                      <option value="Grave">Grave</option>
                      <option value="Muy Grave">Muy Grave</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Observaciones</label>
                    <textarea
                      name="Obs"
                      value={paciente.Obs}
                      onChange={handleChange}
                      placeholder="Detalles sobre la discapacidad"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-group full-width">
              <label>Diagnóstico</label>
              <textarea
                name="Diagnostico"
                value={paciente.Diagnostico}
                onChange={handleChange}
                placeholder="Diagnóstico actual del paciente"
                rows="4"
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Actualizando...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Actualizar Paciente
                </>
              )}
            </button>
            
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/pacientes')}
            >
              <i className="fas fa-times"></i> Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPaciente;