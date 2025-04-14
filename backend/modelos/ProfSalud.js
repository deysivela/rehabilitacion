const { Model, DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

class ProfSalud extends Model {}

ProfSalud.init(
  {
    Idprof: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    Nombre_prof: { type: DataTypes.STRING, allowNull: false },
    Appaterno_prof: { type: DataTypes.STRING, allowNull: false },
    Apmaterno_prof: { type: DataTypes.STRING },
    Especialidad: { type: DataTypes.STRING },
    // Otros campos...
  },
  {
    sequelize,
    modelName: 'ProfSalud',
    tableName: 'prof_salud',
    timestamps: false,
  }
);

module.exports = ProfSalud;
