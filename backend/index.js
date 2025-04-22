const express = require('express');
const sequelize = require('./conexion/db');
const pacienteRutas = require('./rutas/paciente');
const usuarioRutas = require('./rutas/usuario');
const areaRutas = require('./rutas/area');
const discapacidadRutas = require('./rutas/discapacidad');
const profesionalRutas = require('./rutas/prof_salud');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRutas = require('./rutas/auth'); 
const asociacionesRutas = require('./rutas/asociaciones');


const app = express();
app.use(express.json());

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:3000', // Dirección del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
}));
// Rutas principales
app.use('/api/auth', authRutas);
app.use('/api/usuario', usuarioRutas);
app.use('/api/paciente', pacienteRutas);
app.use('/api/discapacidad', discapacidadRutas);
app.use('/api/asociaciones', asociacionesRutas);
app.use('/api/prof_salud', profesionalRutas);
app.use('/api/area', areaRutas);
// Sincronizar base de datos y arrancar el servidor
sequelize
  .sync()
  .then(() => {
    app.listen(5000, () => console.log('Servidor corriendo en http://localhost:5000'));
  })
  .catch((error) => console.error('Error al sincronizar la base de datos:', error));
