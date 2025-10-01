const { Sequelize } = require('sequelize');

// CONEXIÓN MÍNIMA PARA PRUEBAS - elimina SSL temporalmente
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: console.log,
  // Quitamos dialectModule temporalmente
  // dialectModule: require('mysql2'),
  dialectOptions: {
    // SSL simplificado
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  },
  retry: {
    max: 3
  }
});

// O versión MÁS simple sin SSL:
// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: 'mysql',
//   logging: console.log
// });

sequelize.authenticate()
  .then(() => console.log('✅ Conexión establecida con MySQL'))
  .catch((error) => console.error('❌ Error conectando a MySQL:', error));

module.exports = sequelize;