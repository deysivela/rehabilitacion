const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

const Sesion_Tecnica = sequelize.define('Sesion_Tecnica', {
  Idsesion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'sesion', key: 'Idsesion' },
    onDelete: 'CASCADE'
  },
  Idtec: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'tecnicas', key: 'Idtec' },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'sesion_tecnica',
  timestamps: false
});

module.exports = Sesion_Tecnica;
