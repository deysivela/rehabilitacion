const { DataTypes } = require("sequelize");
const sequelize = require("../conexion/db");

const Actividad = sequelize.define("Actividad", {
  Idact: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  Actividad: {
    type: DataTypes.STRING(255)
  },
  Tipo: {
    type: DataTypes.STRING(50)
  },
  Lugar: {
    type: DataTypes.STRING(255)
  },
  Resultado: {
    type: DataTypes.TEXT
  },
  Medio_ver: {
    type: DataTypes.TEXT
  },
  Idprof: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: "actividades",
  timestamps: false
});

module.exports = Actividad;
