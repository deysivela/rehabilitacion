const { Model, DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

class ProfSalud extends Model {}

ProfSalud.init(
  {
    Idprof: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    Nombre_prof: { type: DataTypes.STRING, allowNull: false },
    Appaterno_prof: { type: DataTypes.STRING, allowNull: false },
    Apmaterno_prof: { type: DataTypes.STRING },
    Ci_prof: { type: DataTypes.STRING, unique: true },
    Fnaci_prof: { type: DataTypes.DATE, allowNull: false },
    Genero_prof: { type: DataTypes.ENUM('F', 'M') },
    Especialidad: { type: DataTypes.STRING },
    Telefono_prof: { type: DataTypes.STRING },
    Idarea: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Area',
        key: 'Idarea',
      },
    },
  },
  {
    sequelize,
    modelName: 'ProfSalud',
    tableName: 'prof_salud',
    timestamps: false,
  }
);

module.exports = ProfSalud;

