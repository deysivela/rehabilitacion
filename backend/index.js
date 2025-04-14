const express = require('express');
const sequelize = require('./conexion/db');
const pacienteRoutes = require('./rutas/paciente');
const usuarioRoutes = require('./rutas/usuario');
const discapacidadRoutes = require('./rutas/discapacidad');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./rutas/auth'); 
const asociaciones=require('./rutas/asociaciones');const asociacionesRoutes = require('./rutas/asociaciones');


const app = express();
app.use(express.json());

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:3000', // Dirección del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
}));
// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/paciente', pacienteRoutes);
app.use('/api/discapacidad', discapacidadRoutes);
app.use('/api/asociaciones', asociacionesRoutes);
// Sincronizar base de datos y arrancar el servidor
sequelize
  .sync()
  .then(() => {
    app.listen(5000, () => console.log('Servidor corriendo en http://localhost:5000'));
  })
  .catch((error) => console.error('Error al sincronizar la base de datos:', error));
