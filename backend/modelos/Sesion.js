const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

const Sesion = sequelize.define('Sesion', {
  Idsesion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Idpac: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Idprof: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  Hora_ini: {
    type: DataTypes.TIME,
    allowNull: false
  },
  Hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  Tipo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Atencion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Notas: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Novedades: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Idtrat: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'sesion',
  timestamps: false
});

module.exports = Sesion;
