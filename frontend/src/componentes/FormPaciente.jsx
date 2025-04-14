import React, { useState } from 'react';
import clienteApi from '../apis/clienteApi';

const FormPaciente = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    fechaNacimiento: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await clienteApi.post('/pacientes/registrar', form);
      alert('Paciente registrado con éxito');
    } catch (error) {
      console.error(error);
      alert('Error al registrar paciente');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
      <input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} required />
      <input type="text" name="ci" placeholder="CI" onChange={handleChange} required />
      <input type="date" name="fechaNacimiento" onChange={handleChange} required />
      <button type="submit">Registrar</button>
    </form>
  );
};

export default FormPaciente;
