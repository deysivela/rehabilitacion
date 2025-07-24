import React, { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaEdit,
  FaSearch,
  FaUser,
  FaVenusMars,
  FaCalendarAlt,
  FaIdCard,
  FaPhone,
  FaWheelchair,
  FaTimes,
  FaEye,
  FaFileMedical,
  FaPlusCircle,
} from "react-icons/fa";
import "./Profesionales.css";

const Profesionales = () => {
  const [pacientes, setPacientes] = useState([]);
  const [discapacidades, setDiscapacidades] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroDiscapacidad, setFiltroDiscapacidad] = useState("todos");
  const [rangoEdad, setRangoEdad] = useState({ min: "", max: "" });
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);

  const navigate = useNavigate();

  // Obtener ID del profesional logueado
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const idProfesionalLogeado = usuario?.idprof;

  // Función para calcular edad con años y meses
  const calcularEdadCompleta = (fechaNacStr) => {
    if (!fechaNacStr) return { años: "-", meses: "-", texto: "-" };

    try {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacStr);

      let años = hoy.getFullYear() - nacimiento.getFullYear();
      let meses = hoy.getMonth() - nacimiento.getMonth();

      if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
        años--;
        meses += 12;
      }

      if (hoy.getDate() < nacimiento.getDate()) {
        meses--;
        if (meses < 0) {
          meses = 11;
        }
      }

      if (años < 1) {
        return {
          años: 0,
          meses,
          texto: `${meses} ${meses === 1 ? "mes" : "meses"}`,
        };
      } else {
        return {
          años,
          meses,
          texto: `${años} ${años === 1 ? "año" : "años"}`,
        };
      }
    } catch (error) {
      console.error("Error calculando edad:", error);
      return { años: "-", meses: "-", texto: "-" };
    }
  };

  // Obtener la lista de pacientes y discapacidades (solo pacientes del profesional logueado)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);

        const [pacientesRes, discapacidadesRes, tratamientosRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/paciente/listar"),
            axios.get("http://localhost:5000/api/discapacidad/listar"),
            axios.get("http://localhost:5000/api/tratamiento/listar"),
          ]);

        // Filtrar tratamientos activos del profesional
        const tratamientosProfesional = tratamientosRes.data.filter(
          (t) =>
            t.Idprof === idProfesionalLogeado &&
            (!t.Fecha_fin || new Date(t.Fecha_fin) >= new Date())
        );

        const idsPacientesProfesional = [
          ...new Set(tratamientosProfesional.map((t) => t.Idpac)),
        ];

        const pacientesFiltrados = pacientesRes.data
          .filter((p) => idsPacientesProfesional.includes(p.Idpac))
          .sort((a, b) => b.Idpac - a.Idpac);

        setPacientes(pacientesFiltrados);
        setDiscapacidades(discapacidadesRes.data || []);
        setCargando(false);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setCargando(false);
      }
    };

    fetchData();
  }, [idProfesionalLogeado]);

  // Mostrar detalles del paciente en modal (solo información personal)
  const mostrarDetallesPaciente = (paciente) => {
    // Manejo seguro de discapacidades
    const discapacidadPaciente =
      paciente.Tienediscapacidad?.toLowerCase() === "sí"
        ? Array.isArray(discapacidades)
          ? discapacidades.find(
              (d) => d.Iddiscapacidad === paciente.IdDiscapacidad
            )
          : null
        : null;

    setPacienteSeleccionado({
      ...paciente,
      discapacidad: discapacidadPaciente,
      discapacidades: discapacidadPaciente ? [discapacidadPaciente] : [], // Asegurar array
    });
    setMostrarModal(true);
  };

  const generarHistorialCompleto = (pacienteId) => {
    navigate(`/historial-clinico/${pacienteId}`);
  };

  const redirigirSesion = (idPac) => {
    navigate("/sesion", {
      state: {
        Idpac: idPac,
      },
    });
  };
  // Filtrar pacientes
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const cumpleFiltro = `${paciente.Nombre_pac} ${
      paciente.Appaterno_pac || ""
    } ${paciente.Apmaterno_pac || ""} ${paciente.Ci_pac}`
      .toLowerCase()
      .includes(filtro.toLowerCase());

    const cumpleDiscapacidad =
      filtroDiscapacidad === "todos" ||
      (filtroDiscapacidad === "si" &&
        paciente.Tienediscapacidad?.toLowerCase() === "sí") ||
      (filtroDiscapacidad === "no" &&
        paciente.Tienediscapacidad?.toLowerCase() !== "sí");

    const cumpleRangoEdad = () => {
      if (!rangoEdad.min && !rangoEdad.max) return true;

      const edad = calcularEdadCompleta(paciente.Fnaci_pac);
      if (edad.años === "-") return false;

      const edadNum = edad.años;
      const min = rangoEdad.min ? parseInt(rangoEdad.min) : 0;
      const max = rangoEdad.max ? parseInt(rangoEdad.max) : Infinity;

      return edadNum >= min && edadNum <= max;
    };

    return cumpleFiltro && cumpleDiscapacidad && cumpleRangoEdad();
  });
  return (
    <div className="pacientes-container">
      <div className="header-container">
        <h1>
          <FaUser /> Mis Pacientes en Tratamiento Activos
        </h1>
      </div>

      <div className="filtros-container">
        <div className="filtro-group">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por nombre o CI..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        <div className="filtro-group">
          <FaWheelchair />
          <select
            value={filtroDiscapacidad}
            onChange={(e) => setFiltroDiscapacidad(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="si">Con discapacidad</option>
            <option value="no">Sin discapacidad</option>
          </select>
        </div>

        <div className="filtro-group">
          <FaCalendarAlt />
          <input
            type="number"
            placeholder="Edad mínima"
            value={rangoEdad.min}
            onChange={(e) =>
              setRangoEdad({ ...rangoEdad, min: e.target.value })
            }
            min="0"
          />
          <span>a</span>
          <input
            type="number"
            placeholder="Edad máxima"
            value={rangoEdad.max}
            onChange={(e) =>
              setRangoEdad({ ...rangoEdad, max: e.target.value })
            }
            min="0"
          />
          <button
            className="btn-limpiar"
            onClick={() => setRangoEdad({ min: "", max: "" })}
            title="Limpiar filtro de edad"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="cargando">Cargando pacientes...</div>
      ) : (
        <div className="table-responsive">
          <table className="pacientes-table">
            <thead>
              <tr>
                <th>
                  <FaUser /> Nombre
                </th>
                <th>
                  <FaIdCard /> CI
                </th>
                <th>
                  <FaVenusMars /> Sexo
                </th>
                <th>
                  <FaCalendarAlt /> Edad
                </th>
                <th>
                  <FaPhone /> Teléfono
                </th>
                <th> PcD</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.length > 0 ? (
                pacientesFiltrados.map((paciente) => {
                  const edad = calcularEdadCompleta(paciente.Fnaci_pac);
                  return (
                    <tr key={paciente.Idpac}>
                      <td>
                        {paciente.Nombre_pac} {paciente.Appaterno_pac}{" "}
                        {paciente.Apmaterno_pac}
                      </td>
                      <td>{paciente.Ci_pac || "-"}</td>
                      <td>
                        {paciente.Genero_pac === "F" ? "Femenino" : "Masculino"}
                      </td>
                      <td>{edad.texto}</td>
                      <td>{paciente.Telefono_pac || "-"}</td>
                      <td>
                        <span
                          className={`badge ${
                            paciente.Tienediscapacidad?.toLowerCase() === "sí"
                              ? "badge-discapacidad"
                              : "badge-nodiscapacidad"
                          }`}
                        >
                          {paciente.Tienediscapacidad?.toLowerCase() === "sí"
                            ? "Sí"
                            : "No"}
                        </span>
                      </td>
                      <td className="acciones">
                        <button
                          className=" btn-detalle"
                          title="Ver detalles"
                          onClick={() => mostrarDetallesPaciente(paciente)}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() =>
                            generarHistorialCompleto(paciente.Idpac)
                          }
                          title="Generar historial completo"
                          className="btn-action"
                        >
                          <FaFileMedical />
                        </button>
                        <button
                          className="btn-action btn-editar"
                          title="Editar"
                          onClick={() =>
                            navigate(`/pacientes/editar/${paciente.Idpac}`)
                          }
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-action btn-sesion"
                          title="Realizar una sesión"
                          onClick={() => redirigirSesion(paciente.Idpac)}
                        >
                          <FaPlusCircle />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    No se encontraron pacientes{" "}
                    {filtro || rangoEdad.min || rangoEdad.max
                      ? "con esos filtros"
                      : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles del paciente (solo información personal) */}
      {mostrarModal && pacienteSeleccionado && (
        <div className="modal-detalle">
          <div className="modal-contenido">
            <div className="modal-header">
              <h2>Detalles del Paciente</h2>
              <button
                className="btn-cerrar"
                onClick={() => setMostrarModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="detalle-row">
                <div className="detalle-col">
                  <h3>Información Personal</h3>
                  <p>
                    <strong>Nombre completo:</strong>{" "}
                    {pacienteSeleccionado.Nombre_pac}{" "}
                    {pacienteSeleccionado.Appaterno_pac}{" "}
                    {pacienteSeleccionado.Apmaterno_pac}
                  </p>
                  <p>
                    <strong>CI:</strong>{" "}
                    {pacienteSeleccionado.Ci_pac || "No especificado"}
                  </p>
                  <p>
                    <strong>Género:</strong>{" "}
                    {pacienteSeleccionado.Genero_pac === "F"
                      ? "Femenino"
                      : "Masculino"}
                  </p>
                  <p>
                    <strong>Fecha de nacimiento:</strong>{" "}
                    {new Date(
                      pacienteSeleccionado.Fnaci_pac
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Edad:</strong>{" "}
                    {calcularEdadCompleta(pacienteSeleccionado.Fnaci_pac).texto}
                  </p>
                </div>

                <div className="detalle-col">
                  <h3>Información de Contacto</h3>
                  <p>
                    <strong>Teléfono:</strong>{" "}
                    {pacienteSeleccionado.Telefono_pac || "No especificado"}
                  </p>
                  <p>
                    <strong>Dirección:</strong>{" "}
                    {pacienteSeleccionado.Direccion_pac || "No especificado"}
                  </p>
                </div>
              </div>

              {/* Sección de discapacidad (si aplica) */}
              <div className="detalle-row">
                <div className="detalle-col">
                  <h3>Otros Datos</h3>
                  <p>
                    <strong>Discapacidad:</strong>
                    <span
                      className={`badge ${
                        pacienteSeleccionado.Tienediscapacidad?.toLowerCase() ===
                        "sí"
                          ? "badge-discapacidad"
                          : "badge-nodiscapacidad"
                      }`}
                    >
                      {pacienteSeleccionado.Tienediscapacidad?.toLowerCase() ===
                      "sí"
                        ? "Sí"
                        : "No"}
                    </span>
                  </p>

                  {pacienteSeleccionado.Tienediscapacidad?.toLowerCase() ===
                    "sí" && (
                    <>
                      {pacienteSeleccionado.discapacidad && (
                        <>
                          <h4>Detalles de Discapacidad</h4>
                          <p>
                            <strong>Tipo:</strong>{" "}
                            {pacienteSeleccionado.discapacidad.Tipo_disc ||
                              "No especificado"}
                          </p>
                          <p>
                            <strong>Grado:</strong>{" "}
                            {pacienteSeleccionado.discapacidad.Grado_disc ||
                              "No especificado"}
                          </p>
                          <p>
                            <strong>Observaciones:</strong>{" "}
                            {pacienteSeleccionado.discapacidad.Obs ||
                              "No especificado"}
                          </p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profesionales;
