const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

const Condicion = sequelize.define('Condicion', {
  id_cond: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_cond' 
  },
  condicion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true 
  }
}, {
  tableName: 'Condicion',
  timestamps: false
});

module.exports = Condicion;