import React, { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isBefore,
  addMinutes,
} from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { toast } from "react-toastify";
import "./CalendarioCitas.css";
import { API_URL } from '../config';
// Configuración de localización
const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

Modal.setAppElement("#root");

const CalendarioCitas = () => {
  const DURACION_MINUTOS = 40; // Duración de la cita en minutos
  const DURACION_MS = DURACION_MINUTOS * 60000; // 40 minutos en milisegundos
  const navigate = useNavigate();

  const [citas, setCitas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [profesionales, setProfesionales] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [erroresValidacion, setErroresValidacion] = useState({});

  const initialFormState = {
    fecha_cita: "",
    hora_cita: "",
    Ci_pac: "",
    Idpac: "",
    Idprof: "",
    motivo_cita: "",
    estado_cita: "Programada",
  };

  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const idprof = usuario?.idprof;
  const rol = usuario?.rol;

  const [formularioCita, setFormularioCita] = useState(initialFormState);

  // Cargar citas
  const cargarCitas = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/cita/listar`);
      if (!res.ok) throw new Error("Error al cargar citas");
      const data = await res.json();

      const ahora = new Date();
      const eventos = data.map((cita) => {
        const startDate = new Date(`${cita.fecha_cita}T${cita.hora_cita}`);
        const endDate = new Date(startDate.getTime() + DURACION_MS);
      
        let estado = cita.estado_cita;
        if (isBefore(endDate, ahora) && estado !== "Finalizada") {
          estado = "Ausente";
        }
      
        // Formatear la hora para mostrarla en el título
        const horaFormateada = `${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`;
        
        return {
          id: cita.Idcita,
          title: `${cita.paciente?.Nombre_pac} ${cita.paciente?.Appaterno_pac} ${cita.paciente?.Apmaterno_pac} - ${cita.profesional?.Nombre_prof} ${cita.profesional?.Appaterno_prof}`,
          start: startDate,
          end: endDate,
          estado: estado,
          detalle: cita.motivo_cita,
          area: cita.profesional?.area?.Nombre,
          paciente: cita.paciente,
          profesional: cita.profesional,
          ci_paciente: cita.paciente?.Ci_pac,
          horaFormateada: horaFormateada
        };
      });

      let eventosFiltrados = eventos;
      if (rol === "Medico") {
        eventosFiltrados = eventos.filter(
          (evento) => evento.profesional?.Idprof === idprof
        );
      }

      setCitas(eventosFiltrados);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  }, [DURACION_MS, rol, idprof]);

  // Cargar profesionales
  const cargarProfesionales = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/prof_salud/listar`);
      if (!res.ok) throw new Error("Error al obtener profesionales");
      const data = await res.json();

      if (rol === "Medico") {
        const profesionalActual = data.find((prof) => prof.Idprof === idprof);
        setProfesionales(profesionalActual ? [profesionalActual] : []);
      } else {
        setProfesionales(data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [rol, idprof]);

  useEffect(() => {
    cargarCitas();
    cargarProfesionales();
  }, [cargarCitas, cargarProfesionales]);

  // Función para validar horarios
  const validarHorario = useCallback(
    (fecha, hora, idProfesional, idCitaExistente = null) => {
      const nuevosErrores = {};

      if (!fecha || !hora || !idProfesional) {
        return nuevosErrores;
      }

      const nuevaFechaHora = new Date(`${fecha}T${hora}`);
      const finNuevaCita = addMinutes(nuevaFechaHora, DURACION_MINUTOS);

      // Validar que la cita esté dentro del horario laboral (8:00 - 18:00)
      const horaInicio =
        nuevaFechaHora.getHours() + nuevaFechaHora.getMinutes() / 60;
      const horaFin = finNuevaCita.getHours() + finNuevaCita.getMinutes() / 60;

      if (horaInicio < 8 || horaFin > 18) {
        nuevosErrores.horario =
          "Las citas deben estar dentro del horario laboral (8:00 - 18:00)";
      }

      // Validar choque de horarios
      const conflicto = citas.some((c) => {
        if (String(c.profesional?.Idprof) !== String(idProfesional))
          return false;
        if (idCitaExistente && c.id === idCitaExistente) return false;
        // Verificar superposición de horarios
        return (
          (nuevaFechaHora >= c.start && nuevaFechaHora < c.end) ||
          (finNuevaCita > c.start && finNuevaCita <= c.end) ||
          (nuevaFechaHora <= c.start && finNuevaCita >= c.end)
        );
      });

      if (conflicto) {
        nuevosErrores.horario =
          " Ya existe una cita para ese profesional en ese horario.";
      }

      return nuevosErrores;
    },
    [citas, DURACION_MINUTOS]
  );

  const finalizarCita = async (idCita) => {
    try {
      const res = await fetch(
        `${API_URL}/cita/editar/${idCita}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado_cita: "Finalizada" }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.mensaje || "Error al finalizar la cita");
      }

      toast.success("Cita finalizada correctamente");
      await cargarCitas(); // refrescar calendario
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormularioCita((prev) => ({ ...prev, [name]: value }));

    // Validar en tiempo real cuando se cambian fecha, hora o profesional
    if (name === "fecha_cita" || name === "hora_cita" || name === "Idprof") {
      const nuevosErrores = validarHorario(
        name === "fecha_cita" ? value : formularioCita.fecha_cita,
        name === "hora_cita" ? value : formularioCita.hora_cita,
        name === "Idprof" ? value : formularioCita.Idprof,
        modoEdicion ? citaSeleccionada?.id : null
      );
      setErroresValidacion(nuevosErrores);
    }

    // Buscar paciente por CI en tiempo real y mostrar nombre
    if (name === "Ci_pac" && value.trim().length > 0) {
      fetch(`${API_URL}/paciente/buscar?ci=${value}`)
        .then((res) => res.json())
        .then((data) =>
          setNombrePaciente(
            `${data.Nombre_pac} ${data.Appaterno_pac} ${data.Apmaterno_pac}`
          )
        )
        .catch(() => setNombrePaciente(""));
    } else if (name === "Ci_pac") {
      setNombrePaciente("");
    }
  };

  // Guardar cita
  const handleGuardarCita = async (e) => {
    e.preventDefault();
    setCargando(true);

    // Validar horario antes de enviar
    const errores = validarHorario(
      formularioCita.fecha_cita,
      formularioCita.hora_cita,
      rol === "Medico" ? idprof : formularioCita.Idprof,
      modoEdicion ? citaSeleccionada?.id : null
    );

    if (Object.keys(errores).length > 0) {
      setErroresValidacion(errores);
      toast.error("Por favor, corrija los errores en el formulario");
      setCargando(false);
      return;
    }

    try {
      let idpacFinal = formularioCita.Idpac;

      // Si no hay Idpac, buscar por CI
      if (!idpacFinal && formularioCita.Ci_pac) {
        const resPac = await fetch(
          `${API_URL}/paciente/buscar?ci=${formularioCita.Ci_pac}`
        );
        if (!resPac.ok)
          throw new Error("Paciente no encontrado. Verifique el CI.");
        const paciente = await resPac.json();
        idpacFinal = paciente.Idpac;
      }

      const datosCita =
        rol === "Medico" && !modoEdicion
          ? { ...formularioCita, Idprof: idprof, Idpac: idpacFinal }
          : { ...formularioCita, Idpac: idpacFinal };

      const url = modoEdicion
        ? `${API_URL}/cita/editar/${citaSeleccionada.id}`
        : `${API_URL}/cita/crear`;
      const method = modoEdicion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosCita),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.mensaje || "Error al guardar la cita");
      }

      toast.success(
        `Cita ${modoEdicion ? "actualizada" : "creada"} correctamente`
      );
      setMostrarFormulario(false);
      setModoEdicion(false);
      setFormularioCita(initialFormState);
      setNombrePaciente("");
      setErroresValidacion({});
      await cargarCitas();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  const eventStyleGetter = (event) => {
    let className = "evento-default";
    if (event.estado === "Programada") className = "evento-programada";
    else if (event.estado === "Finalizada") className = "evento-finalizada";
    else if (event.estado === "Ausente") className = "evento-ausente";

    return { className };
  };

  const citasFiltradas = citas.filter(
    (cita) => filtroEstado === "todos" || cita.estado === filtroEstado
  );

  const redirigirASesion = (idPac, idProf, fecha, hora) => {
    navigate("/sesion", {
      state: { Idpac: idPac, Idprof: idProf, Fecha: fecha, Hora_ini: hora },
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
              const formInicial =
                rol === "Medico"
                  ? { ...initialFormState, Idprof: idprof }
                  : initialFormState;
              setFormularioCita(formInicial);
              setNombrePaciente("");
              setErroresValidacion({});
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
          className="calendario-responsive"
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
              <span>{citaSeleccionada.horaFormateada}</span>
            </div>
            <div className="detalle-item">
              <strong>Estado:</strong>
              <span
                className={`badge-estado ${citaSeleccionada.estado.toLowerCase()}`}
              >
                {citaSeleccionada.estado}
              </span>
            </div>
            <div className="detalle-item">
              <strong>Motivo:</strong>
              <span>{citaSeleccionada.detalle}</span>
            </div>

            <div className="modal-acciones">
              <button
                onClick={async () => {
                  await finalizarCita(citaSeleccionada.id);
                  redirigirASesion(
                    citaSeleccionada.paciente?.Idpac,
                    citaSeleccionada.profesional?.Idprof,
                    format(citaSeleccionada.start, "yyyy-MM-dd"),
                    format(citaSeleccionada.start, "HH:mm")
                  );
                }}
                className="btn-registrar-sesion"
              >
                Registrar Sesión
              </button>

              {(rol === "Administrador" || rol === "Medico") && (
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
                    setErroresValidacion({});
                  }}
                  className="btn-editar-cita"
                >
                  Editar Cita
                </button>
              )}
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
          setNombrePaciente("");
          setErroresValidacion({});
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
            setNombrePaciente("");
            setErroresValidacion({});
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
              disabled={modoEdicion || rol === "Medico"}
            >
              <option value="">Seleccionar Profesional</option>
              {profesionales.map((prof) => (
                <option key={prof.Idprof} value={prof.Idprof}>
                  {prof.Nombre_prof} {prof.Appaterno_prof} {prof.Apmaterno_prof}
                </option>
              ))}
            </select>
            {rol === "Medico" && (
              <p className="info-text">
                No puedes asignar profesional solo lo hace el Administrador
              </p>
            )}
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
              {erroresValidacion.horario && (
                <span className="error-message">
                  {erroresValidacion.horario}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>CI del Paciente:</label>
            <input
              type="text"
              name="Ci_pac"
              value={formularioCita.Ci_pac}
              onChange={handleInputChange}
              required={!modoEdicion}
              placeholder="Ingrese CI del paciente"
            />
            {nombrePaciente && (
              <p className="info-text">Paciente: {nombrePaciente}</p>
            )}
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
              disabled={cargando || Object.keys(erroresValidacion).length > 0}
            >
              {cargando
                ? "Guardando..."
                : modoEdicion
                ? "Actualizar"
                : "Guardar"}
            </button>

            <button
              type="button"
              className="btn-cancelar"
              onClick={() => {
                setMostrarFormulario(false);
                setModoEdicion(false);
                setFormularioCita(initialFormState);
                setErroresValidacion({});
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
