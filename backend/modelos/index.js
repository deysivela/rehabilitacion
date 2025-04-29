// modelos/index.js
const Sequelize = require('sequelize');
const sequelize = require('../conexion/db');

const db = {};

db.sequelize = sequelize;

// Importa los modelos
const ProfSalud = require('./ProfSalud');
const Paciente = require('./Paciente');
db.Area = require('./Area');
const Discapacidad = require('./Discapacidad');
const CitaMedica = require('./CitaMedica');

// Agrega los modelos al objeto db
db.ProfSalud = ProfSalud;
db.Paciente = Paciente;
db.Discapacidad = Discapacidad;
db.CitaMedica = CitaMedica;

// Establecer asociaciones (si existen)
CitaMedica.belongsTo(Paciente, { foreignKey: 'Idpac', as: 'paciente' });
CitaMedica.belongsTo(ProfSalud, { foreignKey: 'Idprof', as: 'profesional' });

Paciente.hasOne(Discapacidad, { foreignKey: 'Iddisc', as: 'detalleDiscapacidad' }); 
ProfSalud.belongsTo(db.Area, { foreignKey: 'Idarea', as: 'area' });
module.exports = db;

