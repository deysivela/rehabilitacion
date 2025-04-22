const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

const Paciente = sequelize.define('Paciente', {
  Idpac: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nombre_pac: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  Appaterno_pac: {
    type: DataTypes.STRING(50)
  },
  Apmaterno_pac: {
    type: DataTypes.STRING(50)
  },
  Fnaci_pac: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Genero_pac: {
    type: DataTypes.ENUM('F', 'M')
  },
  Ci_pac: {
    type: DataTypes.STRING(20),
    unique: true
  },
  Telefono_pac: {
    type: DataTypes.STRING(20)
  },
  Direccion_pac: {
    type: DataTypes.TEXT
  },
  Seguro: {
    type: DataTypes.STRING(50)
  },
  Tienediscapacidad: {  // Cambiar el nombre de este atributo
    type: DataTypes.BOOLEAN
  },
  Diagnostico: {
    type: DataTypes.TEXT
  },
  Iddisc: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'discapacidad', // Nombre de la tabla referenciada
      key: 'Iddisc'
    }
  }
}, {
  tableName: 'paciente',
  timestamps: false
});
  
module.exports = Paciente;