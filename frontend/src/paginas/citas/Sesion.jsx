import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";
import { NotificationContext } from "../../componentes/NotificationContext";
import Swal from "sweetalert2";
import "./Sesion.css";

const Sesion = () => {
  const location = useLocation();
  const { addNotification } = useContext(NotificationContext);
  const [sesiones, setSesiones] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [tecnicas, setTecnicas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idSesionEditar, setIdSesionEditar] = useState(null);
  const [areas, setAreas] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [tecnicasFiltradas, setTecnicasFiltradas] = useState([]);
  const [tratamientosFiltrados, setTratamientosFiltrados] = useState([]);
  const [condiciones, setCondiciones] = useState([]);
  const [cargandoCondiciones, setCargandoCondiciones] = useState(false);


  // fecha y hora actual
  const obtenerFechaHoraActual = () => {
    const actual = new Date();
    const fecha = actual.toISOString().split("T")[0];
    const horas = String(actual.getHours()).padStart(2, "0");
    const minutos = String(actual.getMinutes()).padStart(2, "0");
    return { fecha, hora: `${horas}:${minutos}` };
  };

  // Estado inicial del formulario
  const [formulario, setFormulario] = useState({
    Idpac: "",
    Idprof: "",
    Fecha: "",
    Hora_ini: "",
    Hora_fin: "",
    Tipo: "Nuevo",
    Atencion: "Dentro de la institución",
    Notas: "",
    Novedades: "",
    Idtrat: "",
    Idtec: [],
    CondicionRehabilitacion: ""
  });

  // Resetear formulario con valores por defecto
  const resetFormulario = () => {
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    const { fecha, hora } = obtenerFechaHoraActual();

    setFormulario({
      Idpac: "",
      Idprof: usuario?.idprof || "",
      Fecha: fecha,
      Hora_ini: hora,
      Hora_fin: "",
      Tipo: "Nuevo",
      Atencion: "Dentro de la institución",
      Notas: "",
      Novedades: "",
      Idtrat: "",
      Idtec: [],
      CondicionRehabilitacion: ""
    });
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const usuario = JSON.parse(sessionStorage.getItem("usuario"));
        const idProf = usuario?.idprof;
        const { fecha, hora } = obtenerFechaHoraActual();

        // Obtener pacientes del profesional usando el nuevo endpoint
        const resPacientes = await axios.get(
          `http://localhost:5000/api/tratamiento/pacientes/${idProf}`
        );

        // Obtener otros datos necesarios
        const [resSesiones, resTratamientos, resProfesionales, resTecnicas] =
          await Promise.all([
            axios.get(
              `http://localhost:5000/api/sesion/listar?include=tecnicas,tratamiento.paciente,prof_salud&Idprof=${idProf}`
            ),
            axios.get(
              `http://localhost:5000/api/tratamiento/listar?Idprof=${idProf}`
            ),
            axios.get("http://localhost:5000/api/prof_salud/listar"),
            axios.get("http://localhost:5000/api/tecnica/listar"),
          ]);

        setSesiones(
          Array.isArray(resSesiones.data.data) ? resSesiones.data.data : []
        );
        setPacientes(resPacientes.data);
        setTratamientos(resTratamientos.data);
        setProfesionales(resProfesionales.data);
        setTecnicas(resTecnicas.data);

        // Establecer valores por defecto
        setFormulario((prev) => ({
          ...prev,
          Idprof: usuario?.idprof || "",
          Fecha: fecha,
          Hora_ini: hora,
        }));

        // Sobreescribir con datos de navegación si existen
        if (location.state) {
          const { Idpac, Idprof, Fecha, Hora_ini } = location.state;
          setFormulario((prev) => ({
            ...prev,
            Idpac: Idpac || "",
            Idprof: Idprof || usuario?.idprof || prev.Idprof,
            Fecha: Fecha || fecha,
            Hora_ini: Hora_ini || hora,
          }));

          if (Idpac) {
            setMostrarModal(true);
            addNotification("info", "Complete los datos de la sesión");
          }
        }

        addNotification("success", "Datos cargados correctamente");
      } catch (err) {
        addNotification(
          "error",
          err.response?.data?.mensaje || "Error al cargar datos"
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [addNotification, location.state]);

  useEffect(() => {
    const cargarCondiciones = async () => {
      try {
        setCargandoCondiciones(true);
        const response = await axios.get("http://localhost:5000/api/condicion/listar");
        setCondiciones(response.data);
      } catch (error) {
        addNotification("error", "Error al cargar condiciones de rehabilitación");
      } finally {
        setCargandoCondiciones(false);
      }
    };

    cargarCondiciones();
  }, [addNotification]);
  useEffect(() => {
    const profesional = profesionales.find(
      (prof) => prof.Idprof === formulario.Idprof
    );
    if (profesional) {
      setAreaSeleccionada(profesional.Idarea);
    } else {
      setAreaSeleccionada("");
    }
  }, [formulario.Idprof, profesionales]);

  const obtenerNombreArea = (idArea) => {
    const area = areas.find((a) => a.Idarea === parseInt(idArea));
    return area ? area.Nombre : "";
  };

  // Cargar áreas y técnicas
  useEffect(() => {
    const cargarAreasYTecnicas = async () => {
      try {
        const [resAreas, resTecnicas] = await Promise.all([
          axios.get("http://localhost:5000/api/area/listar"),
          axios.get("http://localhost:5000/api/tecnica/listar"),
        ]);

        setAreas(resAreas.data);
        setTecnicas(resTecnicas.data);
      } catch (err) {
        addNotification("error", "Error al cargar áreas o técnicas");
      }
    };

    cargarAreasYTecnicas();
  }, [addNotification]);

  // Filtrar tratamientos según paciente seleccionado
  useEffect(() => {
    if (formulario.Idpac) {
      const filtrados = tratamientos.filter(
        (trat) => trat.Idpac === parseInt(formulario.Idpac)
      );
      setTratamientosFiltrados(filtrados);
      if (!filtrados.some((t) => t.Idtrat === parseInt(formulario.Idtrat))) {
        setFormulario((prev) => ({ ...prev, Idtrat: "" }));
      }
    } else {
      setTratamientosFiltrados([]);
      setFormulario((prev) => ({ ...prev, Idtrat: "" }));
    }
  }, [formulario.Idpac, formulario.Idtrat, tratamientos]);

  // Filtrar técnicas según área seleccionada
  useEffect(() => {
    if (areaSeleccionada) {
      const filtradas = tecnicas.filter(
        (tec) => tec.Idarea === parseInt(areaSeleccionada)
      );
      setTecnicasFiltradas(filtradas);
    } else {
      setTecnicasFiltradas([]);
    }
  }, [areaSeleccionada, tecnicas]);

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en técnicas
  const handleTecnicasChange = (e) => {
    const { value, checked } = e.target;
    setFormulario((prev) => {
      if (checked) {
        return { ...prev, Idtec: [...prev.Idtec, parseInt(value)] };
      } else {
        return {
          ...prev,
          Idtec: prev.Idtec.filter((id) => id !== parseInt(value)),
        };
      }
    });
  };

  // Validar formulario antes de enviar
  const validarFormulario = () => {
    if (formulario.Idtec.length === 0) {
      addNotification("warning", "Debe seleccionar al menos una técnica");
      return false;
    }

    if (formulario.Hora_ini >= formulario.Hora_fin) {
      addNotification(
        "warning",
        "La hora de fin debe ser posterior a la de inicio"
      );
      return false;
    }

    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      setCargando(true);

      const datosParaEnviar = {
        ...formulario,
        Idtec: formulario.Idtec,
        Notas: formulario.CondicionRehabilitacion ? 
          ` ${formulario.CondicionRehabilitacion}` : 
          ""
      };

      if (modoEdicion) {
        await axios.put(
          `http://localhost:5000/api/sesion/editar/${idSesionEditar}`,
          datosParaEnviar
        );

        await axios.post(
          `http://localhost:5000/api/sesion/editar/${idSesionEditar}/tecnicas`,
          { Idtec: formulario.Idtec }
        );

        addNotification("success", "Sesión actualizada correctamente");
      } else {
        await axios.post(
          "http://localhost:5000/api/sesion/crear",
          datosParaEnviar
        );
        addNotification("success", "Sesión creada correctamente");
      }

      // Recargar datos
      const resSesiones = await axios.get(
        "http://localhost:5000/api/sesion/listar?include=tecnicas,tratamiento.paciente,profesional"
      );
      setSesiones(
        Array.isArray(resSesiones.data.data) ? resSesiones.data.data : []
      );

      resetFormulario();
      setMostrarModal(false);
    } catch (err) {
      addNotification(
        "error",
        err.response?.data?.mensaje || "Error al procesar la solicitud"
      );
    } finally {
      setCargando(false);
      setModoEdicion(false);
      setIdSesionEditar(null);
    }
  };

  // Eliminar sesión
  const eliminarSesion = async (id) => {
    const result = await Swal.fire({
      title: "¿Está seguro de eliminar esta sesión?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setCargando(true);
      await axios.delete(`http://localhost:5000/api/sesion/eliminar/${id}`);
      setSesiones((prev) => prev.filter((s) => s.Idsesion !== id));
      addNotification("success", "Sesión eliminada correctamente");
    } catch (err) {
      addNotification(
        "error",
        err.response?.data?.mensaje || "Error al eliminar sesión"
      );
    } finally {
      setCargando(false);
    }
  };

  // Editar sesión
  const editarSesion = (sesion) => {
    setModoEdicion(true);
    setIdSesionEditar(sesion.Idsesion);
    
    // Extraer la condición de rehabilitación si existe en las notas
    let condicionRehabilitacion = "";
    if (sesion.Notas && sesion.Notas.startsWith("USUARIO EN REHABILITACIÓN POR: ")) {
      condicionRehabilitacion = sesion.Notas.replace("USUARIO EN REHABILITACIÓN POR: ", "");
    }

    setFormulario({
      Idpac: sesion.Idpac,
      Idprof: sesion.Idprof,
      Fecha: sesion.Fecha,
      Hora_ini: sesion.Hora_ini,
      Hora_fin: sesion.Hora_fin,
      Tipo: sesion.Tipo,
      Atencion: sesion.Atencion || "",
      Notas: "",
      Novedades: sesion.Novedades || "",
      Idtrat: sesion.Idtrat,
      Idtec: sesion.tecnicas ? sesion.tecnicas.map((t) => t.Idtec) : [],
      CondicionRehabilitacion: condicionRehabilitacion || ""
    });
    setMostrarModal(true);
    addNotification("info", "Modo edición activado");
  };

  // Formatear hora para visualización
  const formatearHora = (hora) => {
    if (!hora) return "";
    const [h, m] = hora.split(":");
    return `${h}:${m}`;
  };

  // Obtener nombre completo del paciente
  const obtenerNombrePaciente = (id) => {
    if (!id) return "Sin paciente asignado";
    
    const paciente = pacientes.find((p) => String(p.Idpac) === String(id));
    
    if (!paciente) {
      const sesion = sesiones.find(s => String(s.Idpac) === String(id));
      if (sesion && sesion.tratamiento && sesion.tratamiento.paciente) {
        return `${sesion.tratamiento.paciente.Nombre_pac} ${sesion.tratamiento.paciente.Appaterno_pac} ${sesion.tratamiento.paciente.Apmaterno_pac}`;
      }
    }
    
    return paciente
      ? `${paciente.Nombre_pac} ${paciente.Appaterno_pac} ${paciente.Apmaterno_pac}`
      : "Paciente no encontrado";
  };

  // Obtener nombre completo del profesional
  const obtenerNombreProfesional = (id) => {
    const prof = profesionales.find((p) => p.Idprof === id);
    if (!prof) return "—";
    const { Nombre_prof, Appaterno_prof, Apmaterno_prof } = prof;
    return `${Nombre_prof} ${Appaterno_prof}${
      Apmaterno_prof ? " " + Apmaterno_prof : ""
    }`;
  };

  // Obtener nombres de técnicas aplicadas
  const obtenerNombresTecnicas = (sesion) => {
    if (!sesion || !sesion.tecnicas || sesion.tecnicas.length === 0) {
      return "No asignadas";
    }
    return sesion.tecnicas.map((t) => t.Descripcion).join(", ");
  };

  // Ver detalle de sesión
  const verDetalleSesion = (sesion) => {
    setSesionSeleccionada(sesion);
    setMostrarModalDetalle(true);
    addNotification("info", "Viendo detalles de la sesión");
  };

  // Filtrar sesiones según criterios de búsqueda
  const sesionesFiltradas = sesiones
    .filter((sesion) => {
      const nombreCompleto = obtenerNombrePaciente(sesion.Idpac).toLowerCase();
      const filtroLower = filtro.toLowerCase();
      const coincideTexto = nombreCompleto.includes(filtroLower);

      const fechaSesion = new Date(sesion.Fecha);
      const desde = fechaDesde ? new Date(fechaDesde) : null;
      const hasta = fechaHasta ? new Date(fechaHasta) : null;

      const coincideFecha =
        (!desde || fechaSesion >= desde) && (!hasta || fechaSesion <= hasta);

      return coincideTexto && coincideFecha;
    })
    .sort((a, b) => {
      const fechaA = new Date(a.Fecha);
      const fechaB = new Date(b.Fecha);
      return fechaB - fechaA;
    });

  return (
    <div className="sesion-container">
      <div className="header-container">
        <h1>Gestión de Sesiones Médicas</h1>
        <button
          className="btn-registrar"
          onClick={() => {
            setModoEdicion(false);
            resetFormulario();
            setMostrarModal(true);
            addNotification("info", "Creando nueva sesión");
          }}
        >
          <FaPlus /> Nueva Sesión
        </button>
      </div>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modoEdicion ? "Editar Sesión" : "Registrar Nueva Sesión"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Paciente:</label>
                  <select
                    name="Idpac"
                    value={formulario.Idpac}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione un paciente...</option>
                    {pacientes.map((paciente) => (
                      <option key={paciente.Idpac} value={paciente.Idpac}>
                        {`${paciente.Nombre_pac} ${paciente.Appaterno_pac} ${paciente.Apmaterno_pac}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Profesional:</label>
                  <input
                    type="text"
                    value={
                      obtenerNombreProfesional(formulario.Idprof) ||
                      "Profesional no encontrado"
                    }
                    readOnly
                    className="readonly-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha:</label>
                  <input
                    type="date"
                    name="Fecha"
                    value={formulario.Fecha}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tratamiento:</label>
                  <select
                    name="Idtrat"
                    value={formulario.Idtrat}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione un tratamiento...</option>
                    {tratamientosFiltrados.map((trat) => (
                      <option key={trat.Idtrat} value={trat.Idtrat}>
                        {trat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hora Inicio:</label>
                  <input
                    type="time"
                    name="Hora_ini"
                    value={formulario.Hora_ini}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora Fin:</label>
                  <input
                    type="time"
                    name="Hora_fin"
                    value={formulario.Hora_fin}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tipo:</label>
                  <select
                    name="Tipo"
                    value={formulario.Tipo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Repetido">Repetido</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Atención:</label>
                <select
                  name="Atencion"
                  value={formulario.Atencion}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="Dentro de la institución">
                    Dentro de la institución
                  </option>
                  <option value="Fuera de la institución">
                    Fuera de la institución (atención domiciliaria y/o
                    comunitaria)
                  </option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  {areaSeleccionada
                    ? `Técnicas aplicadas en el área ${obtenerNombreArea(
                        areaSeleccionada
                      )}`
                    : "Seleccione un profesional para ver las técnicas aplicadas"}
                </label>

                <div className="tecnicas-container">
                  {tecnicasFiltradas.length > 0 ? (
                    tecnicasFiltradas.map((tec) => (
                      <div key={tec.Idtec} className="tecnica-checkbox">
                        <input
                          type="checkbox"
                          id={`tecnica-${tec.Idtec}`}
                          value={tec.Idtec}
                          checked={formulario.Idtec.includes(tec.Idtec)}
                          onChange={handleTecnicasChange}
                        />
                        <label htmlFor={`tecnica-${tec.Idtec}`}>
                          {tec.Descripcion}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="no-tecnicas-message">
                      {areaSeleccionada
                        ? "No hay técnicas disponibles para esta área"
                        : "Seleccione un área para ver las técnicas disponibles"}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
          <label>USUARIO EN REHABILITACIÓN POR:</label>
          <select
            name="CondicionRehabilitacion"
            value={formulario.CondicionRehabilitacion}
            onChange={handleInputChange}
            required
            disabled={cargandoCondiciones}
          >
            <option value="">Seleccione una condición...</option>
            {condiciones.map((condicion) => (
              <option key={condicion.id_cond} value={condicion.condicion}>
                {condicion.condicion}
              </option>
            ))}
          </select>
          {cargandoCondiciones && <p>Cargando condiciones...</p>}
        </div>

              <div className="form-group">
                <label>Novedades:</label>
                <textarea
                  name="Novedades"
                  value={formulario.Novedades}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Información adicional sobre la sesión"
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={cargando}
                >
                  {cargando
                    ? "Guardando..."
                    : modoEdicion
                    ? "Actualizar Sesión"
                    : "Guardar Sesión"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setMostrarModal(false);
                    setModoEdicion(false);
                    resetFormulario();
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalDetalle && sesionSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Detalle de Sesión</h2>
            <div className="detalle-sesion">
              <div className="detalle-row">
                <span className="detalle-label">Paciente:</span>
                <span className="detalle-value">
                  {obtenerNombrePaciente(sesionSeleccionada.Idpac)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Fecha Sesión: </span>
                <span className="detalle-value">
                  {sesionSeleccionada.Fecha}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Hora Sesión: </span>
                <span className="detalle-value">
                  {formatearHora(sesionSeleccionada.Hora_ini)} -{" "}
                  {formatearHora(sesionSeleccionada.Hora_fin)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Profesional:</span>
                <span className="detalle-value">
                  {obtenerNombreProfesional(sesionSeleccionada.Idprof)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Tratamiento:</span>
                <span className="detalle-value">
                  {sesionSeleccionada.tratamiento?.nombre ||
                    "No tiene tratamiento"}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Técnicas Aplicadas:</span>
                <span className="detalle-value">
                  {obtenerNombresTecnicas(sesionSeleccionada)}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Estado:</span>
                <span className="detalle-value">{sesionSeleccionada.Tipo}</span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Atención:</span>
                <span className="detalle-value">
                  {sesionSeleccionada.Atencion || "No especificado"}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Condición de Rehabilitación:</span>
                <span className="detalle-value">
                  {sesionSeleccionada.Notas || "No especificado"}
                </span>
              </div>

              <div className="detalle-row">
                <span className="detalle-label">Novedades:</span>
                <span className="detalle-value">
                  {sesionSeleccionada.Novedades || "No hay novedades"}
                </span>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setMostrarModalDetalle(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sesion-list">
        <div className="filtros">
          <div className="filtro-group">
            <label>Buscar:</label>
            <input
              type="text"
              placeholder="Nombre del paciente"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <div className="filtro-group">
            <label>Desde:</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>
          <div className="filtro-group">
            <label>Hasta:</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </div>

        {cargando ? (
          <p>Cargando sesiones...</p>
        ) : (
          <div className="sessions-table">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Técnicas</th>
                  <th>Estado</th>
                  <th>Novedades</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sesionesFiltradas.map((sesion) => (
                  <tr key={sesion.Idsesion}>
                    <td>{obtenerNombrePaciente(sesion.Idpac)}</td>
                    <td>
                      {new Date(
                        sesion.Fecha + "T00:00:00"
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      {formatearHora(sesion.Hora_ini)} -{" "}
                      {formatearHora(sesion.Hora_fin)}
                    </td>
                    <td>{obtenerNombresTecnicas(sesion)}</td>
                    <td>{sesion.Tipo}</td>
                    <td>{sesion.Novedades}</td>

                    <td className="action-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          title="Ver detalles"
                          onClick={() => verDetalleSesion(sesion)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="action-btn edit"
                          title="Editar sesión"
                          onClick={() => editarSesion(sesion)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Eliminar sesión"
                          onClick={() => eliminarSesion(sesion.Idsesion)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sesion;