const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

const Tecnica = sequelize.define(
  'Tecnica',
  {
    Idtec: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    Idarea: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'area', // nombre de la tabla referenciada
        key: 'Idarea',
      },
    },
  },
  {
    tableName: 'tecnicas',
    timestamps: false,
  }
);

module.exports = Tecnica;
