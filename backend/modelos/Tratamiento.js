const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

const Tratamiento = sequelize.define(
  'Tratamiento',
  {
    Idtrat: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    diagnostico: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Fecha_ini: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    Fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    Idpac: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Estado: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Obs: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Razon: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Idprof: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'tratamiento',
    timestamps: false,
  }
);

// Asociación con Paciente (si usas el patrón associate)
Tratamiento.associate = function(models) {
  Tratamiento.belongsTo(models.Paciente, {
    foreignKey: 'Idpac',
    as: 'paciente',
  });
};

module.exports = Tratamiento;
