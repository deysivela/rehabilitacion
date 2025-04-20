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
    // Campos relacionados con discapacidad
    Tipo_disc: "",
    Grado_disc: "",
    Obs: "",
  });
  const [errores, setErrores] = useState([]);

  // Manejar el cambio de campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoPaciente({
      ...nuevoPaciente,
      [name]: type === "checkbox" ? checked : value,
    });

    // Si se marca la discapacidad, podemos mostrar los campos adicionales
    if (name === "Discapacidad" && checked) {
      // Consultar a la base de datos para obtener información adicional
      DiscapacidadInfo();
    }
  };

  const DiscapacidadInfo = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/discapacidad", // Asegúrate que la URL y la ruta estén correctas
        {
          params: { idPaciente: nuevoPaciente.Ci_pac }, // Asegúrate de que el parámetro esté bien definido
        }
      );

      // Si la respuesta es exitosa, actualizar el estado con la información
      setNuevoPaciente({
        ...nuevoPaciente,
        Tipo_disc: response.data.Tipo_disc,
        Grado_disc: response.data.Grado_disc,
        Obs: response.data.Obs,
      });
    } catch (error) {
      console.error("Error al obtener la información de discapacidad:", error);
    }
  };

  // Manejar la creación de un nuevo paciente
  const registrar = async (e) => {
    e.preventDefault();
    setErrores([]);
    try {
      // Enviar todos los datos del paciente, incluyendo la discapacidad si está marcada
      const response = await axios.post(
        "http://localhost:5000/api/paciente/registrar",
        nuevoPaciente // Enviar el objeto completo con los datos
      );

      // Si el paciente se registró exitosamente, registrar los detalles de la discapacidad
      if (nuevoPaciente.Tienediscapacidad) {
        await axios.post("http://localhost:5000/api/discapacidad/registrar", {
          Idpac: response.data.Idpac, // Usar el ID del paciente recién creado
          Tipo_disc: nuevoPaciente.Tipo_disc,
          Grado_disc: nuevoPaciente.Grado_disc,
          Obs: nuevoPaciente.Obs,
        });
      }

      navigate("/pacientes"); // Redirigir a la lista de pacientes después de registrar
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrores(error.response.data.errors);
      } else {
        console.error("Error al registrar paciente:", error);
      }
    }
  };
  return (
    <div className="registrar-container">
      <h1>Registrar Nuevo Paciente</h1>
      {errores.length > 0 && (
        <div className="error-messages">
          {errores.map((error, index) => (
            <p key={index}>{error.msg}</p>
          ))}
        </div>
      )}
      <form className="paciente-form" onSubmit={registrar}>
        <input
          type="text"
          name="Nombre_pac"
          value={nuevoPaciente.Nombre_pac}
          onChange={handleChange}
          placeholder="Nombre"
          required
        />
        <input
          type="text"
          name="Appaterno_pac"
          value={nuevoPaciente.Appaterno_pac}
          onChange={handleChange}
          placeholder="Apellido Paterno"
        />
        <input
          type="text"
          name="Apmaterno_pac"
          value={nuevoPaciente.Apmaterno_pac}
          onChange={handleChange}
          placeholder="Apellido Materno"
        />
        <input
          type="date"
          name="Fnaci_pac"
          value={nuevoPaciente.Fnaci_pac}
          onChange={handleChange}
          required
        />
        <select
          name="Genero_pac"
          value={nuevoPaciente.Genero_pac}
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
          value={nuevoPaciente.Ci_pac}
          onChange={handleChange}
          placeholder="Cédula de Identidad"
          required
        />
        <input
          type="text"
          name="Telefono_pac"
          value={nuevoPaciente.Telefono_pac}
          onChange={handleChange}
          placeholder="Teléfono"
        />
        <input
          type="text"
          name="Direccion_pac"
          value={nuevoPaciente.Direccion_pac}
          onChange={handleChange}
          placeholder="Dirección"
        />
        <input
          type="text"
          name="Seguro"
          value={nuevoPaciente.Seguro}
          onChange={handleChange}
          placeholder="Seguro Médico"
        />
        <label>
          <input
            type="checkbox"
            name="Tienediscapacidad"
            checked={nuevoPaciente.Tienediscapacidad}
            onChange={handleChange}
          />
          Discapacidad
        </label>

        {nuevoPaciente.Tienediscapacidad && (
          <div className="discapacidad-info">
            <select
              name="Tipo_disc"
              value={nuevoPaciente.Tipo_disc}
              onChange={handleChange}
            >
              <option value="">Seleccionar tipo de discapacidad</option>
              <option value="FÍSICA">Física</option>
              <option value="INTELECTUAL">Intelectual</option>
              <option value="MÚLTIPLE">Múltiple</option>
              <option value="VISUAL">Visual</option>
              {/* Agregar otros tipos de discapacidad si es necesario */}
            </select>

            <select
              name="Grado_disc"
              value={nuevoPaciente.Grado_disc}
              onChange={handleChange}
            >
              <option value="">Seleccionar grado de discapacidad</option>
              <option value="Moderado">Moderado</option>
              <option value="Grave">Grave</option>
              <option value="Muy Grave">Muy Grave</option>
            </select>

            <textarea
              name="Obs"
              value={nuevoPaciente.Obs}
              onChange={handleChange}
              placeholder="Detalles sobre la discapacidad"
            ></textarea>
          </div>
        )}
        <textarea
          name="Diagnostico"
          value={nuevoPaciente.Diagnostico}
          onChange={handleChange}
          placeholder="Diagnóstico"
        ></textarea>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default RegistrarPaciente;
