const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

const Sesion = sequelize.define('Sesion', {
  Idsesion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  Idcita: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'citasmd', // nombre de la tabla de citas
      key: 'Idcita'
    }
  },
  Idtrat: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tratamiento', // nombre de la tabla de tratamiento
      key: 'Idtrat'
    }
  }
}, {
  tableName: 'sesion',
  timestamps: false // Esto desactiva la creación automática de createdAt y updatedAt
});

module.exports = Sesion;