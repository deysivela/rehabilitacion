import React, { useEffect, useState } from 'react';
import './CitaMedica.css';

const CitaMedica = () => {
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/cita/listar')
      .then(res => res.json())
      .then(data => setCitas(data));
  }, []);

  return (
    <div className="cita-container">
      <h2>Citas Médicas</h2>
      <table className="cita-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th>Paciente</th>
            <th>Profesional</th>
          </tr>
        </thead>
        <tbody>
          {citas.map(cita => (
            <tr key={cita.Idcita}>
              <td>{cita.fecha_cita}</td>
              <td>{cita.hora_cita}</td>
              <td>{cita.motivo_cita}</td>
              <td>{cita.estado_cita}</td>
              <td>{cita.paciente?.Nombre_pac}</td>
              <td>{cita.profesional?.Nombre_prof}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CitaMedica;
