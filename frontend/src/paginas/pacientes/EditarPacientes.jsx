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
  });

  const [errores, setErrores] = useState([]);

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/paciente/${id}`);
        const data = response.data;
        // Extraer los datos de discapacidad si existen
        const discapacidadData = data.detalleDiscapacidad || {};  // Asegúrate de usar el alias correcto
  
        setPaciente({
          Nombre_pac: data.Nombre_pac || "",
          Appaterno_pac: data.Appaterno_pac || "",
          Apmaterno_pac: data.Apmaterno_pac || "",
          Fnaci_pac: data.Fnaci_pac ? data.Fnaci_pac.substring(0, 10) : "",
          Genero_pac: data.Genero_pac || "",
          Ci_pac: data.Ci_pac || "",
          Telefono_pac: data.Telefono_pac || "",
          Direccion_pac: data.Direccion_pac || "",
          Seguro: data.Seguro || "",
          Tienediscapacidad: data.Tienediscapacidad || false,
          Diagnostico: data.Diagnostico || "",
          Tipo_disc: discapacidadData.Tipo_disc || "",
          Grado_disc: discapacidadData.Grado_disc || "",
          Obs: discapacidadData.Obs || "",
        });
      } catch (error) {
        console.error('Error al obtener el paciente:', error);
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
    try {
      await axios.put(`http://localhost:5000/api/paciente/editar/${id}`, paciente);
      navigate("/pacientes");
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrores(error.response.data.errors);
      } else {
        console.error("Error al actualizar paciente:", error);
      }
    }
  };

  return (
    <div className="editar-container">
      <h1>Editar Paciente</h1>

      {errores.length > 0 && (
        <div className="error-messages">
          {errores.map((error, index) => (
            <p key={index}>{error.msg}</p>
          ))}
        </div>
      )}

      <form className="paciente-form" onSubmit={actualizarPaciente}>
        <input
          type="text"
          name="Nombre_pac"
          value={paciente.Nombre_pac}
          onChange={handleChange}
          placeholder="Nombre"
          required
        />
        <input
          type="text"
          name="Appaterno_pac"
          value={paciente.Appaterno_pac}
          onChange={handleChange}
          placeholder="Apellido Paterno"
        />
        <input
          type="text"
          name="Apmaterno_pac"
          value={paciente.Apmaterno_pac}
          onChange={handleChange}
          placeholder="Apellido Materno"
        />
        <input
          type="date"
          name="Fnaci_pac"
          value={paciente.Fnaci_pac}
          onChange={handleChange}
          required
        />
        <select
          name="Genero_pac"
          value={paciente.Genero_pac}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar Género</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>
        <input
          type="text"
          name="Ci_pac"
          value={paciente.Ci_pac}
          onChange={handleChange}
          placeholder="Cédula de Identidad"
          required
        />
        <input
          type="text"
          name="Telefono_pac"
          value={paciente.Telefono_pac}
          onChange={handleChange}
          placeholder="Teléfono"
        />
        <input
          type="text"
          name="Direccion_pac"
          value={paciente.Direccion_pac}
          onChange={handleChange}
          placeholder="Dirección"
        />
        <input
          type="text"
          name="Seguro"
          value={paciente.Seguro}
          onChange={handleChange}
          placeholder="Seguro Médico"
        />

        <label>
          ¿Tiene discapacidad?
          <input
            type="checkbox"
            checked={paciente.Tienediscapacidad}
            onChange={(e) =>
              setPaciente({ ...paciente, Tienediscapacidad: e.target.checked })
            }
          />
        </label>
        
        {paciente.Tienediscapacidad && (
          <div className="discapacidad-info">
            <select
              name="Tipo_disc"
              value={paciente.Tipo_disc}
              onChange={handleChange}
            >
              <option value="">Seleccionar tipo de discapacidad</option>
              <option value="FÍSICA">Física</option>
              <option value="INTELECTUAL">Intelectual</option>
              <option value="MÚLTIPLE">Múltiple</option>
              <option value="VISUAL">Visual</option>
              <option value="AUDITIVO">Auditivo</option>
              <option value="MENTAL">Mental</option>
            </select>

            <select
              name="Grado_disc"
              value={paciente.Grado_disc}
              onChange={handleChange}
            >
              <option value="">Seleccionar grado de discapacidad</option>
              <option value="Moderado">Moderado</option>
              <option value="Grave">Grave</option>
              <option value="Muy Grave">Muy Grave</option>
            </select>

            <textarea
              name="Obs"
              value={paciente.Obs}
              onChange={handleChange}
              placeholder="Detalles sobre la discapacidad"
            ></textarea>
          </div>
        )}

        <textarea
          name="Diagnostico"
          value={paciente.Diagnostico}
          onChange={handleChange}
          placeholder="Diagnóstico"
        ></textarea>

        <button type="submit">Actualizar</button>
      </form>
    </div>
  );
};

export default EditarPaciente;


