import React, { useEffect, useState } from 'react';
import clienteApi from '../apis/clienteApi';

const TablaPacientes = () => {
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await clienteApi.get('/pacientes/listar');
        setPacientes(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPacientes();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>CI</th>
          <th>Fecha de Nacimiento</th>
        </tr>
      </thead>
      <tbody>
        {pacientes.map((paciente) => (
          <tr key={paciente.id}>
            <td>{paciente.nombre}</td>
            <td>{paciente.apellido}</td>
            <td>{paciente.ci}</td>
            <td>{paciente.fechaNacimiento}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TablaPacientes;

