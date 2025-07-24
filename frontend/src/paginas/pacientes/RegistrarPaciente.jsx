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
    try {
      let idDiscapacidad = null;
      // Si tiene discapacidad, registrarla primero
      if (nuevoPaciente.Tienediscapacidad) {
        const discResponse = await axios.post("http://localhost:5000/api/discapacidad/registrar", {
          Tipo_disc: nuevoPaciente.Tipo_disc,
          Grado_disc: nuevoPaciente.Grado_disc,
          Obs: nuevoPaciente.Obs,
        });
        idDiscapacidad = discResponse.data.Iddisc;
      }
      // Preparar el objeto paciente con el idDiscapacidad si existe
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
        Tienediscapacidad:nuevoPaciente.Tienediscapacidad,
        Iddisc:idDiscapacidad,
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