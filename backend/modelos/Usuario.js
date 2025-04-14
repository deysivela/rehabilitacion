const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

const Usuario = sequelize.define(
  'Usuario',
  {
    Iduser: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    Pass: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Rol: {
      type: DataTypes.ENUM('Admin', 'Medico', 'Auxiliar', 'Otro'),
      allowNull: false,
    },
    Activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    Idprof: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Prof_salud', // Tabla referenciada
        key: 'Idprof',
      },
    },
  },
  {
    tableName: 'usuario', 
    timestamps: false, 
  }
);

module.exports = Usuario;
