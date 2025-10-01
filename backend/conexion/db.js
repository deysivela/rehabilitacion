const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Opción 1: Si usas DATABASE_URL (recomendado para Render)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: console.log,
  dialectOptions: {
    ssl: process.env.DB_SSL ? {
      ca: process.env.DB_SSL_CERT || fs.readFileSync(path.resolve(__dirname, 'ca.pem'))
    } : undefined
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000
  }
});


// Probar conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida con la base de datos MySQL via Sequelize');
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error);
  }
}

testConnection();

module.exports = sequelize;