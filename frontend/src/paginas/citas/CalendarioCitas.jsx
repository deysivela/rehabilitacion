import React, { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarioCitas.css";
import { useNavigate } from "react-router-dom";

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CalendarioCitas = () => {
  const DURACION_MS = 60 * 60000;
  const navigate = useNavigate();

  const [citas, setCitas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [profesionales, setProfesionales] = useState([]);
  const [formularioCita, setFormularioCita] = useState({
    fecha_cita: "",
    hora_cita: "",
    Ci_pac: "",
    Idpac: "",
    Idprof: "",
    motivo_cita: "",
    estado_cita: "Programada",
  });

  const citasOrdenadas = [...citas].sort((a, b) => b.start - a.start);

  const cargarCitas = useCallback(async () => {
    const res = await fetch("http://localhost:5000/api/cita/listar");
    const data = await res.json();
    const eventos = data.map((cita) => {
      const startDate = new Date(`${cita.fecha_cita}T${cita.hora_cita}`);
      const endDate = new Date(startDate.getTime() + DURACION_MS);
    
      // Determinar si la cita ya pasó y no fue finalizada
      const ahora = new Date();
      let estado = cita.estado_cita;
    
      if (endDate < ahora && estado !== "Finalizada") {
        estado = "Ausente";
      }
    
      return {
        id: cita.Idcita,
        title: `${cita.profesional?.nombreCompleto} - ${cita.paciente?.nombreCompleto}`,
        start: startDate,
        end: endDate,
        estado: estado,
        detalle: cita.motivo_cita,
        area: cita.profesional?.area?.Nombre,
        paciente: cita.paciente,
      };
    });
    
    setCitas(eventos);
  }, [DURACION_MS]);

  useEffect(() => {
    cargarCitas();
    fetch("http://localhost:5000/api/prof_salud/listar")
      .then((res) => res.json())
      .then(setProfesionales)
      .catch((error) => console.error("Error al obtener profesionales:", error));
  }, [cargarCitas]);

  const handleGuardarCita = async (e) => {
    e.preventDefault();
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

      if (res.ok) {
        alert(`Cita ${modoEdicion ? "actualizada" : "creada"} correctamente`);
        setMostrarFormulario(false);
        setModoEdicion(false);
        setFormularioCita({
          fecha_cita: "",
          hora_cita: "",
          Ci_pac: "",
          Idpac: "",
          Idprof: "",
          motivo_cita: "",
          estado_cita: "Programada",
        });
        cargarCitas();
      } else {
        const error = await res.json();
        alert(error.mensaje || "Error al guardar la cita");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  const eliminarCita = async (id) => {
    if (!window.confirm("¿Deseas eliminar esta cita?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/cita/eliminar/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Cita eliminada correctamente");
        setCitas((prev) => prev.filter((cita) => cita.id !== id));
      } else {
        alert("Error al eliminar la cita");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la cita");
    }
  };

  const abrirModalEditar = (cita) => {
    setFormularioCita({
      fecha_cita: cita.start.toISOString().split("T")[0],
      hora_cita: cita.start.toTimeString().slice(0, 5),
      motivo_cita: cita.detalle,
      estado_cita: cita.estado,
      Idprof: profesionales.find((p) =>
        cita.title.includes(p.Nombre_prof)
      )?.Idprof || "",
      Ci_pac: cita.paciente?.Ci_pac || "",
      Idpac: cita.paciente?.Idpac || "",
    });
    setModoEdicion(true);
    setCitaSeleccionada(cita);
    setMostrarFormulario(true);
  };

  const handleCiChange = (e) => {
    const Ci_pac = e.target.value;
    setFormularioCita((prev) => ({ ...prev, Ci_pac }));
    if (Ci_pac.length > 0) {
      fetch(`http://localhost:5000/api/paciente/buscar?ci=${Ci_pac}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.Idpac) {
            setFormularioCita((prev) => ({ ...prev, Idpac: data.Idpac }));
          } else {
            alert("Paciente no encontrado");
          }
        })
        .catch(() => alert("Error al buscar el paciente"));
    }
  };

  const eventStyleGetter = (event) => {
    let className = "evento-default";
    if (event.estado === "Programada") className = "evento-programada";
    else if (event.estado === "Finalizada") className = "evento-finalizada";
    else if (event.estado === "Ausente") className = "evento-ausente";
  
    return { className };
  };
  

  const abrirModal = (cita) => {
    setCitaSeleccionada(cita);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setCitaSeleccionada(null);
    setMostrarModal(false);
  };

  const redirigirASesion = (idCita) => {
    navigate("/sesion", { state: { Idcita: idCita } });
  };

  return (
    <div style={{ width: "80vw", height: "90vh", padding: "10px" }}>
      <button
        onClick={() => {
          setMostrarFormulario(true);
          setModoEdicion(false);
          setFormularioCita({
            fecha_cita: "",
            hora_cita: "",
            Ci_pac: "",
            Idpac: "",
            Idprof: "",
            motivo_cita: "",
            estado_cita: "Programada",
          });
        }}
        className="btn-agregar-cita"
      >
        Agendar Cita
      </button>

      <Calendar
        localizer={localizer}
        events={citas}
        defaultView="week"
        views={["week"]}
        step={60}
        timeslots={1}
        min={new Date(0, 0, 0, 8, 0)}
        max={new Date(0, 0, 0, 18, 0)}
        scrollToTime={new Date(0, 0, 0, 8, 0)}
        style={{ width: "100%", height: "100%" }}
        culture="es"
        eventPropGetter={eventStyleGetter}
        onSelectEvent={abrirModal}
        messages={{ today: "Hoy", previous: "Atrás", next: "Siguiente" }}
        allDaySlot={false}
      />

      {mostrarModal && citaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-cerrar" onClick={cerrarModal}>X</button>
            <h3>Detalles de la Cita</h3>
            <p><strong>Profesional:</strong> {citaSeleccionada.title.split(" - ")[0]}</p>
            <p><strong>Área:</strong> {citaSeleccionada.area}</p>
            <p><strong>Paciente:</strong> {citaSeleccionada.title.split(" - ")[1]}</p>
            <p><strong>Fecha:</strong> {citaSeleccionada.start.toLocaleDateString()}</p>
            <p><strong>Hora:</strong> {citaSeleccionada.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            <p><strong>Estado:</strong> {citaSeleccionada.estado}</p>
            <p><strong>Motivo:</strong> {citaSeleccionada.detalle}</p>
            <button
              onClick={() => redirigirASesion(citaSeleccionada.id)}
              className="btn-registrar-sesion"
            >
              Registrar Sesión
            </button>
          </div>
        </div>
      )}

      <h2>Lista de Citas</h2>
      <table>
        <thead>
          <tr>
            <th>Profesional</th>
            <th>Paciente</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Motivo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {citasOrdenadas.map((cita) => (
            <tr key={cita.id}>
              <td>{cita.title.split(" - ")[0]}</td>
              <td>{cita.title.split(" - ")[1]}</td>
              <td>{cita.start.toLocaleDateString()}</td>
              <td>{cita.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
              <td>{cita.estado}</td>
              <td>{cita.detalle}</td>
              <td>
                <button onClick={() => abrirModalEditar(cita)}>✏️</button>
                <button onClick={() => eliminarCita(cita.id)}>🗑️</button>
                <button onClick={() => redirigirASesion(cita.id)}>➕ </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-cerrar" onClick={() => setMostrarFormulario(false)}>X</button>
            <h3>{modoEdicion ? "Editar Cita" : "Agregar Nueva Cita"}</h3>
            <form onSubmit={handleGuardarCita}>
              <select value={formularioCita.Idprof} onChange={(e) => setFormularioCita({ ...formularioCita, Idprof: e.target.value })} required>
                <option value="">Seleccionar Profesional</option>
                {profesionales.map((prof) => (
                  <option key={prof.Idprof} value={prof.Idprof}>
                    {prof.Nombre_prof} {prof.Appaterno_prof} {prof.Apmaterno_prof}
                  </option>
                ))}
              </select>
              <input type="date" value={formularioCita.fecha_cita} onChange={(e) => setFormularioCita({ ...formularioCita, fecha_cita: e.target.value })} required />
              <input type="time" value={formularioCita.hora_cita} onChange={(e) => setFormularioCita({ ...formularioCita, hora_cita: e.target.value })} required />
              <input type="text" placeholder="CI del Paciente" value={formularioCita.Ci_pac} onChange={handleCiChange} required={!modoEdicion} />
              <input type="text" placeholder="Motivo" value={formularioCita.motivo_cita} onChange={(e) => setFormularioCita({ ...formularioCita, motivo_cita: e.target.value })} required />
              <select value={formularioCita.estado_cita} onChange={(e) => setFormularioCita({ ...formularioCita, estado_cita: e.target.value })}>
                <option value="Programada">Programada</option>
                <option value="Finalizada">Finalizada</option>
                <option value="Ausente">Ausente</option>
              </select>
              <button type="submit">{modoEdicion ? "Actualizar" : "Guardar"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioCitas;
