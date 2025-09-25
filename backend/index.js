const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./modelos'); 
// Rutas
const pacienteRutas = require('./rutas/paciente');
const usuarioRutas = require('./rutas/usuario');
const areaRutas = require('./rutas/area');
const estadisticasRutas = require('./rutas/estadisticas');
const discapacidadRutas = require('./rutas/discapacidad');
const profesionalRutas = require('./rutas/prof_salud');
const citaRutas = require('./rutas/cita');
const sesionRutas = require('./rutas/sesion');
const tratamientoRutas = require('./rutas/tratamiento');
const authRutas = require('./rutas/auth');
const tecnicaRutas = require('./rutas/tecnica');
const sesion_tecnicasRutas=require('./rutas/sesion_tecnica');
const actividadRutas=require('./rutas/actividad');
const indicadoresRutas= require('./rutas/indicadores');
const reportesRutas= require('./rutas/reportes');
const respaldoRutas=require('./rutas/respaldo');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Configuración de CORS
app.use(cors({
 origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-rol']
}));
// Rutas principales
app.use('/api/auth', authRutas);
app.use('/api/usuario', usuarioRutas);
app.use('/api/paciente', pacienteRutas);
app.use('/api/discapacidad', discapacidadRutas);
app.use('/api/prof_salud', profesionalRutas);
app.use('/api/cita', citaRutas);
app.use('/api/sesion', sesionRutas);
app.use('/api/tratamiento', tratamientoRutas);
app.use('/api/area', areaRutas);
app.use('/api/estadisticas', estadisticasRutas);
app.use('/api/tecnica', tecnicaRutas);
app.use('/api/sesion_tecnica',sesion_tecnicasRutas);
app.use('/api/actividad',actividadRutas);
app.use('/api/indicadores',indicadoresRutas);
app.use('/api/reportes',reportesRutas);
app.use('/api/respaldo',respaldoRutas);

// Conexión a la base de datos
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log(' Conexión a la base de datos establecida correctamente.');
    app.listen(PORT, () =>
      console.log(` Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error(' Error al conectar con la base de datos:', error);
  });

