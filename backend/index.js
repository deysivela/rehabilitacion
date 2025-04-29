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
const authRutas = require('./rutas/auth');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rutas principales
app.use('/api/auth', authRutas);
app.use('/api/usuario', usuarioRutas);
app.use('/api/paciente', pacienteRutas);
app.use('/api/discapacidad', discapacidadRutas);
app.use('/api/prof_salud', profesionalRutas);
app.use('/api/cita', citaRutas);
app.use('/api/area', areaRutas);
app.use('/api/estadisticas', estadisticasRutas);

// Conexión a la base de datos
sequelize.authenticate()
  .then(() => {
    console.log(' Conexión a la base de datos establecida correctamente.');
    app.listen(5000, () => console.log(' Servidor corriendo en http://localhost:5000'));
  })
  .catch((error) => {
    console.error(' Error al conectar con la base de datos:', error);
  });
