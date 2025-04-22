const { DataTypes } = require('sequelize');
const sequelize = require('../conexion/db');

    const Area = sequelize.define('Area', {
      Idarea: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      Nombre: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
      },
      Descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'Area',
      timestamps: false
    });
  
    module.exports = Area;
  