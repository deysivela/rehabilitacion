const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

const Discapacidad = sequelize.define('Discapacidad', {
    Iddisc: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    Tipo_disc: {
      type: DataTypes.ENUM('FÍSICA', 'INTELECTUAL', 'MÚLTIPLE', 'VISUAL', 'AUDITIVO', 'MENTAL'),
      allowNull: false
    },
    Grado_disc: {
      type: DataTypes.ENUM('Moderado', 'Grave', 'Muy Grave'),
      allowNull: false
    },
    Obs: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'discapacidad', // Nombre de la tabla en la BD
    timestamps: false
  });
 

  module.exports = Discapacidad;