const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');
const Discapacidad = require('./discapacidad');


const Paciente = sequelize.define('paciente', {
  Idpac: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Nombre_pac: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  Appaterno_pac: {
    type: DataTypes.STRING(50),
  },
  Apmaterno_pac: {
    type: DataTypes.STRING(50),
  },
  Fnaci_pac: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  Genero_pac: {
    type: DataTypes.ENUM('F', 'M'),
  },
  Ci_pac: {
    type: DataTypes.STRING(20),
    unique: true,
  },
  Telefono_pac: {
    type: DataTypes.STRING(20),
  },
  Direccion_pac: {
    type: DataTypes.TEXT,
  },
  Seguro: {
    type: DataTypes.STRING(50),
  },
  Discapacidad: {
    type: DataTypes.BOOLEAN,
  },
  Diagnostico: {
    type: DataTypes.TEXT,
  },
  Iddisc: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'discapacidad', // Tabla referenciada
      key: 'Iddisc',
    },
  },
}, {
  tableName: 'paciente',
  timestamps: false, 
});

module.exports = Paciente;

