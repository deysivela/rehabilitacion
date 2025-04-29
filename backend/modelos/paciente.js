// modelos/paciente.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../conexion/db');

class Paciente extends Model {
  static associate(models) {
    Paciente.belongsTo(models.Discapacidad, {
      foreignKey: 'Iddisc',
      as: 'detalleDiscapacidad'
    });
  }
}

Paciente.init(
  {
    Idpac: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Nombre_pac: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Appaterno_pac: {
      type: DataTypes.STRING(50)
    },
    Apmaterno_pac: {
      type: DataTypes.STRING(50)
    },
    Fnaci_pac: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Genero_pac: {
      type: DataTypes.ENUM('F', 'M')
    },
    Ci_pac: {
      type: DataTypes.STRING(20),
      unique: true
    },
    Telefono_pac: {
      type: DataTypes.STRING(20)
    },
    Direccion_pac: {
      type: DataTypes.TEXT
    },
    Seguro: {
      type: DataTypes.STRING(50)
    },
    Tienediscapacidad: {
      type: DataTypes.BOOLEAN
    },
    Iddisc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'discapacidad',
        key: 'Iddisc'
      }
    },
    Diagnostico: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    modelName: 'Paciente',
    tableName: 'paciente',
    timestamps: false
  }
);


module.exports = Paciente;
