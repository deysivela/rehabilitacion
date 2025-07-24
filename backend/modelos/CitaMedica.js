// modelos/CitaMedica.js
const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

const CitaMedica = sequelize.define("CitaMedica", {
  Idcita: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha_cita: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_cita: {
    type: DataTypes.TIME,
    allowNull: false
  },
  motivo_cita: {
    type: DataTypes.TEXT
  },
  estado_cita: {
    type: DataTypes.TEXT
  },
  Idpac: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Idprof: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'citasmd',
  timestamps: false
});

module.exports = CitaMedica;
