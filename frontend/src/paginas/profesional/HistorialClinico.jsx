import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import "./HistorialClinico.css";

const HistorialClinico = () => {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [tratamientos, setTratamientos] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [discapacidad, setDiscapacidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [
          { data: pacienteRes },
          { data: tratamientosRes },
          { data: sesionesRes },
          { data: discapacidadRes }
        ] = await Promise.all([
          axios.get(`http://localhost:5000/api/paciente/${id}`),
          axios.get(`http://localhost:5000/api/tratamiento/paciente/${id}`).catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/api/sesion/paciente/${id}`).catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/api/discapacidad/paciente/${id}`).catch(() => ({ data: null }))
        ]);

        setPaciente(pacienteRes.data || pacienteRes);
        setTratamientos(tratamientosRes.data || tratamientosRes);
        setSesiones(sesionesRes.data || sesionesRes);
        setDiscapacidad(discapacidadRes?.discapacidad || discapacidadRes);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getSesionesPorTratamiento = (idTratamiento) => {
    return sesiones.filter(sesion => sesion.Idtrat === idTratamiento);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const generarPDF = async () => {
    setGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      let yPos = 10;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 128);
      doc.text(`HISTORIAL CLÍNICO`, 105, yPos, null, null, 'center');
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL PACIENTE', 14, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Nombre completo: ${paciente.Nombre_pac} ${paciente.Appaterno_pac} ${paciente.Apmaterno_pac || ''}`, 14, yPos);
      yPos += 7;
      doc.text(`Cédula de identidad: ${paciente.Ci_pac || 'No especificada'}`, 14, yPos);
      yPos += 7;
      doc.text(`Fecha de nacimiento: ${formatDate(paciente.Fnaci_pac)} (${new Date().getFullYear() - new Date(paciente.Fnaci_pac).getFullYear()} años)`, 14, yPos);
      yPos += 7;
      doc.text(`Género: ${paciente.Genero_pac === 'F' ? 'Femenino' : 'Masculino'}`, 14, yPos);
      yPos += 7;
      doc.text(`Teléfono: ${paciente.Telefono_pac || 'No especificado'}`, 14, yPos);
      yPos += 7;
      doc.text(`Dirección: ${paciente.Direccion_pac || 'No especificada'}`, 14, yPos);
      yPos += 7;
      doc.text(`Seguro médico: ${paciente.Seguro || 'No especificado'}`, 14, yPos);
      yPos += 7;
      doc.text(`Diagnóstico general: ${paciente.Diagnostico || 'No especificado'}`, 14, yPos);
      yPos += 10;
      
      if (discapacidad) {
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMACIÓN DE DISCAPACIDAD', 14, yPos);
        yPos += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Tipo: ${discapacidad.Tipo_disc || discapacidad.tipo || 'No especificado'}`, 14, yPos);
        yPos += 7;
        doc.text(`Grado: ${discapacidad.Grado_disc || 'No especificado'}`, 14, yPos);
        yPos += 7;
        doc.text(`Observaciones: ${discapacidad.Obs || 'Ninguna'}`, 14, yPos);
        yPos += 10;
      }
      
      if (tratamientos.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('TRATAMIENTOS REALIZADOS', 14, yPos);
        yPos += 8;
        
        doc.setFont('helvetica', 'normal');
        tratamientos.forEach(tratamiento => {
          doc.text(`• ${tratamiento.razon}`, 14, yPos);
          yPos += 7;
          doc.text(`  Diagnóstico: ${tratamiento.diagnostico || 'No especificado'}`, 20, yPos);
          yPos += 7;
          doc.text(`  Período: ${formatDate(tratamiento.Fecha_ini)} - ${tratamiento.Fecha_fin ? formatDate(tratamiento.Fecha_fin) : 'Actual'}`, 20, yPos);
          yPos += 7;
          doc.text(`  Estado: ${tratamiento.Estado || 'No especificado'}`, 20, yPos);
          yPos += 7;
          doc.text(`  Observaciones: ${tratamiento.Obs || 'Ninguna'}`, 20, yPos);
          yPos += 7;
          
          const sesionesTratamiento = getSesionesPorTratamiento(tratamiento.Idtrat);
          if (sesionesTratamiento.length > 0) {
            doc.text(`  Sesiones realizadas:`, 20, yPos);
            yPos += 7;
            
            sesionesTratamiento.forEach(sesion => {
              doc.text(`  - ${sesion.Tipo || 'Sesión'} (${sesion.Hora_ini} - ${sesion.Hora_fin}): ${sesion.Atencion || 'Sin detalles'}`, 25, yPos);
              yPos += 7;
              if (sesion.Notas) {
                doc.text(`    Notas: ${sesion.Notas}`, 30, yPos);
                yPos += 7;
              }
              if (sesion.Novedades) {
                doc.text(`    Novedades: ${sesion.Novedades}`, 30, yPos);
                yPos += 7;
              }
              yPos += 3;
            });
          } else {
            doc.text(`  No se registraron sesiones para este tratamiento`, 20, yPos);
            yPos += 7;
          }
          
          yPos += 5;
        });
      }
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Documento generado el ${new Date().toLocaleDateString('es-ES')}`, 105, 285, null, null, 'center');
      
      doc.save(`historial_clinico_${paciente.Ci_pac || id}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      setError('Error al generar el PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando datos del paciente...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error: {error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }
  
  if (!paciente) {
    return <div className="error-container">No se encontraron datos del paciente</div>;
  }

  return (
    <div className="historial-container">
      <h1 className="historial-title">
        HISTORIAL CLÍNICO
      </h1>
      
      <div className="patient-info-section">
        <h2 className="section-title">DATOS DEL PACIENTE</h2>
        <p><strong>Nombre completo:</strong> {paciente.Nombre_pac} {paciente.Appaterno_pac} {paciente.Apmaterno_pac || ''}</p>
        <p><strong>Cédula de identidad:</strong> {paciente.Ci_pac || 'No especificada'}</p>
        <p><strong>Fecha de nacimiento:</strong> {formatDate(paciente.Fnaci_pac)} ({new Date().getFullYear() - new Date(paciente.Fnaci_pac).getFullYear()} años)</p>
        <p><strong>Género:</strong> {paciente.Genero_pac === 'F' ? 'Femenino' : 'Masculino'}</p>
        <p><strong>Teléfono:</strong> {paciente.Telefono_pac || 'No especificado'}</p>
        <p><strong>Dirección:</strong> {paciente.Direccion_pac || 'No especificada'}</p>
        <p><strong>Seguro médico:</strong> {paciente.Seguro || 'No especificado'}</p>
        <p><strong>Diagnóstico general:</strong> {paciente.Diagnostico || 'No especificado'}</p>
      </div>
      
      {discapacidad && (
        <div className="disability-info-section">
          <h2 className="section-title">INFORMACIÓN DE DISCAPACIDAD</h2>
          <p><strong>Tipo:</strong> {discapacidad.Tipo_disc || discapacidad.tipo || 'No especificado'}</p>
          <p><strong>Grado:</strong> {discapacidad.Grado_disc || 'No especificado'}</p>
          <p><strong>Observaciones:</strong> {discapacidad.Obs || 'Ninguna'}</p>
        </div>
      )}
      
      {tratamientos.length > 0 && (
        <div className="treatments-section">
          <h2 className="section-title">TRATAMIENTOS REALIZADOS</h2>
          
          {tratamientos.map(tratamiento => (
            <div key={tratamiento.Idtrat} className="treatment-card">
              <h3 className="treatment-title">{tratamiento.razon}</h3>
              <p><strong>Diagnóstico:</strong> {tratamiento.diagnostico || 'No especificado'}</p>
              <p><strong>Período:</strong> {formatDate(tratamiento.Fecha_ini)} - {tratamiento.Fecha_fin ? formatDate(tratamiento.Fecha_fin) : 'Actual'}</p>
              <p><strong>Estado:</strong> {tratamiento.Estado || 'No especificado'}</p>
              <p><strong>Observaciones:</strong> {tratamiento.Obs || 'Ninguna'}</p>
              
              {getSesionesPorTratamiento(tratamiento.Idtrat).length > 0 && (
                <div className="sessions-container">
                  <h4 className="sessions-title">Sesiones realizadas</h4>
                  <ul className="sessions-list">
                    {getSesionesPorTratamiento(tratamiento.Idtrat).map(sesion => (
                      <li key={sesion.Idsesion} className="session-item">
                        <p><strong>{sesion.Tipo || 'Sesión'}</strong> ({sesion.Hora_ini} - {sesion.Hora_fin})</p>
                        <p><strong>Atención:</strong> {sesion.Atencion || 'No especificado'}</p>
                        {sesion.Notas && <p><strong>Notas:</strong> {sesion.Notas}</p>}
                        {sesion.Novedades && <p><strong>Novedades:</strong> {sesion.Novedades}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={generarPDF}
        disabled={generatingPDF}
        className="pdf-button"
      >
        {generatingPDF ? 'Generando PDF...' : 'Descargar Historial Clínico'}
      </button>
    </div>
  );
};

export default HistorialClinico;