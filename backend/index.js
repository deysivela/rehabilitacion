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
app.use('/auth', authRutas);
app.use('/usuario', usuarioRutas);
app.use('/paciente', pacienteRutas);
app.use('/discapacidad', discapacidadRutas);
app.use('/prof_salud', profesionalRutas);
app.use('/cita', citaRutas);
app.use('/sesion', sesionRutas);
app.use('/tratamiento', tratamientoRutas);
app.use('/area', areaRutas);
app.use('/estadisticas', estadisticasRutas);
app.use('/tecnica', tecnicaRutas);
app.use('/sesion_tecnica',sesion_tecnicasRutas);
app.use('/actividad',actividadRutas);
app.use('/indicadores',indicadoresRutas);
app.use('/reportes',reportesRutas);
app.use('/respaldo',respaldoRutas);

app.get('/', (req, res) => {
  res.send('API de Rehabilitación: usa /auth, /paciente, etc.');
});

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

