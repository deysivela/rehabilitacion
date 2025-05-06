const Sequelize = require('sequelize');
const sequelize = require('../conexion/db');

const db = {};
db.sequelize = sequelize;

// Importar modelos
db.ProfSalud = require('./ProfSalud');
db.Paciente = require('./Paciente');
db.Discapacidad = require('./Discapacidad');
db.CitaMedica = require('./CitaMedica');
db.Sesion = require('./Sesion');
db.Tratamiento = require('./Tratamiento');
db.Tecnica = require('./Tecnica');
db.Area = require('./Area');

// Asociaciones

// CitaMedica pertenece a un Paciente y un Profesional de salud
db.CitaMedica.belongsTo(db.Paciente, { foreignKey: 'Idpac', as: 'paciente' });
db.CitaMedica.belongsTo(db.ProfSalud, { foreignKey: 'Idprof', as: 'profesional' });

// Una CitaMedica tiene muchas Sesiones
db.CitaMedica.hasMany(db.Sesion, { foreignKey: 'Idcita', as: 'sesiones' });

// Una Sesión pertenece a una CitaMedica y a un Tratamiento
db.Sesion.belongsTo(db.CitaMedica, { foreignKey: 'Idcita', as: 'cita' });
db.Sesion.belongsTo(db.Tratamiento, { foreignKey: 'Idtrat', as: 'tratamiento' });

// Un Tratamiento pertenece a un Paciente
db.Tratamiento.belongsTo(db.Paciente, { foreignKey: 'Idpac', as: 'paciente' });
db.Paciente.hasMany(db.Tratamiento, { foreignKey: 'Idpac', as: 'tratamientos' });

// Un Paciente tiene una Discapacidad
db.Paciente.hasOne(db.Discapacidad, { foreignKey: 'Iddisc', as: 'detalleDiscapacidad' });

// Un Profesional de salud pertenece a un Área
db.ProfSalud.belongsTo(db.Area, { foreignKey: 'Idarea', as: 'area' });

// Una Técnica pertenece a un Área
db.Tecnica.belongsTo(db.Area, { foreignKey: 'Idarea', as: 'area' });

// Un Área puede tener muchas Técnicas
db.Area.hasMany(db.Tecnica, { foreignKey: 'Idarea', as: 'tecnicas' });

module.exports = db;
