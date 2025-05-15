// modelos/Diagnostico.js
const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

const Diagnostico = sequelize.define('Diagnostico', {
  Iddiagnostico: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Detalle_diag: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  idprof: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'diagnostico',
  timestamps: false
});

Diagnostico.associate = function(models) {

  Diagnostico.belongsTo(models.Paciente, {
    foreignKey: 'Idpac',
    as: 'paciente'
  });

  Diagnostico.belongsTo(models.ProfSalud, {
    foreignKey: 'Idprof',
    as: 'profesional'
  });
};

module.exports = Diagnostico;
