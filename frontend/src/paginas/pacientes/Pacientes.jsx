import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Pacientes.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);

  // Función para calcular edad
  const calcularEdad = (fechaNacStr) => {
    if (!fechaNacStr) return "Sin fecha";

    const hoy = new Date();
    const nacimiento = new Date(fechaNacStr);

    let edadAnios = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    const dia = hoy.getDate() - nacimiento.getDate();

    if (mes < 0 || (mes === 0 && dia < 0)) {
      edadAnios--;
    }

    if (edadAnios < 1) {
      let edadMeses =
        hoy.getMonth() -
        nacimiento.getMonth() +
        (hoy.getDate() >= nacimiento.getDate() ? 0 : -1);
      if (edadMeses < 0) edadMeses += 12;
      return `${edadMeses} meses`;
    }

    return `${edadAnios} años`;
  };

  // Obtener la lista de pacientes al cargar la página
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/paciente/listar"
        );
        setPacientes(response.data);
      } catch (error) {
        console.error("Error al obtener pacientes:", error);
      }
    };

    fetchPacientes();
  }, []);

  // Eliminar paciente
  const eliminarPaciente = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/paciente/eliminar/${id}`
      );

      if (response.status === 200) {
        setPacientes(pacientes.filter((paciente) => paciente.Idpac !== id));
        alert("Paciente eliminado correctamente");
      } else {
        alert("No se pudo eliminar al paciente");
      }
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      alert(`Hubo un problema al eliminar al paciente: ${error.message}`);
    }
  };

  return (
    <div className="pacientes-container">
      <h1>Gestión de Pacientes</h1>

      <Link to="/pacientes/registrar" className="btn-agregar">
        + Agregar Paciente
      </Link>
      <p />

      <table className="pacientes-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Sexo</th>
            <th>Edad</th>
            <th>CI</th>
            <th>Teléfono</th>
            <th>Diagnóstico</th>
            <th>PcD</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((paciente) => (
            <tr key={paciente.Idpac}>
              <td>{`${paciente.Nombre_pac} ${paciente.Appaterno_pac || ""} ${paciente.Apmaterno_pac || ""}`}</td>
              <td>{paciente.Genero_pac}</td>
              <td>{calcularEdad(paciente.Fnaci_pac)}</td>
              <td>{paciente.Ci_pac}</td>
              <td>{paciente.Telefono_pac}</td>
              <td>{paciente.Diagnostico}</td>
              <td>
                {paciente.Tienediscapacidad?.toLowerCase() === "sí" ? "Sí" : "No"}
              </td>
              <td>
                <Link
                  to={`/pacientes/editar/${paciente.Idpac}`}
                  className="icon-button edit-btn"
                  title="Editar"
                >
                  <button className="edit-btn">
                    <FaEdit />
                  </button>
                </Link>

                <button
                  className="icon-button delete-btn"
                  title="Eliminar"
                  onClick={() => eliminarPaciente(paciente.Idpac)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pacientes;

