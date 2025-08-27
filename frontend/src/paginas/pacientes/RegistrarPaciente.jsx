import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RegistrarPaciente.css";

const RegistrarPaciente = () => {
  const navigate = useNavigate();
  const [nuevoPaciente, setNuevoPaciente] = useState({
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
  });
  
  const [errores, setErrores] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoPaciente({
      ...nuevoPaciente,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const registrar = async (e) => {
    e.preventDefault();
    setErrores([]);
    setIsSubmitting(true);
    
    try {
      let idDiscapacidad = null;
      if (nuevoPaciente.Tienediscapacidad) {
        const discResponse = await axios.post("http://localhost:5000/api/discapacidad/registrar", {
          Tipo_disc: nuevoPaciente.Tipo_disc,
          Grado_disc: nuevoPaciente.Grado_disc,
          Obs: nuevoPaciente.Obs,
        });
        idDiscapacidad = discResponse.data.Iddisc;
      }

      const datosPaciente = {
        Nombre_pac: nuevoPaciente.Nombre_pac,
        Appaterno_pac: nuevoPaciente.Appaterno_pac,
        Apmaterno_pac: nuevoPaciente.Apmaterno_pac,
        Fnaci_pac: nuevoPaciente.Fnaci_pac,
        Genero_pac: nuevoPaciente.Genero_pac,
        Ci_pac: nuevoPaciente.Ci_pac,
        Telefono_pac: nuevoPaciente.Telefono_pac,
        Direccion_pac: nuevoPaciente.Direccion_pac,
        Seguro: nuevoPaciente.Seguro,
        Diagnostico: nuevoPaciente.Diagnostico,
        Tienediscapacidad: nuevoPaciente.Tienediscapacidad,
        Iddisc: idDiscapacidad,
        discapacidad: nuevoPaciente.Tienediscapacidad ? {
          Tipo_disc: nuevoPaciente.Tipo_disc,
          Grado_disc: nuevoPaciente.Grado_disc,
          Obs: nuevoPaciente.Obs,
        } : null
      };

      await axios.post("http://localhost:5000/api/paciente/registrar", datosPaciente);
      navigate("/pacientes");
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrores(error.response.data.errors);
      } else {
        console.error("Error al registrar paciente o discapacidad:", error);
        setErrores([{ msg: "Ocurrió un error al registrar el paciente" }]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registrar-container">
      <div className="card">
        <div className="card-header">
          <h1>Registrar Nuevo Paciente</h1>
          <p>Complete todos los campos requeridos</p>
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

        <form className="paciente-form" onSubmit={registrar}>
          <div className="form-section">
            <h2>Datos Personales</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre*</label>
                <input
                  type="text"
                  name="Nombre_pac"
                  value={nuevoPaciente.Nombre_pac}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Apellido Paterno*</label>
                <input
                  type="text"
                  name="Appaterno_pac"
                  value={nuevoPaciente.Appaterno_pac}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Apellido Materno</label>
                <input
                  type="text"
                  name="Apmaterno_pac"
                  value={nuevoPaciente.Apmaterno_pac}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Fecha de Nacimiento*</label>
                <input
                  type="date"
                  name="Fnaci_pac"
                  value={nuevoPaciente.Fnaci_pac}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Género*</label>
                <select
                  name="Genero_pac"
                  value={nuevoPaciente.Genero_pac}
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
                  value={nuevoPaciente.Ci_pac}
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
                <label>Teléfono*</label>
                <input
                  type="text"
                  name="Telefono_pac"
                  value={nuevoPaciente.Telefono_pac}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="Direccion_pac"
                  value={nuevoPaciente.Direccion_pac}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Seguro Médico</label>
                <input
                  type="text"
                  name="Seguro"
                  value={nuevoPaciente.Seguro}
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
                  checked={nuevoPaciente.Tienediscapacidad}
                  onChange={handleChange}
                />
                <span className="checkbox-custom"></span>
                ¿El paciente tiene alguna discapacidad?
              </label>
            </div>

            {nuevoPaciente.Tienediscapacidad && (
              <div className="discapacidad-section">
                <h3>Información de Discapacidad</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tipo de Discapacidad</label>
                    <select
                      name="Tipo_disc"
                      value={nuevoPaciente.Tipo_disc}
                      onChange={handleChange}
                    >
                      <option value="">Seleccione...</option>
                      <option value="FÍSICA">Física</option>
                      <option value="INTELECTUAL">Intelectual</option>
                      <option value="MÚLTIPLE">Múltiple</option>
                      <option value="VISUAL">Visual</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Grado de Discapacidad</label>
                    <select
                      name="Grado_disc"
                      value={nuevoPaciente.Grado_disc}
                      onChange={handleChange}
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
                      value={nuevoPaciente.Obs}
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
              <label>Diagnóstico Inicial</label>
              <textarea
                name="Diagnostico"
                value={nuevoPaciente.Diagnostico}
                onChange={handleChange}
                placeholder="Describa el diagnóstico inicial del paciente"
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
                  <i className="fas fa-spinner fa-spin"></i> Registrando...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Registrar Paciente
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

export default RegistrarPaciente;