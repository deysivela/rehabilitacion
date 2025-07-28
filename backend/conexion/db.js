require('dotenv').config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,       // database
  process.env.DB_USER,       // user
  process.env.DB_PASSWORD,   // password
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
