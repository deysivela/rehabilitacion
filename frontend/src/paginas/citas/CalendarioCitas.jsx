import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarioCitas.css';

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CalendarioCitas = () => {
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [formularioCita, setFormularioCita] = useState({
    fecha_cita: '',
    hora_cita: '',
    Ci_pac: '',
    Idpac: '',
    Idprof: '',
    motivo_cita: '',
    estado_cita: 'Programada',
    duracion: 30, // 👉 Añadido: valor inicial 30 minutos
  });
  const [profesionales, setProfesionales] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/cita/listar')
      .then((res) => res.json())
      .then((data) => {
        const eventos = data.map((cita) => {
          const duracion = cita.duracion || 90; // Usa la duración de la cita, si no hay, pone 90 minutos
          const startDate = new Date(`${cita.fecha_cita}T${cita.hora_cita}`);
          const endDate = new Date(startDate.getTime() + duracion * 60000);

          return {
            id: cita.Idcita,
            title: `${cita.profesional?.nombreCompleto} - ${cita.paciente?.nombreCompleto}`,
            start: startDate,
            end: endDate,
            estado: cita.estado_cita,
            detalle: cita.motivo_cita,
            area: cita.profesional?.area?.Nombre,
          };
        });
        setCitas(eventos);
      });

    // Obtener lista de profesionales
    fetch('http://localhost:5000/api/prof_salud/listar')
      .then((res) => res.json())
      .then((data) => {
        setProfesionales(data);
      })
      .catch((error) => {
        console.error('Error al obtener profesionales:', error);
      });
  }, []);

  const cargarHorasOcupadas = async (Idprof, fecha_cita) => {
    if (!Idprof || !fecha_cita) return;
    try {
      const res = await fetch(`http://localhost:5000/api/cita/horas-ocupadas?Idprof=${Idprof}&fecha_cita=${fecha_cita}`);
      const data = await res.json();
      setHorasOcupadas(data.horas || []);
    } catch (error) {
      console.error('Error al cargar horas ocupadas:', error);
    }
  };

  const eventStyleGetter = (event) => {
    let className = '';
    switch (event.estado) {
      case 'Programada':
        className = 'evento-programada';
        break;
      case 'Finalizada':
        className = 'evento-finalizada';
        break;
      case 'Ausente':
        className = 'evento-ausente';
        break;
      default:
        className = 'evento-default';
        break;
    }
    return { className };
  };

  const handleSelectEvent = (event) => {
    setCitaSeleccionada(event);
    setMostrarModal(true);
  };

  const cerrarModal = () => setMostrarModal(false);

  const handleCrearCita = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('http://localhost:5000/api/cita/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formularioCita), 
      });

      if (respuesta.ok) {
        alert('Cita creada exitosamente');
        setMostrarFormulario(false);
        setFormularioCita({
          fecha_cita: '',
          hora_cita: '',
          Ci_pac: '',
          Idpac: '',
          Idprof: '',
          motivo_cita: '',
          estado_cita: 'Programada',
          duracion: 30,
        });

        // Refrescar citas
        const dataActualizada = await fetch('http://localhost:5000/api/cita/listar').then((res) => res.json());
        const eventos = dataActualizada.map((cita) => {
          const duracion = cita.duracion || 90;
          const startDate = new Date(`${cita.fecha_cita}T${cita.hora_cita}`);
          const endDate = new Date(startDate.getTime() + duracion * 60000);
          return {
            id: cita.Idcita,
            title: `${cita.profesional?.nombreCompleto} - ${cita.paciente?.nombreCompleto}`,
            start: startDate,
            end: endDate,
            estado: cita.estado_cita,
            detalle: cita.motivo_cita,
            area: cita.profesional?.area?.Nombre,
          };
        });
        setCitas(eventos);
      } else {
        const error = await respuesta.json();
        alert(error.mensaje || 'Error al crear la cita');
      }
    } catch (error) {
      console.error('Error al crear cita:', error);
      alert('Error en la conexión');
    }
  };

  const handleCiChange = (e) => {
    const Ci_pac = e.target.value;
    setFormularioCita((prev) => ({
      ...prev,
      Ci_pac: Ci_pac,
    }));

    if (Ci_pac.length > 0) {
      fetch(`http://localhost:5000/api/paciente/buscar?ci=${Ci_pac}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.Idpac) {
            setFormularioCita((prev) => ({
              ...prev,
              Idpac: data.Idpac,
            }));
          } else {
            alert('Paciente no encontrado');
          }
        })
        .catch((error) => {
          console.error('Error al buscar paciente:', error);
          alert('Error al buscar el paciente');
        });
    }
  };

  const generarHorasDisponibles = () => {
    const horas = [];
    for (let h = 8; h <= 17; h++) {
      const hora = `${h.toString().padStart(2, '0')}:00`;
      if (!horasOcupadas.includes(hora)) {
        horas.push(hora);
      }
    }
    return horas;
  };

  return (
    <div style={{ width: '80vw', height: '90vh', padding: '10px' }}>
      <button onClick={() => setMostrarFormulario(true)} className="btn-agregar-cita">
        Agregar Cita
      </button>

      <Calendar
        localizer={localizer}
        events={citas}
        defaultView="week"
        views={['week']}
        step={60}
        timeslots={1}
        min={new Date(2023, 0, 1, 8, 0)}
        max={new Date(2023, 0, 1, 18, 0)}
        style={{ width: '100%', height: '100%' }}
        culture="es"
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        messages={{
          today: 'Hoy',
          previous: 'Atrás',
          next: 'Siguiente',
        }}
      />

      {/* Modal Detalles */}
      {mostrarModal && citaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-cerrar" onClick={cerrarModal}>X</button>
            <h3>Detalles de la Cita</h3>
            <p><strong>Profesional:</strong> {citaSeleccionada.title.split(' - ')[0]}</p>
            <p><strong>Área:</strong> {citaSeleccionada.area}</p>
            <p><strong>Paciente:</strong> {citaSeleccionada.title.split(' - ')[1]}</p>
            <p><strong>Fecha:</strong> {citaSeleccionada.start.toLocaleDateString()}</p>
            <p><strong>Hora:</strong> {citaSeleccionada.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Estado:</strong> {citaSeleccionada.estado}</p>
            <p><strong>Motivo:</strong> {citaSeleccionada.detalle}</p>
          </div>
        </div>
      )}

      {/* Modal Crear */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-cerrar" onClick={() => setMostrarFormulario(false)}>X</button>
            <h3>Agregar Nueva Cita</h3>
            <form onSubmit={handleCrearCita}>
              <input
                type="date"
                value={formularioCita.fecha_cita}
                onChange={(e) => {
                  const nuevaFecha = e.target.value;
                  setFormularioCita({ ...formularioCita, fecha_cita: nuevaFecha });
                  cargarHorasOcupadas(formularioCita.Idprof, nuevaFecha);
                }}
                required
              />
              <select
                value={formularioCita.hora_cita}
                onChange={(e) => setFormularioCita({ ...formularioCita, hora_cita: e.target.value })}
                required
              >
                <option value="">Seleccionar Hora</option>
                {generarHorasDisponibles().map((hora) => (
                  <option key={hora} value={hora}>{hora}</option>
                ))}
              </select>

              <input
                type="number"
                min="10"
                step="10"
                placeholder="Duración (min)"
                value={formularioCita.duracion}
                onChange={(e) => setFormularioCita({ ...formularioCita, duracion: parseInt(e.target.value) })}
                required
              />

              <input
                type="text"
                placeholder="CI del Paciente"
                value={formularioCita.Ci_pac}
                onChange={handleCiChange}
                required
              />

              <select
                value={formularioCita.Idprof}
                onChange={(e) => {
                  const nuevoIdprof = e.target.value;
                  setFormularioCita({ ...formularioCita, Idprof: nuevoIdprof });
                  cargarHorasOcupadas(nuevoIdprof, formularioCita.fecha_cita);
                }}
                required
              >
                <option value="">Seleccionar Profesional</option>
                {profesionales.map((prof) => (
                  <option key={prof.Idprof} value={prof.Idprof}>
                    {prof.Nombre_prof} {prof.Appaterno_prof} {prof.Apmaterno_prof}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Motivo"
                value={formularioCita.motivo_cita}
                onChange={(e) => setFormularioCita({ ...formularioCita, motivo_cita: e.target.value })}
                required
              />
              <select
                value={formularioCita.estado_cita}
                onChange={(e) => setFormularioCita({ ...formularioCita, estado_cita: e.target.value })}
              >
                <option value="Programada">Programada</option>
                <option value="Finalizada">Finalizada</option>
                <option value="Ausente">Ausente</option>
              </select>

              <button type="submit">Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioCitas;
