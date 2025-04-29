const { Model, DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

class Discapacidad extends Model {
  static associate(models) {
    Discapacidad.hasOne(models.Paciente, {
      foreignKey: 'Iddisc',
      as: 'persona'
    });
  }
}

Discapacidad.init({
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
  sequelize,
  modelName: 'Discapacidad',
  tableName: 'discapacidad',
  timestamps: false
});

module.exports = Discapacidad;
