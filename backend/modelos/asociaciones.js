const Paciente = require('./paciente');
const Discapacidad = require('./discapacidad');

Paciente.belongsTo(Discapacidad, {
  foreignKey: 'Iddisc',
  as: 'detalleDiscapacidad' 
});

Discapacidad.hasOne(Paciente, {
  foreignKey: 'Iddisc',
  as: 'persona'  
});

module.exports = { Paciente, Discapacidad };



