import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import "./HistorialClinico.css";
import logo from '../../assets/logo.png';

const HistorialClinico = () => {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [tratamientos, setTratamientos] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
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
          { data: discapacidadRes },
          { data: profesionalesRes },
        ] = await Promise.all([
          axios.get(`http://localhost:5000/api/paciente/${id}`),
          axios
            .get(`http://localhost:5000/api/tratamiento/paciente/${id}`)
            .catch(() => ({ data: [] })),
          axios
            .get(`http://localhost:5000/api/sesion/paciente/${id}`)
            .catch(() => ({ data: [] })),
          axios
            .get(`http://localhost:5000/api/discapacidad/paciente/${id}`)
            .catch(() => ({ data: null })),
          axios
            .get("http://localhost:5000/api/prof_salud/listar")
            .catch(() => ({ data: [] })),
        ]);

        setPaciente(pacienteRes.data || pacienteRes);
        setTratamientos(tratamientosRes.data || tratamientosRes);
        setSesiones(sesionesRes.data || sesionesRes);
        setDiscapacidad(discapacidadRes?.discapacidad || discapacidadRes);
        setProfesionales(profesionalesRes.data || profesionalesRes);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.data?.message || err.message || "Error al cargar datos"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const obtenerNombreProfesional = (idProf) => {
    if (!idProf) return "Profesional no especificado";

    const profesional = profesionales.find((p) => p.Idprof === idProf);
    if (!profesional) return "Profesional no encontrado";

    return `${profesional.Nombre_prof} ${profesional.Appaterno_prof}${
      profesional.Apmaterno_prof ? " " + profesional.Apmaterno_prof : ""
    }`;
  };

  const getSesionesPorTratamiento = (idTratamiento) => {
    return sesiones.filter(
      (sesion) =>
        !idTratamiento ||
        String(sesion.tratamiento.Idtrat) === String(idTratamiento)
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const generarPDF = async () => {
    setGeneratingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Margen izquierdo para el contenido
      const marginLeft = 15;
      let yPos = 20;

      // Agregar logo
      try {
        doc.addImage(logo, 'PNG', marginLeft, 10, 30, 15);
      } catch (e) {
        console.log("No se pudo cargar el logo", e);
      }
      
      // Encabezado
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 128);
      doc.text("CENTRO DE REHABILITACIÓN LLALLAGUA", 105, yPos, { align: "center" });
      yPos += 7;
      doc.setFontSize(12);
      doc.text("Municipio Llallagua, Distrito Catavi", 105, yPos, { align: "center" });
      yPos += 7;
      doc.setFontSize(14);
      doc.text("HISTORIA CLÍNICA", 105, yPos, { align: "center" });
      yPos += 15;
      
      
      // Línea divisoria
      doc.setDrawColor(0, 0, 128);
      doc.setLineWidth(0.5);
      doc.line(marginLeft, yPos, 200 - marginLeft, yPos);
      yPos += 10;

      // Sección de datos del paciente
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("DATOS DEL PACIENTE", marginLeft, yPos);
      yPos += 8;
      
      // Datos del paciente sin usar autoTable
      doc.setFont("helvetica", "normal");
      doc.text(`Nombre completo: ${paciente.Nombre_pac} ${paciente.Appaterno_pac} ${paciente.Apmaterno_pac || ""}`, marginLeft, yPos);
      yPos += 7;
      doc.text(`Cédula de identidad: ${paciente.Ci_pac || "No especificada"}`, marginLeft, yPos);
      yPos += 7;
      doc.text(`Fecha de nacimiento: ${formatDate(paciente.Fnaci_pac)} (${calculateAge(paciente.Fnaci_pac)} años)`, marginLeft, yPos);
      yPos += 7;
      doc.text(`Género: ${paciente.Genero_pac === "F" ? "Femenino" : "Masculino"}`, marginLeft, yPos);
      yPos += 7;
      doc.text(`Teléfono: ${paciente.Telefono_pac || "No especificado"}`, marginLeft, yPos);
      yPos += 7;
      doc.text(`Dirección: ${paciente.Direccion_pac || "No especificada"}`, marginLeft, yPos);
      yPos += 7;
      doc.text(`Seguro médico: ${paciente.Seguro || "No especificado"}`, marginLeft, yPos);
      yPos += 7;
      doc.text(`Diagnóstico general: ${paciente.Diagnostico || "No especificado"}`, marginLeft, yPos);
      yPos += 10;

      // Sección de discapacidad
      if (discapacidad) {
        doc.setFont("helvetica", "bold");
        doc.text("INFORMACIÓN DE DISCAPACIDAD", marginLeft, yPos);
        yPos += 8;
        
        doc.setFont("helvetica", "normal");
        doc.text(`Tipo: ${discapacidad.Tipo_disc || discapacidad.tipo || "No especificado"}`, marginLeft, yPos);
        yPos += 7;
        doc.text(`Grado: ${discapacidad.Grado_disc || "No especificado"}`, marginLeft, yPos);
        yPos += 7;
        doc.text(`Observaciones: ${discapacidad.Obs || "Ninguna"}`, marginLeft, yPos);
        yPos += 10;
      }

      // Sección de tratamientos
      if (tratamientos.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("TRATAMIENTOS REALIZADOS", marginLeft, yPos);
        yPos += 8;
        
        tratamientos.forEach((tratamiento, index) => {
          // Verificar espacio en página
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          // Encabezado del tratamiento
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(41, 128, 185);
          doc.text(`Tratamiento ${index + 1}: ${tratamiento.nombre}`, marginLeft, yPos);
          yPos += 7;
          
          // Datos del tratamiento
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          
          doc.text(`Profesional: ${obtenerNombreProfesional(tratamiento.Idprof)}`, marginLeft + 5, yPos);
          yPos += 7;
          doc.text(`Diagnóstico: ${tratamiento.diagnostico || "No especificado"}`, marginLeft + 5, yPos);
          yPos += 7;
          doc.text(`Período: ${formatDate(tratamiento.Fecha_ini)} - ${tratamiento.Fecha_fin ? formatDate(tratamiento.Fecha_fin) : "Actual"}`, marginLeft + 5, yPos);
          yPos += 7;
          doc.text(`Estado: ${tratamiento.Estado || "No especificado"}`, marginLeft + 5, yPos);
          yPos += 7;
          doc.text(`Observaciones: ${tratamiento.Obs || "Ninguna"}`, marginLeft + 5, yPos);
          yPos += 10;
          
          // Sesiones del tratamiento
          const sesionesTratamiento = getSesionesPorTratamiento(tratamiento.Idtrat);
          if (sesionesTratamiento.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text("Sesiones realizadas:", marginLeft + 5, yPos);
            yPos += 7;
            
            sesionesTratamiento.forEach((sesion, sesionIndex) => {
              if (yPos > 250) {
                doc.addPage();
                yPos = 20;
              }
              
              doc.setFont("helvetica", "bold");
              doc.text(`Sesión ${sesionIndex + 1}`, marginLeft + 10, yPos);
              yPos += 7;
              
              doc.setFont("helvetica", "normal");
              doc.text(`Fecha: ${formatDate(sesion.Fecha)}`, marginLeft + 15, yPos);
              yPos += 7;
              doc.text(`Horario: ${sesion.Hora_ini} - ${sesion.Hora_fin}`, marginLeft + 15, yPos);
              yPos += 7;
              doc.text(`Tipo: ${sesion.Tipo || "Sesión"}`, marginLeft + 15, yPos);
              yPos += 7;
              doc.text(`Profesional: ${obtenerNombreProfesional(sesion.Idprof)}`, marginLeft + 15, yPos);
              yPos += 7;
              doc.text(`Atención: ${sesion.Atencion || "Sin detalles"}`, marginLeft + 15, yPos);
              yPos += 7;
              doc.text(`Notas: ${sesion.Notas || "Ninguna"}`, marginLeft + 15, yPos);
              yPos += 7;
              doc.text(`Novedades: ${sesion.Novedades || "Ninguna"}`, marginLeft + 15, yPos);
              yPos += 7;
              
              if (sesion.tecnicas?.length > 0) {
                doc.text(`Técnicas aplicadas: ${sesion.tecnicas.map(t => t.Descripcion).join(", ")}`, marginLeft + 15, yPos);
                yPos += 7;
              }
              
              yPos += 5;
            });
          } else {
            doc.setFont("helvetica", "normal");
            doc.text("No se registraron sesiones para este tratamiento", marginLeft + 5, yPos);
            yPos += 7;
          }
          
          yPos += 10;
        });
      }

      // Pie de página
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `Documento generado el ${new Date().toLocaleDateString("es-ES")}`,
        105,
        285,
        { align: "center" }
      );

      doc.save(`historial_clinico_${paciente.Ci_pac || id}.pdf`);
    } catch (err) {
      console.error("Error generando PDF:", err);
      setError("Error al generar el PDF");
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
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="error-container">
        No se encontraron datos del paciente
      </div>
    );
  }

  return (
    <div className="historial-container">
       <div className="encabezado-flex">
      <header className="historial-header">
        <p className="historial-title">CENTRO DE REHABILITACION LLALLAGUA</p>
        <p className="institution-name">Municipio Llallagua,Distrito Catavi</p>
        <p className="historial-title">HISTORIA CLÍNICA</p>
      </header>
      </div>
      <div className="info-card">
        <h2 className="section-title">DATOS DEL PACIENTE</h2>
        <div className="patient-info-grid">
          <div>
            <p><strong>Nombre completo:</strong> {paciente.Nombre_pac} {paciente.Appaterno_pac} {paciente.Apmaterno_pac || ""}</p>
            <p><strong>Cédula de identidad:</strong> {paciente.Ci_pac || "No especificada"}</p>
            <p><strong>Fecha de nacimiento:</strong> {formatDate(paciente.Fnaci_pac)} ({calculateAge(paciente.Fnaci_pac)} años)</p>
            <p><strong>Género:</strong> {paciente.Genero_pac === "F" ? "Femenino" : "Masculino"}</p>
          </div>
          <div>
            <p><strong>Teléfono:</strong> {paciente.Telefono_pac || "No especificado"}</p>
            <p><strong>Dirección:</strong> {paciente.Direccion_pac || "No especificada"}</p>
            <p><strong>Seguro médico:</strong> {paciente.Seguro || "No especificado"}</p>
            <p><strong>Diagnóstico Inicial:</strong> {paciente.Diagnostico || "No especificado"}</p>
          </div>
        </div>
      </div>

      {discapacidad && (discapacidad.Tipo_disc || discapacidad.tipo) && (
        <div className="info-card">
          <h2 className="section-title">INFORMACIÓN DE DISCAPACIDAD</h2>
          <div className="disability-info">
            <p><strong>Tipo de discapacidad:</strong> {discapacidad.Tipo_disc || discapacidad.tipo || "No especificado"}</p>
            <p><strong>Grado:</strong> {discapacidad.Grado_disc || "No especificado"}</p>
            <p><strong>Observaciones:</strong> {discapacidad.Obs || "Ninguna"}</p>
          </div>
        </div>
      )}

      {tratamientos.length > 0 && (
        <div className="info-card">
          <h2 className="section-title">TRATAMIENTOS REALIZADOS</h2>

          {tratamientos.map((tratamiento, index) => (
            <div key={tratamiento.Idtrat} className="treatment-card">
              <h3 className="treatment-title">Tratamiento {index + 1}: {tratamiento.nombre}</h3>
              
              <div className="treatment-info">
                <p><strong>Realizado por:</strong> {obtenerNombreProfesional(tratamiento.Idprof)}</p>
                {tratamiento.diagnostico && <p><strong>Diagnóstico:</strong> {tratamiento.diagnostico}</p>}
                <p><strong>Período:</strong> {formatDate(tratamiento.Fecha_ini)} - {tratamiento.Fecha_fin ? formatDate(tratamiento.Fecha_fin) : "Actual"}</p>
                <p><strong>Estado:</strong> {tratamiento.Estado || "No especificado"}</p>
                {tratamiento.Razon && <p><strong>Razón de abandono:</strong> {tratamiento.Razon}</p>}
                <p><strong>Observaciones:</strong> {tratamiento.Obs || "Ninguna"}</p>
              </div>

              {getSesionesPorTratamiento(tratamiento.Idtrat).length > 0 && (
                <div className="sessions-container">
                  <h4 className="sessions-title">Sesiones realizadas</h4>
                  <ul className="sessions-list">
                    {getSesionesPorTratamiento(tratamiento.Idtrat).map((sesion, sesionIndex) => (
                      <li key={sesion.Idsesion} className="session-item">
                        <div className="session-header">
                          <span className="session-number">Sesión {sesionIndex + 1}</span>
                          <span className="session-date">{formatDate(sesion.Fecha)}</span>
                        </div>
                        <div className="session-details">
                          <p><strong>Tipo:</strong> {sesion.Tipo || "Sesión"} ({sesion.Hora_ini} - {sesion.Hora_fin})</p>
                          <p><strong>Profesional:</strong> {obtenerNombreProfesional(sesion.Idprof)}</p>
                          {sesion.tecnicas?.length > 0 && (
                            <p><strong>Técnicas aplicadas:</strong> {sesion.tecnicas.map(t => t.Descripcion).join(", ")}</p>
                          )}
                          <p><strong>Atención:</strong> {sesion.Atencion || "No especificado"}</p>
                          {sesion.Notas && <p><strong>Notas:</strong> {sesion.Notas}</p>}
                          {sesion.Novedades && <p><strong>Novedades:</strong> {sesion.Novedades}</p>}
                        </div>
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
        {generatingPDF ? (
          <>
            <i className="fas fa-spinner fa-spin"></i> Generando PDF...
          </>
        ) : (
          <>
            <i className="fas fa-file-pdf"></i> Descargar Historial Clínico
          </>
        )}
      </button>
    </div>
  );
};

export default HistorialClinico;