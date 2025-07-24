import React, { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaCalendarAlt } from "react-icons/fa";
import "./CalendarioCitas.css";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Configuración de localización
const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Configurar el modal para accesibilidad
Modal.setAppElement("#root");

const CalendarioCitas = () => {
  const DURACION_MS = 60 * 60000; // 60 minutos
  const navigate = useNavigate();

  // Estados
  const [citas, setCitas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [profesionales, setProfesionales] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Estado inicial del formulario
  const initialFormState = {
    fecha_cita: "",
    hora_cita: "",
    Ci_pac: "",
    Idpac: "",
    Idprof: "",
    motivo_cita: "",
    estado_cita: "Programada",
  };

  const [formularioCita, setFormularioCita] = useState(initialFormState);

  // Cargar datos
  const cargarCitas = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:5000/api/cita/listar");
      if (!res.ok) throw new Error("Error al cargar citas");
      const data = await res.json();
      
      const ahora = new Date();
      const eventos = data.map((cita) => {
        const startDate = new Date(`${cita.fecha_cita}T${cita.hora_cita}`);
        const endDate = new Date(startDate.getTime() + DURACION_MS);
        
        // Actualizar estado si la cita ya pasó y no fue finalizada
        let estado = cita.estado_cita;
        if (isBefore(endDate, ahora) && estado !== "Finalizada") {
          estado = "Ausente";
          // Opcional: podrías hacer un PUT aquí para actualizar el estado en el backend
        }
        
        return {
          id: cita.Idcita,
          title: `${cita.profesional?.Nombre_prof} ${cita.profesional?.Appaterno_prof} - ${cita.paciente?.Nombre_pac} ${cita.paciente?.Appaterno_pac}`,
          start: startDate,
          end: endDate,
          estado: estado,
          detalle: cita.motivo_cita,
          area: cita.profesional?.area?.Nombre,
          paciente: cita.paciente,
          profesional: cita.profesional,
          ci_paciente: cita.paciente?.Ci_pac,
        };
      });
      
      setCitas(eventos);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  }, [DURACION_MS]);

  const cargarProfesionales = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/prof_salud/listar");
      if (!res.ok) throw new Error("Error al obtener profesionales");
      const data = await res.json();
      setProfesionales(data);
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  useEffect(() => {
    cargarCitas();
    cargarProfesionales();
  }, [cargarCitas, cargarProfesionales]);

  // Manejo de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormularioCita(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardarCita = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    const url = modoEdicion
      ? `http://localhost:5000/api/cita/editar/${citaSeleccionada.id}`
      : "http://localhost:5000/api/cita/crear";
    const method = modoEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formularioCita),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.mensaje || "Error al guardar la cita");
      }

      toast.success(`Cita ${modoEdicion ? "actualizada" : "creada"} correctamente`);
      setMostrarFormulario(false);
      setModoEdicion(false);
      setFormularioCita(initialFormState);
      await cargarCitas();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Estilos para eventos
  const eventStyleGetter = (event) => {
    let className = "evento-default";
    if (event.estado === "Programada") className = "evento-programada";
    else if (event.estado === "Finalizada") className = "evento-finalizada";
    else if (event.estado === "Ausente") className = "evento-ausente";
    
    return { className };
  };

  // Filtrado de citas
  const citasFiltradas = citas.filter(cita => 
    filtroEstado === "todos" || cita.estado === filtroEstado
  );

  // Navegación
  const redirigirASesion = (idPac, idProf, fecha, hora) => {
    navigate("/sesion", { 
      state: { 
        Idpac: idPac, 
        Idprof: idProf, 
        Fecha: fecha, 
        Hora_ini: hora 
      } 
    });
  };

  return (
    <div className="calendario-container">
      <div className="header-calendario">
        <h1>
          <FaCalendarAlt /> Gestión de Citas
        </h1>
        
        <div className="controles-superiores">
          <button
            onClick={() => {
              setMostrarFormulario(true);
              setModoEdicion(false);
              setFormularioCita(initialFormState);
            }}
            className="btn-agregar-cita"
            disabled={cargando}
          >
            {cargando ? "Cargando.." : "Agendar "}
          </button>
          
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="filtro-estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="Programada">Programadas</option>
            <option value="Finalizada">Finalizadas</option>
            <option value="Ausente">Ausentes</option>
          </select>
        </div>
      </div>

      <div className="calendario-grid">
        <div className="calendario-wrapper">
          <Calendar
            localizer={localizer}
            events={citasFiltradas}
            defaultView="week"
            views={["week", "day", "agenda"]}
            step={60}
            timeslots={1}
            min={new Date(0, 0, 0, 8, 0)}
            max={new Date(0, 0, 0, 18, 0)}
            scrollToTime={new Date(0, 0, 0, 8, 0)}
            style={{ height: "80vh" }}
            culture="es"
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => {
              setCitaSeleccionada(event);
              setMostrarModal(true);
            }}
            messages={{
              today: "Hoy",
              previous: "Atrás",
              next: "Siguiente",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay citas en este rango de fechas.",
            }}
            allDaySlot={false}
          />
        </div>
      </div>

      {/* Modal de detalles */}
      <Modal
        isOpen={mostrarModal}
        onRequestClose={() => setMostrarModal(false)}
        className="modal-detalles"
        overlayClassName="modal-overlay"
      >
        <button className="modal-cerrar" onClick={() => setMostrarModal(false)}>
          &times;
        </button>
        <h3>Detalles de la Cita</h3>
        
        {citaSeleccionada && (
          <div className="detalles-cita">
            <div className="detalle-item">
              <strong>Profesional:</strong>
              <span>{citaSeleccionada.title.split(" - ")[0]}</span>
            </div>
            <div className="detalle-item">
              <strong>Área:</strong>
              <span>{citaSeleccionada.area}</span>
            </div>
            <div className="detalle-item">
              <strong>Paciente:</strong>
              <span>{citaSeleccionada.title.split(" - ")[1]}</span>
            </div>
            <div className="detalle-item">
              <strong>Fecha:</strong>
              <span>{format(citaSeleccionada.start, "dd/MM/yyyy")}</span>
            </div>
            <div className="detalle-item">
              <strong>Hora:</strong>
              <span>{format(citaSeleccionada.start, "HH:mm")}</span>
            </div>
            <div className="detalle-item">
              <strong>Estado:</strong>
              <span className={`badge-estado ${citaSeleccionada.estado.toLowerCase()}`}>
                {citaSeleccionada.estado}
              </span>
            </div>
            <div className="detalle-item">
              <strong>Motivo:</strong>
              <span>{citaSeleccionada.detalle}</span>
            </div>
            
            <div className="modal-acciones">
              <button
                onClick={() => {
                  redirigirASesion(
                    citaSeleccionada.paciente?.Idpac,
                    citaSeleccionada.profesional?.Idprof,
                    format(citaSeleccionada.start, "yyyy-MM-dd"),
                    format(citaSeleccionada.start, "HH:mm")
                  );
                }}
                className="btn-registrar-sesion"
                disabled={citaSeleccionada.estado !== "Programada"}
              >
                Registrar Sesión
              </button>
              
              <button
                onClick={() => {
                  setFormularioCita({
                    fecha_cita: format(citaSeleccionada.start, "yyyy-MM-dd"),
                    hora_cita: format(citaSeleccionada.start, "HH:mm"),
                    motivo_cita: citaSeleccionada.detalle,
                    estado_cita: citaSeleccionada.estado,
                    Idprof: citaSeleccionada.profesional?.Idprof || "",
                    Ci_pac: citaSeleccionada.ci_paciente || "",
                    Idpac: citaSeleccionada.paciente?.Idpac || "",
                  });
                  setModoEdicion(true);
                  setMostrarFormulario(true);
                  setMostrarModal(false);
                }}
                className="btn-editar-cita"
              >
                Editar Cita
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de formulario */}
      <Modal
        isOpen={mostrarFormulario}
        onRequestClose={() => {
          setMostrarFormulario(false);
          setModoEdicion(false);
          setFormularioCita(initialFormState);
        }}
        className="modal-formulario"
        overlayClassName="modal-overlay"
      >
        <button 
          className="modal-cerrar" 
          onClick={() => {
            setMostrarFormulario(false);
            setModoEdicion(false);
            setFormularioCita(initialFormState);
          }}
        >
          &times;
        </button>
        
        <h3>{modoEdicion ? "Editar Cita" : "Agendar Nueva Cita"}</h3>
        
        <form onSubmit={handleGuardarCita}>
          <div className="form-group">
            <label>Profesional:</label>
            <select
              name="Idprof"
              value={formularioCita.Idprof}
              onChange={handleInputChange}
              required
              disabled={modoEdicion}
            >
              <option value="">Seleccionar Profesional</option>
              {profesionales.map((prof) => (
                <option key={prof.Idprof} value={prof.Idprof}>
                  {prof.Nombre_prof} {prof.Appaterno_prof} {prof.Apmaterno_prof}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Fecha:</label>
              <input
                type="date"
                name="fecha_cita"
                value={formularioCita.fecha_cita}
                onChange={handleInputChange}
                required
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            
            <div className="form-group">
              <label>Hora:</label>
              <input
                type="time"
                name="hora_cita"
                value={formularioCita.hora_cita}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>CI del Paciente:</label>
            <input
              type="text"
              name="Ci_pac"
              value={formularioCita.Ci_pac}
              required={!modoEdicion}
              disabled={modoEdicion}
              placeholder="Ingrese CI del paciente"
            />
          </div>
          
          <div className="form-group">
            <label>Motivo:</label>
            <textarea
              name="motivo_cita"
              value={formularioCita.motivo_cita}
              onChange={handleInputChange}
              required
              placeholder="Descripción del motivo de la cita"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Estado:</label>
            <select
              name="estado_cita"
              value={formularioCita.estado_cita}
              onChange={handleInputChange}
              required
            >
              <option value="Programada">Programada</option>
              <option value="Finalizada">Finalizada</option>
              <option value="Ausente">Ausente</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-guardar"
              disabled={cargando}
            >
              {cargando ? "Guardando..." : modoEdicion ? "Actualizar" : "Guardar"}
            </button>
            
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => {
                setMostrarFormulario(false);
                setModoEdicion(false);
                setFormularioCita(initialFormState);
              }}
              disabled={cargando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CalendarioCitas;